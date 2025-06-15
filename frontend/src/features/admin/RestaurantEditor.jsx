import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Link as LinkIcon, Image } from 'lucide-react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { RestaurantImageUploader } from '../restaurants/components';
import { getCategoriesList } from '../restaurants/constants/categories';

// Добавим список категорий с правильными значениями для БД и отображения
const RESTAURANT_CATEGORIES = {
    italian: 'Итальянская кухня',
    asian: 'Азиатская кухня',
    russian: 'Русская кухня',
    seafood: 'Морепродукты',
    french: 'Французская кухня',
    georgian: 'Грузинская кухня',
    mexican: 'Мексиканская кухня',
    american: 'Американская кухня'
};

const RestaurantEditor = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [restaurant, setRestaurant] = useState({
        name: '',
        address: '',
        description: '',
        imageUrl: '',
        website: '',
        contactPhone: '',
        isActive: true,
        slug: '',
        autoGenerateLink: true,
        category: '',
        priceRange: '₽₽',
        minPrice: '',
        deliveryTimeMin: '',
        deliveryTimeMax: '',
        workingHours: {
            openTime: '10:00',
            closeTime: '22:00'
        }
    });
    
    // Получаем список категорий из констант
    const categories = getCategoriesList();

    // Function to validate and process image URL
    const processImageUrl = (url) => {
        if (!url) return '';
        
        // If it's already a valid URL, return it
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/uploads/')) {
            return url;
        }
        
        // Try to convert to a valid URL
        try {
            // If it contains a valid URL without protocol, add the protocol
            if (url.includes('.') && !url.includes(' ')) {
                if (!url.match(/^[a-zA-Z]+:\/\//)) {
                    return 'https://' + url;
                }
            }
        } catch (e) {
            console.error('Error processing URL:', e);
        }
        
        return url;
    };

    // Check if user is admin
    useEffect(() => {
        if (!user || !user.token || !['admin', 'head_admin'].includes(user.role)) {
            navigate('/');
        }
    }, [user, navigate]);

    // Load restaurant data if editing
    useEffect(() => {
        if (isNew) return;
        
        const fetchRestaurant = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/restaurants/${id}`);
                const restaurantData = response.data.restaurant;
                const isActive = restaurantData.is_active === 1 || restaurantData.is_active === true;
                
                setRestaurant({
                    name: restaurantData.name || '',
                    address: restaurantData.address || '',
                    description: restaurantData.description || '',
                    imageUrl: restaurantData.image_url || '',
                    website: restaurantData.website || '',
                    contactPhone: restaurantData.contact_phone || '',
                    isActive: isActive,
                    slug: restaurantData.slug || '',
                    autoGenerateLink: true,
                    category: restaurantData.category || '',
                    priceRange: restaurantData.price_range || '₽₽',
                    minPrice: restaurantData.min_price || '',
                    deliveryTimeMin: restaurantData.delivery_time ? restaurantData.delivery_time.split('-')[0] : '',
                    deliveryTimeMax: restaurantData.delivery_time ? restaurantData.delivery_time.split('-')[1] : '',
                    workingHours: {
                        openTime: restaurantData.hours ? restaurantData.hours.split('-')[0].trim() : '10:00',
                        closeTime: restaurantData.hours ? restaurantData.hours.split('-')[1].trim() : '22:00'
                    }
                });
            } catch (error) {
                console.error('Error loading restaurant:', error);
                setError(`Не удалось загрузить данные ресторана: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurant();
    }, [id, isNew]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // Special handling for imageUrl field
        if (name === 'imageUrl') {
            setRestaurant(prev => ({
                ...prev,
                [name]: value // Store raw value for editing
            }));
            return;
        }

        // Special handling for deliveryTime field
        if (name === 'deliveryTimeMin' || name === 'deliveryTimeMax') {
            // Разрешаем вводить только цифры
            if (value === '' || /^[\d]*$/.test(value)) {
                setRestaurant(prev => ({
                    ...prev,
                    [name]: value
                }));
            }
            return;
        }
        
        setRestaurant(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle image upload success
    const handleImageUploaded = (imageUrl) => {
        setRestaurant(prev => ({
            ...prev,
            imageUrl: imageUrl
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
        // Validate restaurant name
        if (!restaurant.name.trim()) {
            setError('Название ресторана обязательно для заполнения');
            setSaving(false);
            return;
        }

        // Validate restaurant name format
        const nameRegex = /^[А-Яа-яA-Za-z0-9\s\-&№]+$/;
        if (!nameRegex.test(restaurant.name)) {
            setError('Название ресторана может содержать только русские и английские буквы, цифры, пробелы и дефисы');
            setSaving(false);
            return;
        }

        // Generate slug from restaurant name
        let slug = restaurant.autoGenerateLink 
            ? restaurant.name
                .toLowerCase()
                .trim()
                .replace(/[^a-zA-Zа-яА-Я0-9\s-]/g, '')
                .replace(/[\s]+/g, '-')
            : restaurant.slug;

        // Ensure slug is not empty and valid
        if (!slug || slug.trim() === '') {
            slug = `restaurant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }

        // Validate delivery time
        const minTime = parseInt(restaurant.deliveryTimeMin, 10);
        const maxTime = parseInt(restaurant.deliveryTimeMax, 10);
        
        if (isNaN(minTime) || isNaN(maxTime) || minTime < 0 || maxTime < 0) {
            setError('Время доставки должно быть положительным числом');
            setSaving(false);
            return;
        }

        if (minTime >= maxTime) {
            setError('Минимальное время доставки должно быть меньше максимального');
            setSaving(false);
            return;
        }

        // Validate working hours
        if (!restaurant.workingHours.openTime || !restaurant.workingHours.closeTime) {
            setError('Пожалуйста, укажите время открытия и закрытия ресторана');
            setSaving(false);
            return;
        }

            // Validate category
            if (!restaurant.category) {
                setError('Пожалуйста, выберите категорию ресторана');
                setSaving(false);
                return;
            }

            // Format the data to match the expected API format
            const formData = {
                name: restaurant.name.trim(),
                address: restaurant.address,
                description: restaurant.description,
                imageUrl: restaurant.imageUrl,
                website: restaurant.website,
                contactPhone: restaurant.contactPhone,
                isActive: restaurant.isActive,
                slug: slug,
                category: restaurant.category, // Это уже правильное значение для БД (например, 'italian')
                price_range: restaurant.priceRange,
                min_price: parseInt(restaurant.minPrice, 10) || 0,
                delivery_time: `${minTime}-${maxTime}`,
                hours: `${restaurant.workingHours.openTime}-${restaurant.workingHours.closeTime}`
            };
            
            console.log("Отправляемые данные:", formData);
            console.log("Генерированный slug:", slug);
            
            let response;
            
            if (isNew) {
                response = await api.post('/restaurants', formData);
                setRestaurant({
                    name: '',
                    address: '',
                    description: '',
                    imageUrl: '',
                    website: '',
                    contactPhone: '',
                    isActive: true,
                    slug: '',
                    autoGenerateLink: true,
                    category: '',
                    priceRange: '₽₽',
                    minPrice: '',
                    deliveryTimeMin: '',
                    deliveryTimeMax: '',
                    workingHours: {
                        openTime: '10:00',
                        closeTime: '22:00'
                    }
                });
                alert('Ресторан успешно создан!');
            } else {
                response = await api.put(`/restaurants/${id}`, formData);
                navigate('/admin');
            }
        } catch (error) {
            console.error('Error saving restaurant:', error);
            setError(error.response?.data?.message || 'Ошибка при сохранении ресторана');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }
    
    // Function to show image preview
    const getImagePreview = () => {
        if (!restaurant.imageUrl) return null;
        
        const processedUrl = processImageUrl(restaurant.imageUrl);
        if (!processedUrl) return null;
        
        return (
            <div className="mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Предпросмотр:</p>
                <div className="h-24 w-48 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden relative">
                    <img 
                        src={processedUrl} 
               
                        className="h-full w-full object-cover"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGMEYwRjAiLz48cGF0aCBkPSJNODAgMTEwSDEyME0xMDAgOTBWMTMwIiBzdHJva2U9IiNBMEEwQTAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+';
                        }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-4 sm:py-6">
            <div className="mb-4 sm:mb-6 flex items-center">
                <button 
                    onClick={() => navigate('/admin')} 
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
                >
                    <ArrowLeft size={16} className="mr-1" />
                    <span className="text-sm sm:text-base">Назад</span>
                </button>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white ml-4 sm:ml-6">
                    {isNew ? 'Добавление нового ресторана' : 'Редактирование ресторана'}
                </h1>
            </div>
            
            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md text-sm">
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Название ресторана
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={restaurant.name}
                            onChange={handleChange}
                            pattern="[А-Яа-яA-Za-z0-9\s\-&№]+"
                            title="Разрешены русские и английские буквы, цифры, пробелы, дефисы"
                            required
                            className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Адрес
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={restaurant.address}
                                onChange={handleChange}
                                className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Описание
                        </label>
                        <textarea
                            name="description"
                            value={restaurant.description}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            
                            
                            <div className="mt-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Или укажите URL изображения:</p>
                                <input
                                    type="text"
                                    name="imageUrl"
                                    value={restaurant.imageUrl}
                                    onChange={handleChange}
                                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                            
                            {restaurant.imageUrl && getImagePreview()}
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Веб-сайт
                            </label>
                            <input
                                type="text"
                                name="website"
                                value={restaurant.website}
                                onChange={handleChange}
                                className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Телефон
                            </label>
                            <input
                                type="text"
                                name="contactPhone"
                                value={restaurant.contactPhone}
                                onChange={handleChange}
                                className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Активный ресторан
                            </label>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center h-full pt-6">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        name="isActive"
                                        checked={restaurant.isActive}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                                    />
                                    <label htmlFor="isActive" className="ml-2 block text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                        Активный ресторан
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                URL для страницы ресторана
                            </label>
                            <div className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    id="autoGenerateLink"
                                    name="autoGenerateLink"
                                    checked={restaurant.autoGenerateLink}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                                />
                                <label htmlFor="autoGenerateLink" className="ml-2 block text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                    Генерировать URL автоматически на основе названия
                                </label>
                            </div>
                            
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm">
                                    /restaurant/
                                </span>
                                <input
                                    type="text"
                                    name="slug"
                                    value={restaurant.slug}
                                    onChange={handleChange}
                                    disabled={restaurant.autoGenerateLink}
                                    placeholder={restaurant.autoGenerateLink ? "Будет сгенерирован автоматически" : "пример-названия-ресторана"}
                                    className={`
                                        flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md 
                                        focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                                        ${restaurant.autoGenerateLink ? 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'}
                                    `}
                                />
                            </div>
                            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                <LinkIcon size={14} className="mr-1" /> 
                                {restaurant.autoGenerateLink 
                                    ? "URL будет создан автоматически на основе названия ресторана" 
                                    : "URL должен содержать только латинские буквы, цифры и дефисы"}
                            </p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Категория ресторана *
                            </label>
                            <select
                                name="category"
                            value={restaurant.category || ''}
                                onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            required
                            >
                                <option value="">Выберите категорию</option>
                            {Object.entries(RESTAURANT_CATEGORIES).map(([dbValue, displayName]) => (
                                <option key={dbValue} value={dbValue}>
                                    {displayName}
                                    </option>
                                ))}
                            </select>
                        </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Ценовой диапазон
                            </label>
                            <select
                                name="priceRange"
                                value={restaurant.priceRange}
                                onChange={handleChange}
                                className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="₽">₽ - Недорого</option>
                                <option value="₽₽">₽₽ - Средне</option>
                                <option value="₽₽₽">₽₽₽ - Высокие цены</option>
                                <option value="₽₽₽₽">₽₽₽₽ - Очень дорого</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Минимальная цена заказа (₽)
                            </label>
                            <input
                                type="number"
                                name="minPrice"
                                value={restaurant.minPrice}
                                onChange={handleChange}
                                placeholder="Например: 500"
                                min="0"
                                step="1"
                                required
                                className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Введите целое положительное число
                            </p>
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Время доставки (мин)
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <input
                                        type="number"
                                        name="deliveryTimeMin"
                                        value={restaurant.deliveryTimeMin}
                                        onChange={handleChange}
                                        placeholder="Минимум"
                                        min="1"
                                        max="999"
                                        step="1"
                                        required
                                        className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        name="deliveryTimeMax"
                                        value={restaurant.deliveryTimeMax}
                                        onChange={handleChange}
                                        placeholder="Максимум"
                                        min="1"
                                        max="999"
                                        step="1"
                                        required
                                        className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Укажите минимальное и максимальное время доставки в минутах
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Время открытия
                            </label>
                            <input
                                type="time"
                                value={restaurant.workingHours.openTime}
                                onChange={(e) => setRestaurant(prev => ({
                                    ...prev,
                                    workingHours: {
                                        ...prev.workingHours,
                                        openTime: e.target.value
                                    }
                                }))}
                                className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Время закрытия
                            </label>
                            <input
                                type="time"
                                value={restaurant.workingHours.closeTime}
                                onChange={(e) => setRestaurant(prev => ({
                                    ...prev,
                                    workingHours: {
                                        ...prev.workingHours,
                                        closeTime: e.target.value
                                    }
                                }))}
                                className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row mt-3 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center mb-3 sm:mb-0">
                            <input
                                type="checkbox"
                                id="featured"
                                checked={restaurant.featured}
                                onChange={(e) => setRestaurant(prev => ({ ...prev, featured: e.target.checked }))}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                            />
                            <label htmlFor="featured" className="ml-2 block text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                Отображать на главной странице
                            </label>
                        </div>
                        <div className="sm:ml-auto">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded flex items-center text-sm disabled:opacity-50 w-full sm:w-auto justify-center"
                            >
                                {saving ? (
                                    <>Сохранение...</>
                                ) : (
                                    <>
                                        <Save size={16} className="mr-2" />
                                        {isNew ? 'Создать ресторан' : 'Сохранить изменения'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default RestaurantEditor; 