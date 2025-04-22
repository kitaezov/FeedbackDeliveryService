import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Link as LinkIcon, Image } from 'lucide-react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

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
        deliveryTime: ''
    });
    
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
                
                // Check if response has the expected structure
                if (!response.data) {
                    throw new Error('Invalid API response: Missing data');
                }
                
                // Check different possible response structures
                const restaurantData = response.data.restaurant || response.data;
                
                // Check if restaurantData exists and has the expected properties
                if (!restaurantData || typeof restaurantData !== 'object') {
                    throw new Error('Restaurant data not found or invalid');
                }
                
                // Convert isActive from 0/1 to boolean if needed
                const isActive = restaurantData.is_active !== undefined 
                    ? Boolean(restaurantData.is_active) 
                    : true; // Default to true if not provided
                
                // Set form state with safe fallbacks for all properties
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
                    deliveryTime: restaurantData.delivery_time || ''
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
        
        setRestaurant(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            // Validate required fields
            if (!restaurant.name.trim()) {
                setError('Название ресторана обязательно');
                setSaving(false);
                return;
            }

            // Generate slug from name if autoGenerateLink is true
            let slug = restaurant.slug;
            if (restaurant.autoGenerateLink || !slug || slug.trim() === '') {
                slug = restaurant.name
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '') // Remove non-word chars
                    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
                    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
            }

            // Ensure slug is not empty
            if (!slug || slug.trim() === '') {
                setError('Не удалось создать URL для страницы ресторана');
                setSaving(false);
                return;
            }
            
            // Process image URL
            const processedImageUrl = processImageUrl(restaurant.imageUrl);

            const formData = {
                name: restaurant.name.trim(),
                address: restaurant.address.trim(),
                description: restaurant.description.trim(),
                image_url: processedImageUrl,
                website: restaurant.website.trim(),
                contact_phone: restaurant.contactPhone.trim(),
                is_active: restaurant.isActive,
                slug: slug,
                category: restaurant.category.trim(),
                price_range: restaurant.priceRange,
                min_price: restaurant.minPrice,
                delivery_time: restaurant.deliveryTime,
                autoGenerateLink: restaurant.autoGenerateLink
            };

            console.log('Sending restaurant data:', formData);

            let response;
            if (isNew) {
                response = await api.post('/restaurants', formData);
            } else {
                response = await api.put(`/restaurants/${id}`, formData);
            }

            navigate('/admin');
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
                        alt="Preview" 
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
        <div className="container mx-auto px-4 py-4 sm:py-8">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                    <div>
                        <h1 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white">
                            {isNew ? 'Добавить новый ресторан' : 'Редактировать ресторан'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            {isNew ? 'Заполните форму для создания нового ресторана' : 'Измените данные существующего ресторана'}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/admin')}
                        className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded flex items-center text-sm"
                    >
                        <ArrowLeft size={16} className="mr-1" /> Назад
                    </button>
                </div>

                {error && (
                    <div className="p-3 sm:p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded mx-3 sm:mx-6 mt-3 sm:mt-6 text-sm sm:text-base">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4 dark:text-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Название ресторана
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={restaurant.name}
                                onChange={handleChange}
                                className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
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
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                <Image size={14} className="mr-1" /> URL изображения
                            </label>
                            <input
                                type="text"
                                name="imageUrl"
                                value={restaurant.imageUrl}
                                onChange={handleChange}
                                className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Укажите полный URL изображения (http://example.com/image.jpg)
                            </p>
                            {getImagePreview()}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Категория кухни
                            </label>
                            <input
                                type="text"
                                name="category"
                                value={restaurant.category}
                                onChange={handleChange}
                                placeholder="Разная, Итальянская, Японская и т.д."
                                className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
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
                                className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Время доставки (мин)
                            </label>
                            <input
                                type="text"
                                name="deliveryTime"
                                value={restaurant.deliveryTime}
                                onChange={handleChange}
                                placeholder="Например: 30-60"
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
                </form>
            </div>
        </div>
    );
};

export default RestaurantEditor; 