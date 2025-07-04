import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Star, Search, Filter, MapPin, Award, ArrowLeft, Coffee, PieChart, ChevronLeft, ChevronRight, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import RestaurantListView from "./RestaurantCharts";
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Container } from '../../common/components/ui';
import axios from 'axios';
import { toast } from 'react-toastify';
import { RESTAURANT_CATEGORIES } from './constants/categories';
import { restaurantService } from './services/restaurantService';
 
const API_BASE_URL = 'http://localhost:5000/api';

 const mockRestaurants = [
];

// Анимация вариантов
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            ease: "easeInOut",
            duration: 0.5
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
            type: "spring", 
            stiffness: 250,
            damping: 20,
            duration: 0.5
        }
    }
};

const cardVariants = {
    hidden: { 
        opacity: 0, 
        y: 10 
    },
    visible: (i) => ({ 
        opacity: 1, 
        y: 0,
        transition: { 
            delay: i * 0.05,
            type: "spring", 
            stiffness: 200,
            damping: 20,
            duration: 0.4
        }
    }),
    hover: {
        y: -3,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.06)",
        transition: { 
            duration: 0.3,
            ease: "easeOut"
        }
    }
};

const buttonVariants = {
    hover: { 
        scale: 1.02, 
        transition: { 
            duration: 0.25, 
            type: "spring", 
            stiffness: 200,
            ease: "easeOut"
        }
    },
    tap: { scale: 0.98, transition: { duration: 0.15 }}
};

const imageVariants = {
    hover: {
        scale: 1.03,
        transition: { 
            duration: 0.4,
            ease: "easeOut" 
        }
    }
};



// Категории для фильтрации
const categories = [
    { id: 'all', name: 'Все рестораны' },
    ...Object.entries(RESTAURANT_CATEGORIES)
        .filter(([id]) => id !== 'all') // Удаляем 'all' из RESTAURANT_CATEGORIES, так как мы добавляем его вручную
        .map(([id, name]) => ({
            id,
            name,
            cuisine: name.replace(' кухня', '')
        }))
];

/**
 * Компонент для отображения пустого списка ресторанов
 */
const EmptyRestaurants = ({ isDarkMode }) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="p-6 bg-gray-50 dark:bg-gray-700 text-center rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[200px] flex flex-col justify-center"
    >
        <motion.div 
            className="inline-block mb-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ 
                type: "spring",
                stiffness: 250,
                damping: 20,
                duration: 0.4
            }}
        >
            <Coffee className="w-12 h-12 text-gray-400 dark:text-gray-300 mx-auto" />
        </motion.div>
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Рестораны не найдены</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
            Попробуйте изменить параметры поиска или выбрать другую категорию
        </p>
    </motion.div>
);

/**
 * Компонент кастомной пагинации
 */
const CustomPagination = ({ currentPage, totalPages, onPageChange, isDarkMode }) => (
    <div className="flex justify-center mt-6">
        <div className={`flex items-center space-x-1 p-1 rounded border shadow-sm ${
            isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-800'
        }`}>
            <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded flex items-center transition-all ${
                    currentPage === 1 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
            >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span className="text-sm">Назад</span>
            </motion.button>
            
            <div className="text-xs px-3 py-1 font-medium">
                {currentPage} / {totalPages}
            </div>
            
            <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded flex items-center transition-all ${
                    currentPage === totalPages 
                        ? 'text-gray-400 cursor-not-allowed'
                        : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
            >
                <span className="text-sm">Вперед</span>
                <ChevronRight className="w-4 h-4 ml-1" />
            </motion.button>
        </div>
    </div>
);

// Функция отладки для диагностики проблем загрузки отзывов (debugging function for reviewing loading issues)
const logReviewData = (source, data) => {
    console.log(`[ОТЛАДКА] Отзывы из ${source}:`, data);
    return data;
};

// Функция форматирования даты на русском языке (function for formatting date in Russian)
const formatDate = (dateString) => {
    const date = new Date(dateString || Date.now());
    
    // Названия месяцев в родительном падеже (months in the genitive case)
    const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year} г.`;
};

/**
 * Главный компонент страницы рейтингов ресторанов
 */
const RestaurantRatingsPage = ({ isDarkMode = false, singleRestaurant = false }) => {
    const { slug } = useParams();
    const [restaurants, setRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [restaurantReviews, setRestaurantReviews] = useState({});
    const [showReviewsFor, setShowReviewsFor] = useState(null);
    
    const itemsPerPage = 6;
    const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRestaurants.slice(indexOfFirstItem, indexOfLastItem);

    // Функция для нормализации названия кухни к ID категории (function to normalize cuisine name to category ID)
    const normalizeCuisineToCategory = (cuisine) => {
        if (!cuisine) return null;
        
        // Удаляем "кухня" из названия и преобразуем в нижний регистр (remove "кухня" from name and convert to lowercase)
        const normalizedCuisine = cuisine.toLowerCase().replace(' кухня', '').trim();
        
        // Находим соответствующую категорию (find matching category)
        const category = Object.entries(RESTAURANT_CATEGORIES).find(([id, name]) => 
            name.toLowerCase().replace(' кухня', '').trim() === normalizedCuisine
        );
        
        return category ? category[0] : null;
    };

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                setLoading(true);
                const response = await api.get('/restaurants', {
                    params: {
                        category: activeCategory !== 'all' ? activeCategory : undefined
                    }
                });
                
                // Убеждаемся, что мы работаем с массивом ресторанов (Ensure we're working with an array of restaurants)
                const restaurantsData = Array.isArray(response.data) ? response.data : 
                                      (response.data.data || response.data.restaurants || []);
                
                const restaurantsWithValidRatings = restaurantsData.map(restaurant => ({
                    ...restaurant,
                    avgRating: typeof restaurant.avg_rating === 'number' ? restaurant.avg_rating : 0,
                    reviewCount: typeof restaurant.review_count === 'number' ? restaurant.review_count : 0,
                    // Убеждаемся, что категория установлена правильно (Ensure category is properly set)
                    category: restaurant.category || normalizeCuisineToCategory(restaurant.cuisine_type || restaurant.cuisineType)
                }));
                
                setRestaurants(restaurantsWithValidRatings);
                setFilteredRestaurants(restaurantsWithValidRatings);
            } catch (err) {
                console.error('Failed to fetch restaurants:', err);
                setError('Не удалось загрузить рестораны. Пожалуйста, попробуйте позже.');
                
                // Для демонстрационных целей, используем mock данные, если API не работает (For demo purposes, use mock data if API fails)
                const mocksWithValidRatings = mockRestaurants.map(restaurant => ({
                    ...restaurant,
                    avgRating: typeof restaurant.avgRating === 'number' ? restaurant.avgRating : 0,
                    reviewCount: typeof restaurant.reviewCount === 'number' ? restaurant.reviewCount : 0,
                    // Нормализуем категорию для mock данных (Normalize category for mock data)
                    category: normalizeCuisineToCategory(restaurant.cuisine)
                }));
                setRestaurants(mocksWithValidRatings);
                setFilteredRestaurants(mocksWithValidRatings);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
        
        // Обновляем заголовок страницы (Update page title)
        document.title = "Рейтинги ресторанов | FeedbackDelivery";
        
        // Очищаем на unmount (Cleanup on unmount)
        return () => {
            document.title = "FeedbackDelivery";
        };
    }, [activeCategory]); // Добавляем activeCategory в зависимости (Add activeCategory as dependency)

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase().trim();
        setSearchTerm(term);
        setCurrentPage(1); // Сбрасываем на первую страницу при поиске (Reset to first page when searching)
        
        // Применяем оба фильтра категории и поиска (Apply both category and search filters)
        let filtered = restaurants;
        
        // Сначала применяем фильтр категории, если не "all" (First apply category filter if not "all")
        if (activeCategory !== 'all') {
            filtered = filtered.filter(restaurant => 
                restaurant.category === activeCategory || 
                restaurant.cuisine_type === RESTAURANT_CATEGORIES[activeCategory] ||
                (restaurant.cuisine && restaurant.cuisine.toLowerCase().includes(RESTAURANT_CATEGORIES[activeCategory].toLowerCase().replace(' кухня', '')))
            );
        }
        
        // Затем применяем фильтр поиска, если есть поисковый запрос (Then apply search filter if there's a search term)
        if (term) {
            filtered = filtered.filter(restaurant => {
                const restaurantName = (restaurant.name || '').toLowerCase();
                const restaurantAddress = (restaurant.address || '').toLowerCase();
                const restaurantCategory = RESTAURANT_CATEGORIES[restaurant.category] || '';
                
                return restaurantName.includes(term) || 
                       restaurantAddress.includes(term) || 
                       restaurantCategory.toLowerCase().includes(term);
            });
        }
        
        setFilteredRestaurants(filtered);
    };
    
    const handleCategoryChange = (categoryId) => {
        setActiveCategory(categoryId);
        setCurrentPage(1); // Сбрасываем на первую страницу при смене категории (Reset to first page when changing category)
        
        if (categoryId === 'all') {
            // Показываем все рестораны, когда выбрана категория "Все" (Show all restaurants when "All" is selected)
            setFilteredRestaurants(restaurants);
        } else {
            // Фильтруем рестораны по выбранной категории (Filter restaurants by selected category)
            const filtered = restaurants.filter(restaurant => {
                // Проверяем оба поля категории и cuisine_type (Check both category and cuisine_type fields)
                const matchesCategory = 
                    restaurant.category === categoryId || 
                    restaurant.cuisine_type === RESTAURANT_CATEGORIES[categoryId] ||
                    (restaurant.cuisine && restaurant.cuisine.toLowerCase().includes(RESTAURANT_CATEGORIES[categoryId].toLowerCase().replace(' кухня', '')));
                
                return matchesCategory;
            });
            
            console.log(`Filtering for category ${categoryId}:`, {
                totalRestaurants: restaurants.length,
                filteredCount: filtered.length,
                categoryName: RESTAURANT_CATEGORIES[categoryId]
            });
            
            setFilteredRestaurants(filtered);
        }
    };
    
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Функция для отображения отзывов для конкретного ресторана (function to handle showing reviews for a specific restaurant)
    const handleShowReviews = (restaurantId) => {
        setShowReviewsFor(prevId => prevId === restaurantId ? null : restaurantId);
    };

    // Обновляем функцию обновления отзывов, чтобы использовать restaurantService вместо apiService (Update the refresh reviews function to use the restaurantService instead of apiService)
    const refreshReviews = async (restaurantId) => {
        try {
            console.log(`Fetching reviews for restaurant ${restaurantId}...`);
            const response = await restaurantService.getRestaurantReviews(restaurantId);
            console.log('Reviews response received:', response);
            
            if (!response || !response.reviews) {
                console.warn(`No reviews returned for restaurant ${restaurantId}`);
                setRestaurantReviews(prev => ({
                    ...prev,
                    [restaurantId]: []
                }));
                return;
            }
            
            // Логируем сырые отзывы для отладки (Log raw reviews for debugging)
            console.log('Raw reviews data:', JSON.stringify(response.reviews, null, 2));
            
            // Нормализуем данные отзывов, чтобы обеспечить согласованность (Normalize the review data to ensure consistency)
            const normalizedReviews = response.reviews.map(review => ({
                ...review,
                // Убеждаемся, что все необходимые поля существуют для отображения (Ensure all necessary fields exist for rendering)
                user_name: review.user_name || review.userName || review.author?.name || 'Неизвестный пользователь',
                restaurant_id: review.restaurant_id || restaurantId,
                restaurantId: review.restaurant_id || restaurantId,
                comment: review.comment || review.text || review.content || '',
                created_at: review.created_at || review.date || new Date().toISOString(),
                date: review.created_at || review.date || new Date().toISOString()
            }));
            
            console.log(`Successfully processed ${normalizedReviews.length} reviews for restaurant ${restaurantId}`);
            console.log('Normalized reviews:', JSON.stringify(normalizedReviews, null, 2));
            
            setRestaurantReviews(prev => ({
                ...prev,
                [restaurantId]: normalizedReviews
            }));
        } catch (error) {
            console.error(`Error fetching reviews for restaurant ${restaurantId}:`, error);
            toast.error(`Не удалось загрузить отзывы: ${error.message || 'Ошибка сервера'}`);
        }
    };

    // Обновляем компонент RestaurantReviews, чтобы всегда ссылаться на ресторан отзыва (Update the RestaurantReviews component to always link to the restaurant of the review)
    const RestaurantReviews = ({ restaurantId, isDarkMode }) => {
        const reviews = restaurantReviews[restaurantId] || [];
        
        // Добавляем явное логирование для отладки (Add explicit logging to help debug)
        console.log(`RestaurantReviews component for restaurant ${restaurantId}:`, {
            reviewsAvailable: reviews.length > 0,
            reviewsCount: reviews.length,
            reviewsData: reviews
        });
        
        const handleLike = async (reviewId) => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (!token) {
                    toast.info('Войдите, чтобы оценить отзыв');
                    return;
                }

                // Оптимистичное обновление UI
                setRestaurantReviews(prev => ({
                    ...prev,
                    [restaurantId]: prev[restaurantId].map(review =>
                        review.id === reviewId
                            ? { ...review, likes: (review.likes || 0) + 1, isLikedByUser: true }
                            : review
                    )
                }));

                // Отправляем запрос на сервер
                await axios.post(`${API_BASE_URL}/reviews/like`, 
                    { reviewId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                toast.success('Отзыв оценен');
            } catch (error) {
                if (error.response?.data?.message === 'Отзыв уже оценен') {
                    // Если отзыв уже оценен, оставляем состояние как есть
                    setRestaurantReviews(prev => ({
                        ...prev,
                        [restaurantId]: prev[restaurantId].map(review =>
                            review.id === reviewId
                                ? { ...review, isLikedByUser: true }
                                : review
                        )
                    }));
                } else {
                    // Для других ошибок откатываем изменения
                    setRestaurantReviews(prev => ({
                        ...prev,
                        [restaurantId]: prev[restaurantId].map(review =>
                            review.id === reviewId
                                ? { ...review, likes: Math.max(0, (review.likes || 0) - 1), isLikedByUser: false }
                                : review
                        )
                    }));
                    toast.error(error.response?.data?.message || 'Не удалось оценить отзыв');
                }
            }
        };
        
        // Если отзывы еще не загружены, загружаем их (If reviews not fetched yet, fetch them)
        if (!restaurantReviews[restaurantId]) {
            console.log(`No reviews loaded yet for restaurant ${restaurantId}, fetching...`);
            refreshReviews(restaurantId);
            
            return (
                <div className={`text-center py-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500 mx-auto mb-2"></div>
                    <p>Загрузка отзывов...</p>
                </div>
            );
        }
        
        // Если массив отзывов существует, но пуст (после загрузки) (If reviews array exists but is empty (after fetching))
        if (reviews.length === 0) {
            console.log(`No reviews found for restaurant ${restaurantId} after fetching`);
            
            return (
                <div className={`text-center py-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <p className="mb-3">Пока нет отзывов для этого ресторана.</p>
                    <motion.button
                        onClick={() => refreshReviews(restaurantId)}
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        className={`text-xs px-3 py-1 rounded-md ${
                            isDarkMode 
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <div className="flex items-center">
                            <RefreshCw size={14} className="mr-1" />
                            <span>Обновить отзывы</span>
                        </div>
                    </motion.button>
                </div>
            );
        }
        
        console.log(`Rendering ${reviews.length} reviews for restaurant ${restaurantId}`);
        
        // Если у нас есть отзывы, отображаем их (If we have reviews, display them)
        return (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-3"
            >
                <div className="flex items-center justify-between mb-3">
                    <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Последние отзывы:
                    </h4>
                    <motion.button
                        onClick={() => refreshReviews(restaurantId)}
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        className={`text-xs px-2 py-1 rounded-md ${
                            isDarkMode 
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Обновить
                    </motion.button>
                </div>
                <div className="space-y-3">
                    {reviews.slice(0, 3).map((review, index) => {
                        // Получаем фактический ID ресторана, к которому принадлежит этот отзыв (Get the actual restaurant ID this review belongs to)
                        const reviewRestaurantId = review.restaurant_id || review.restaurantId || restaurantId;
                        
                        // Находим объект ресторана из нашего списка ресторанов (Find the restaurant object from our list of restaurants)
                        const reviewRestaurant = restaurants.find(r => r.id === reviewRestaurantId) || 
                                               { id: reviewRestaurantId, slug: reviewRestaurantId };
                        
                        // Определяем URL для этого ресторана (Determine the URL for this restaurant)
                        const restaurantUrl = `/restaurant/${reviewRestaurant.slug || reviewRestaurant.id}`;
                        
                        return (
                            <motion.div 
                                key={review.id || index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`p-3 rounded-md ${
                                    isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                                            {review.user_name || review.userName || review.username || review.name || review.author?.name || 'Гость'}
                                        </span>
                                        
                                        {/* Всегда показываем, для какого ресторана этот отзыв */}
                                        <Link 
                                            to={restaurantUrl}
                                            className={`ml-2 text-xs hover:underline ${
                                                isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                                            }`}
                                        >
                                            {reviewRestaurant.name || `Ресторан #${reviewRestaurantId}`}
                                        </Link>
                                    </div>
                                    <div className="flex items-center">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                size={12}
                                                fill={i < Math.round(review.rating || 0) ? "#FFB800" : "none"}
                                                stroke={i < Math.round(review.rating || 0) ? "#FFB800" : "#94a3b8"}
                                                className="mr-0.5"
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {review.comment || review.text || review.content || 'Пользователь не оставил комментарий'}
                                </p>
                                <div className={`text-xs mt-2 flex justify-between items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <Link 
                                        to={restaurantUrl}
                                        className={`hover:underline ${
                                            isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                                        }`}
                                    >
                                        {formatDate(review.created_at || review.date || review.timestamp || Date.now())}
                                    </Link>
                                    
                                    {/* Добавляем кликабельный счетчик лайков, аналогичный изображению */}
                                    <motion.button
                                        onClick={() => handleLike(review.id)}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex items-center gap-1"
                                    >
                                        <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            viewBox="0 0 24 24" 
                                            fill={review.isLikedByUser ? "currentColor" : "none"}
                                            stroke="currentColor" 
                                            strokeWidth="2" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            className={`w-4 h-4 ${review.isLikedByUser ? 'text-red-500' : ''}`}
                                        >
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                        </svg>
                                        <span className={review.isLikedByUser ? 'text-red-500' : ''}>{review.likes || 0}</span>
                                    </motion.button>
                                </div>
                            </motion.div>
                        );
                    })}
                    
                    {reviews.length > 3 && (
                        <div className="text-center mt-2">
                            <Link to={`/restaurant/${restaurantId}`}>
                                <motion.button
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    className={`text-xs px-3 py-1 ${
                                        isDarkMode 
                                            ? 'text-blue-400 hover:text-blue-300' 
                                            : 'text-blue-600 hover:text-blue-700'
                                    }`}
                                >
                                    Смотреть все {reviews.length} отзывов
                                </motion.button>
                            </Link>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };  

    // Рендерим карточку ресторана (Render a restaurant card)
    const renderRestaurantCard = (restaurant, index) => {
        const { id, name, address, image_url, rating, slug, cuisine, hasReviews } = restaurant;
        const reviews = restaurantReviews[id] || [];
        const firstReview = reviews.length > 0 ? reviews[0] : null;
        
        return (
            <motion.div
                key={id}
                variants={cardVariants}
                custom={index}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                layout
                className={`overflow-hidden rounded-xl shadow-md border flex flex-col ${
                    isDarkMode 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-white border-gray-200'
                }`}
            >
                <div className="block h-full flex flex-col">
                    <div className="relative overflow-hidden h-48">
                        <motion.div className="absolute inset-0" variants={imageVariants}>
                            {image_url ? (
                                <img 
                                    src={image_url} 
                                    alt={name} 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                <div className={`w-full h-full flex items-center justify-center ${
                                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                                }`}>
                                    <Award size={48} className="text-gray-400 dark:text-gray-500" />
                                </div>
                            )}
                        </motion.div>
                        
                        {/* Указатель кухни */}
                        {cuisine && (
                            <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                                isDarkMode 
                                    ? 'bg-gray-800 text-gray-300' 
                                    : 'bg-white text-gray-700'
                            }`}>
                                {cuisine}
                            </div>
                        )}
                    </div>
                    
                    <div className="p-5 flex-grow flex flex-col">
                        <h3 className={`font-semibold text-lg mb-2 ${
                            isDarkMode ? 'text-white' : 'text-gray-800'
                        }`}>
                            {name}
                        </h3>
                        
                        <div className="flex items-center mb-3">
                        </div>
                        
                        {address && (
                            <div className={`text-sm flex items-start mb-4 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                <MapPin size={16} className="flex-shrink-0 mr-1 mt-0.5" />
                                <span className="line-clamp-2">{address}</span>
                            </div>
                        )}
                        
                        {/* Раздел отзывов - показывается при нажатии кнопки */}
                        <AnimatePresence>
                            {showReviewsFor === id && (
                                <RestaurantReviews restaurantId={id} isDarkMode={isDarkMode} />
                            )}
                        </AnimatePresence>
                        
                        <div className="mt-auto pt-3 w-full flex justify-center">
                            <motion.button
                                onClick={() => handleShowReviews(id)}
                                className={`inline-flex items-center px-4 py-1.5 rounded-md text-sm ${
                                    isDarkMode
                                        ? showReviewsFor === id 
                                          ? 'bg-gray-600 text-gray-200' 
                                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : showReviewsFor === id 
                                          ? 'bg-gray-200 text-gray-800' 
                                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                            >
                                <PieChart size={14} className="mr-2" />
                                <span>{showReviewsFor === id ? 'Скрыть отзывы' : 'Смотреть рейтинги'}</span>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };
    
    if (loading) {
        return (
            <Container size="xl" className="py-8">
                <motion.div 
                    className="flex justify-center items-center py-20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <LoadingSpinner size="large" />
                </motion.div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container size="xl" className="py-8">
                <motion.div 
                    className="py-20"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className={`max-w-lg mx-auto p-6 rounded-lg border shadow-lg ${
                        isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-white' 
                            : 'bg-white border-gray-200 text-gray-800'
                    }`}>
                        <div className="flex items-center mb-4">
                            <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
                            <h2 className="text-xl font-semibold">Ошибка загрузки данных</h2>
                        </div>
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                            {error}
                        </p>
                        <Link to="/">
                            <motion.button
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                className={`flex items-center px-4 py-2 rounded-md ${
                                    isDarkMode
                                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <ArrowLeft size={16} className="mr-2" />
                                Вернуться на главную
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>
            </Container>
        );
    }

    // Рендерим раздел с топ ресторанами 
    const renderTopRestaurants = () => {
        if (filteredRestaurants.length === 0) {
            return <EmptyRestaurants isDarkMode={isDarkMode} />;
        }

        return (
            <motion.div
                variants={containerVariants} 
                initial="hidden"
                animate="visible"
                className="w-full"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentItems.map((restaurant, index) => renderRestaurantCard(restaurant, index))}
                </div>
                
                {totalPages > 1 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="mt-8"
                    >
                        <CustomPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            isDarkMode={isDarkMode}
                        />
                    </motion.div>
                )}
            </motion.div>
        );
    };

    return (
        <Container size="xl" className="py-6 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
            >
                {selectedRestaurant ? (
                    <Link to="/restaurant-ratings" className="inline-flex items-center mb-6">
                        <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            className={`flex items-center px-3 py-2 rounded-md ${
                                isDarkMode 
                                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700' 
                                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                            }`}
                        >
                            <ArrowLeft size={16} className={`mr-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} /> Все рестораны
                        </motion.button>
                    </Link>
                ) : (
                    <motion.div 
                        className="flex items-center mb-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                    >
                        <PieChart className={`w-6 h-6 mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Рейтинги ресторанов
                        </h1>
                    </motion.div>
                )}
            </motion.div>

            <motion.div
                className="grid grid-cols-1 lg:grid-cols-4 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Фильтры и поиск */}
                <motion.div
                    className="lg:col-span-1"
                    variants={itemVariants}
                >
                    <motion.div 
                        className={`sticky top-4 rounded-lg p-4 shadow-xl ${
                            isDarkMode 
                                ? 'bg-gray-800 border border-gray-700' 
                                : 'bg-white border border-gray-200'
                        }`}
                        whileHover={{ y: -2, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex items-center mb-4">
                            <Search className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                            <h2 className={`text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                Поиск и фильтры
                            </h2>
                        </div>
                        
                        <div className="mb-6">
                            <div className={`flex items-center w-full px-3 py-2 rounded-md border ${
                                isDarkMode 
                                    ? 'bg-gray-700 border-gray-600' 
                                    : 'bg-gray-50 border-gray-200'
                            }`}>
                                <Search className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                <input 
                                    type="text" 
                                    placeholder="Поиск ресторанов..." 
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className={`bg-transparent w-full focus:outline-none ${
                                        isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
                                    }`}
                                />
                            </div>
                        </div>
                        
                        <div>
                            <h3 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Категории
                            </h3>
                            <div className="space-y-2">
                                {categories.map(category => (
                                    <motion.button
                                        key={category.id}
                                        variants={buttonVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                            activeCategory === category.id 
                                                ? isDarkMode 
                                                    ? 'bg-gray-700 text-white' 
                                                    : 'bg-gray-200 text-gray-900'
                                                : isDarkMode 
                                                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                        }`}
                                        onClick={() => handleCategoryChange(category.id)}
                                    >
                                        {category.name}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
                
                {/* Список ресторанов */}
                <motion.div
                    className="lg:col-span-3"
                    variants={itemVariants}
                >
                    <motion.div 
                        className={`rounded-lg p-6 shadow-xl mb-6 ${
                            isDarkMode 
                                ? 'bg-gray-800 border border-gray-700' 
                                : 'bg-white border border-gray-200'
                        }`}
                        whileHover={{ y: -2, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {selectedRestaurant 
                                    ? `Рейтинги: ${selectedRestaurant.name}`
                                    : 'Лучшие рестораны'
                                }
                            </h2>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Найдено: <span className="font-medium">{filteredRestaurants.length}</span>
                            </div>
                        </div>
                        
                        {selectedRestaurant ? (
                            <RestaurantListView restaurant={selectedRestaurant} isDarkMode={isDarkMode} />
                        ) : null}
                    </motion.div>
                    
                    {/* Отображение списка ресторанов */}
                    {!selectedRestaurant && (
                        <motion.div 
                            className={`rounded-lg p-6 shadow-xl ${
                                isDarkMode 
                                    ? 'bg-gray-800 border border-gray-700' 
                                    : 'bg-white border border-gray-200'
                            }`}
                            transition={{ duration: 0.3 }}
                        >
                            {renderTopRestaurants()}
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </Container>
    );
};

export default RestaurantRatingsPage;