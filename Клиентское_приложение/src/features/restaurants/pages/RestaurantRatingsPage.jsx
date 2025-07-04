import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Search, Filter, ArrowLeft, Award, ChevronDown, Clock, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import BackgroundParticles from '../../../components/BackgroundParticles';
import LoadingSpinner from '../../../components/LoadingSpinner';
import AnimatedButton from '../../../components/AnimatedButton';
import api from '../../../utils/api';
import { RESTAURANT_CATEGORIES } from '../constants/categories';

const RestaurantRatingsPage = () => {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [restaurants, setRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('rating');
    const [showSortOptions, setShowSortOptions] = useState(false);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');

    // Получаем список категорий из констант
    const categories = [
        { id: 'all', name: 'Все рестораны' },
        ...Object.entries(RESTAURANT_CATEGORIES)
            .filter(([id]) => id !== 'all')
            .map(([id, name]) => ({
                id,
                name,
                cuisine: name.replace(' кухня', '')
            }))
    ];

    // Функция для загрузки ресторанов с учетом поиска и категории
    const fetchRestaurants = async (searchQuery = '', categoryId = 'all') => {
        try {
            setLoading(true);
            setError(null);

            console.log('Fetching restaurants with:', { searchQuery, categoryId });

            let endpoint = '/restaurants';
            const params = {};

            // Если есть поисковый запрос, используем эндпоинт поиска
            if (searchQuery.trim()) {
                endpoint = '/restaurants/search';
                params.q = searchQuery.trim();
            }

            // Добавляем категорию в параметры, если она не "все"
            if (categoryId !== 'all') {
                params.category = categoryId;
            }

            console.log('Making request to:', endpoint, 'with params:', params);

            const response = await api.get(endpoint, { params });

            console.log('Response from server:', response.data);

            // Обработка данных в зависимости от эндпоинта
            const restaurantsData = endpoint === '/restaurants/search' 
                ? response.data.restaurants 
                : response.data;

            const processedRestaurants = (Array.isArray(restaurantsData) ? restaurantsData : [])
                .map(restaurant => ({
                    ...restaurant,
                    avgRating: typeof restaurant.avg_rating === 'number' ? restaurant.avg_rating : 0,
                    reviewCount: typeof restaurant.review_count === 'number' ? restaurant.review_count : 0,
                    category: restaurant.category || 'all'
                }));

            console.log('Processed restaurants:', processedRestaurants);

            setRestaurants(processedRestaurants);
            setFilteredRestaurants(processedRestaurants);
        } catch (err) {
            console.error('Failed to fetch restaurants:', err);
            setError('Не удалось загрузить рестораны. Пожалуйста, попробуйте позже.');
            setRestaurants([]);
            setFilteredRestaurants([]);
        } finally {
            setLoading(false);
        }
    };

    // Загрузка ресторанов при монтировании компонента
    useEffect(() => {
        fetchRestaurants();
    }, []);

    // Обработчик изменения категории
    const handleCategoryChange = async (categoryId) => {
        setActiveCategory(categoryId);
        await fetchRestaurants(searchTerm, categoryId);
    };

    // Обработчик поиска с debounce
    const handleSearch = async (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        await fetchRestaurants(term, activeCategory);
    };

    // Обработчик сортировки
    const handleSort = (sortType) => {
        setSortBy(sortType);
        setShowSortOptions(false);
        
        const sorted = [...filteredRestaurants].sort((a, b) => {
            switch (sortType) {
                case 'rating':
                    return b.avgRating - a.avgRating;
                case 'price':
                    return (a.min_price || 0) - (b.min_price || 0);
                case 'popular':
                    return b.reviewCount - a.reviewCount;
                case 'newest':
                    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
                default:
                    return 0;
            }
        });
        
        setFilteredRestaurants(sorted);
    };

    const getSortLabel = () => {
        switch (sortBy) {
            case 'rating': return 'По рейтингу';
            case 'price': return 'По цене';
            case 'popular': return 'По популярности';
            case 'newest': return 'Сначала новые';
            default: return 'По рейтингу';
        }
    };

    // Варианты анимации карточек
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const themeClasses = {
        background: isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800',
        card: isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
        highlight: isDarkMode ? 'text-indigo-400' : 'text-indigo-600',
        input: isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
        button: isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-800 hover:bg-gray-100'
    };

    // Получить цвет рейтинга на основе оценки
    const getRatingColor = (rating) => {
        if (!rating || rating === 0) return isDarkMode ? 'text-gray-400' : 'text-gray-500';
        if (rating >= 4.5) return isDarkMode ? 'text-emerald-400' : 'text-emerald-600';
        if (rating >= 4.0) return isDarkMode ? 'text-green-400' : 'text-green-600';
        if (rating >= 3.5) return isDarkMode ? 'text-yellow-400' : 'text-yellow-500';
        return isDarkMode ? 'text-red-400' : 'text-red-600';
    };

    // Рендеринг рейтинга звезд
    const renderStars = (rating) => (
        <div className="flex">
            {[1, 2, 3, 4, 5].map(star => (
                <span
                    key={star}
                    className={`text-lg ${
                        star <= Math.round(rating || 0)
                            ? getRatingColor(rating)
                            : isDarkMode ? 'text-gray-700' : 'text-gray-300'
                    }`}
                >
                    ★
                </span>
            ))}
        </div>
    );

    // Добавьте эту утилитную функцию для URL-адресов изображений
    const getImageUrl = (image) => {
        if (!image) return null;
        if (image.startsWith('http')) return image;
        return `${process.env.REACT_APP_API_URL || ''}${image}`;
    };

    // Форматирование отображения рейтинга
    const formatRating = (rating) => {
        if (rating === undefined || rating === null || isNaN(rating)) return '0.0';
        return rating.toFixed(1);
    };

    return (
        <div className={`min-h-screen ${themeClasses.background}`}>
            <BackgroundParticles />
            
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center mb-6">
                    <AnimatedButton 
                        onClick={() => navigate(-1)}
                        className={`mr-4 p-2 rounded-full ${themeClasses.button}`}
                    >
                        <ArrowLeft size={20} />
                    </AnimatedButton>
                    
                    <h1 className="text-2xl md:text-3xl font-bold">Рейтинги ресторанов</h1>
                </div>

                {/* Categories */}
                <div className="mb-6 overflow-x-auto">
                    <div className="flex space-x-2 pb-2">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => handleCategoryChange(category.id)}
                                className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap
                                    ${activeCategory === category.id 
                                        ? 'bg-blue-500 text-white' 
                                        : `${themeClasses.button}`
                                    }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Search and Filter Bar */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-6">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder="Поиск ресторанов..."
                            className={`pl-10 pr-4 py-2 w-full rounded-lg border ${themeClasses.input} focus:ring-2 focus:ring-indigo-500 transition-all`}
                        />
                    </div>
                    
                    <div className="relative">
                        <AnimatedButton
                            onClick={() => setShowSortOptions(!showSortOptions)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${themeClasses.button}`}
                        >
                            <Filter size={18} />
                            <span>{getSortLabel()}</span>
                            <ChevronDown size={16} className={`transition-transform ${showSortOptions ? 'rotate-180' : ''}`} />
                        </AnimatedButton>
                        
                        <AnimatePresence>
                            {showSortOptions && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.15 }}
                                    className={`absolute z-10 right-0 mt-2 w-48 rounded-lg shadow-lg ${themeClasses.card} border`}
                                >
                                    <div className="py-1">
                                        {['rating', 'price', 'popular', 'newest'].map(option => (
                                            <button
                                                key={option}
                                                onClick={() => handleSort(option)}
                                                className={`block w-full text-left px-4 py-2 text-sm ${sortBy === option ? themeClasses.highlight : ''} hover:bg-opacity-10 hover:bg-gray-500`}
                                            >
                                                {option === 'rating' && 'По рейтингу'}
                                                {option === 'price' && 'По цене'}
                                                {option === 'popular' && 'По популярности'}
                                                {option === 'newest' && 'Сначала новые'}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                
                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : error ? (
                    <div className="text-center py-10">
                        <p className="text-red-500 mb-4">{error}</p>
                        <AnimatedButton 
                            onClick={() => window.location.reload()}
                            className={`bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg`}
                        >
                            Попробовать снова
                        </AnimatedButton>
                    </div>
                ) : (
                    <>
                        {filteredRestaurants.length === 0 ? (
                            <div className="text-center py-10">
                                <Award size={48} className="mx-auto text-gray-400 mb-4" />
                                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Рестораны не найдены</h2>
                                <p className="text-gray-600 dark:text-gray-400">Попробуйте изменить параметры поиска</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredRestaurants.map((restaurant, index) => (
                                    <motion.div
                                        key={restaurant.id}
                                        variants={cardVariants}
                                        initial="hidden"
                                        animate="visible"
                                        transition={{ 
                                            duration: 0.3, 
                                            delay: index * 0.1 
                                        }}
                                        className={`rounded-lg overflow-hidden shadow-md border ${themeClasses.card}`}
                                    >
                                        <div className="h-48 bg-gray-300 overflow-hidden">
                                            {restaurant.imageUrl ? (
                                                <img 
                                                    src={getImageUrl(restaurant.imageUrl)} 
                                                    alt={restaurant.name} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            ) : (
                                                <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                                    <Award size={48} className="text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h2 className="text-lg font-semibold">{restaurant.name}</h2>
                                                <div className="flex items-center">
                                                    <span className={`text-lg font-bold mr-1 ${getRatingColor(restaurant.avgRating)}`}>
                                                        {formatRating(restaurant.avgRating)}
                                                    </span>
                                                    <Star className={`w-5 h-5 ${getRatingColor(restaurant.avgRating)}`} />
                                                </div>
                                            </div>
                                            
                                            <p className="text-sm text-gray-500 mb-3 truncate">{restaurant.cuisine}</p>
                                            
                                            <div className="flex justify-between text-sm">
                                                <div className="flex items-center">
                                                    <ThumbsUp size={16} className="mr-1 text-gray-400" />
                                                    <span>{restaurant.likesCount || 0}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock size={16} className="mr-1 text-gray-400" />
                                                    <span>{restaurant.reviewCount || 0} отзывов</span>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                {renderStars(restaurant.avgRating)}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default RestaurantRatingsPage; 