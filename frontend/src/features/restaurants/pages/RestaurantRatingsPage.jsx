import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Search, Filter, ArrowLeft, Award, ChevronDown, Clock, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import BackgroundParticles from '../../../components/BackgroundParticles';
import LoadingSpinner from '../../../components/LoadingSpinner';
import AnimatedButton from '../../../components/AnimatedButton';
import api from '../../../utils/api';

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

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                setLoading(true);
                // Replace with your actual API endpoint
                const response = await api.get('/restaurants');
                const restaurantsWithValidRatings = response.data.map(restaurant => ({
                    ...restaurant,
                    avgRating: typeof restaurant.avgRating === 'number' ? restaurant.avgRating : 0,
                    reviewCount: typeof restaurant.reviewCount === 'number' ? restaurant.reviewCount : 0
                }));
                setRestaurants(restaurantsWithValidRatings);
                setFilteredRestaurants(restaurantsWithValidRatings);
            } catch (err) {
                console.error('Failed to fetch restaurants:', err);
                setError('Не удалось загрузить рестораны. Пожалуйста, попробуйте позже.');
                // For demo purposes, use mock data if API fails
                const mocksWithValidRatings = mockRestaurants.map(restaurant => ({
                    ...restaurant,
                    avgRating: typeof restaurant.avgRating === 'number' ? restaurant.avgRating : 0,
                    reviewCount: typeof restaurant.reviewCount === 'number' ? restaurant.reviewCount : 0
                }));
                setRestaurants(mocksWithValidRatings);
                setFilteredRestaurants(mocksWithValidRatings);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
        
        // Обновляем заголовок страницы
        document.title = "Рейтинги ресторанов | FeedbackDelivery";
        
        // Очистка при размонтировании компонента
        return () => {
            document.title = "FeedbackDelivery";
        };
    }, []);

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        
        if (term.trim() === '') {
            setFilteredRestaurants(restaurants);
        } else {
            const filtered = restaurants.filter(restaurant => 
                restaurant.name.toLowerCase().includes(term.toLowerCase()) ||
                restaurant.cuisine.toLowerCase().includes(term.toLowerCase())
            );
            setFilteredRestaurants(filtered);
        }
    };

    const handleSort = (sortType) => {
        setSortBy(sortType);
        setShowSortOptions(false);
        
        const sorted = [...filteredRestaurants].sort((a, b) => {
            if (sortType === 'rating') {
                return b.avgRating - a.avgRating;
            } else if (sortType === 'price') {
                return a.priceLevel - b.priceLevel;
            } else if (sortType === 'popular') {
                return b.reviewCount - a.reviewCount;
            } else if (sortType === 'newest') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return 0;
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

const mockRestaurants = [
    {
        id: 1,
        name: 'Итальянский дворик',
        cuisine: 'Итальянская кухня',
        avgRating: 4.8,
        priceLevel: 2,
        likesCount: 156,
        reviewCount: 42,
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
        createdAt: '2023-04-15'
    },
    {
        id: 2,
        name: 'Азиатский бриз',
        cuisine: 'Азиатская кухня',
        avgRating: 4.7,
        priceLevel: 3,
        likesCount: 132,
        reviewCount: 38,
        imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
        createdAt: '2023-05-20'
    },
    {
        id: 3,
        name: 'У Михалыча',
        cuisine: 'Русская кухня',
        avgRating: 4.9,
        priceLevel: 2,
        likesCount: 201,
        reviewCount: 56,
        imageUrl: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTZ8fHJ1c3NpYW4lMjBmb29kfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
        createdAt: '2023-02-10'
    },
    {
        id: 4,
        name: 'Морской причал',
        cuisine: 'Морепродукты',
        avgRating: 4.4,
        priceLevel: 4,
        likesCount: 175,
        reviewCount: 45,
        imageUrl: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTV8fHNlYWZvb2QlMjByZXN0YXVyYW50fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
        createdAt: '2023-06-05'
    },
    {
        id: 5,
        name: 'Французская лавка',
        cuisine: 'Французская кухня',
        avgRating: 4.6,
        priceLevel: 3,
        likesCount: 145,
        reviewCount: 39,
        imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8ZnJlbmNoJTIwcmVzdGF1cmFudHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
        createdAt: '2023-03-22'
    },
    {
        id: 6,
        name: 'Грузинская кухня',
        cuisine: 'Грузинская кухня',
        avgRating: 4.7,
        priceLevel: 2,
        likesCount: 188,
        reviewCount: 51,
        imageUrl: 'https://images.unsplash.com/photo-1539755530862-00f623c00f52?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8Z2VvcmdpYW4lMjBmb29kfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
        createdAt: '2023-01-15'
    }
];

export default RestaurantRatingsPage; 