import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Star, Search, Filter, MapPin, Award, ArrowLeft, Coffee, PieChart, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import RestaurantListView from "./RestaurantCharts";
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Container } from '../../common/components/ui';
import axios from 'axios';
import { toast } from 'react-toastify';

// Animation variants
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

// Демо-данные для отображения, в реальном приложении это должно приходить с API
const sampleReviews = [
    {
        restaurantName: 'Итальянский дворик',
        ratings: { food: 4.8, service: 4.6, atmosphere: 4.9 },
        likes: 156,
        timestamp: Date.now() - 1000000
    },
    {
        restaurantName: 'Азиатский бриз',
        ratings: { food: 4.7, service: 4.3, atmosphere: 4.5 },
        likes: 132,
        timestamp: Date.now() - 2000000
    },
    {
        restaurantName: 'У Михалыча',
        ratings: { food: 4.9, service: 4.8, atmosphere: 4.2 },
        likes: 201,
        timestamp: Date.now() - 500000
    },
    {
        restaurantName: 'Морской причал',
        ratings: { food: 4.4, service: 4.7, atmosphere: 4.8 },
        likes: 175,
        timestamp: Date.now() - 1500000
    },
    {
        restaurantName: 'Французская лавка',
        ratings: { food: 4.6, service: 4.5, atmosphere: 4.7 },
        likes: 145,
        timestamp: Date.now() - 800000
    },
    {
        restaurantName: 'Грузинская кухня',
        ratings: { food: 4.9, service: 4.4, atmosphere: 4.6 },
        likes: 188,
        timestamp: Date.now() - 300000
    },
    {
        restaurantName: 'Мексиканский уголок',
        ratings: { food: 4.5, service: 4.2, atmosphere: 4.4 },
        likes: 120,
        timestamp: Date.now() - 2500000
    },
    {
        restaurantName: 'Американский бургер',
        ratings: { food: 4.6, service: 4.1, atmosphere: 4.0 },
        likes: 167,
        timestamp: Date.now() - 1800000
    }
];

// Категории ресторанов для фильтрации
const categories = [
    { id: 'all', name: 'Все рестораны' },
    { id: 'italian', name: 'Итальянская кухня' },
    { id: 'asian', name: 'Азиатская кухня' },
    { id: 'russian', name: 'Русская кухня' },
    { id: 'seafood', name: 'Морепродукты' },
    { id: 'french', name: 'Французская кухня' },
    { id: 'georgian', name: 'Грузинская кухня' },
    { id: 'mexican', name: 'Мексиканская кухня' },
    { id: 'american', name: 'Американская кухня' }
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

// Add a debug function to help diagnose review loading issues
const logReviewData = (source, data) => {
    console.log(`[DEBUG] Reviews from ${source}:`, data);
    return data;
};

// Add formatDate function to format dates in Russian
const formatDate = (dateString) => {
    const date = new Date(dateString || Date.now());
    
    // Russian month names in genitive case
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

    useEffect(() => {
        const fetchRestaurants = async () => {
            setLoading(true);
            setError(null);
            try {
                // Define API base URL - use port 5000 instead of 8000
                const API_BASE_URL = 'http://localhost:5000/api';
                
                // First fetch all reviews to have them available
                let allReviews = [];
                try {
                    const reviewsResponse = await axios.get(`${API_BASE_URL}/reviews`);
                    console.log("All reviews response:", reviewsResponse.data);
                    
                    if (reviewsResponse.data && Array.isArray(reviewsResponse.data.reviews)) {
                        allReviews = reviewsResponse.data.reviews;
                    } else if (Array.isArray(reviewsResponse.data)) {
                        allReviews = reviewsResponse.data;
                    }
                    
                    console.log(`Successfully loaded ${allReviews.length} reviews`);
                } catch (reviewsErr) {
                    console.error("Error fetching all reviews:", reviewsErr);
                }
                
                if (singleRestaurant && slug) {
                    // Fetch single restaurant by slug
                    const response = await api.get(`/restaurants/by-slug/${slug}`);
                    if (response.data.restaurant) {
                        const restaurant = response.data.restaurant;
                        
                        // Filter reviews for this restaurant
                        const restaurantReviews = allReviews.filter(
                            review => review.restaurant_id === restaurant.id || 
                                     review.restaurantId === restaurant.id ||
                                     review.restaurant_name === restaurant.name ||
                                     review.restaurantName === restaurant.name
                        );
                        
                        // Update restaurant with reviews
                        const updatedRestaurant = {
                            ...restaurant,
                            reviews: restaurantReviews,
                            hasReviews: restaurantReviews.length > 0
                        };
                        
                        // Update state
                        setRestaurants([updatedRestaurant]);
                        setFilteredRestaurants([updatedRestaurant]);
                        setSelectedRestaurant(updatedRestaurant);
                        
                        // Also update reviews state
                        setRestaurantReviews(prev => ({
                            ...prev,
                            [restaurant.id]: restaurantReviews
                        }));
                        
                        console.log(`Found ${restaurantReviews.length} reviews for restaurant ${restaurant.id}`);
                    } else {
                        setError('Ресторан не найден');
                    }
                } else {
                    // Fetch all restaurants
                    const response = await api.get('/restaurants');
                    const activeRestaurants = response.data.restaurants.filter(r => r.is_active);
                    
                    // Prepare restaurant data with reviews
                    const restaurantsWithReviews = activeRestaurants.map(restaurant => {
                        // Filter reviews for this restaurant
                        const restaurantReviews = allReviews.filter(
                            review => review.restaurant_id === restaurant.id || 
                                     review.restaurantId === restaurant.id ||
                                     review.restaurant_name === restaurant.name ||
                                     review.restaurantName === restaurant.name
                        );
                        
                        // Update reviews state
                        setRestaurantReviews(prev => ({
                            ...prev,
                            [restaurant.id]: restaurantReviews
                        }));
                        
                        // Return updated restaurant
                        return {
                            ...restaurant,
                            reviews: restaurantReviews,
                            hasReviews: restaurantReviews.length > 0
                        };
                    });
                    
                    // Update state with restaurants that now have review data
                    setRestaurants(restaurantsWithReviews);
                    setFilteredRestaurants(restaurantsWithReviews);
                }
            } catch (err) {
                console.error('Error fetching restaurants:', err);
                setError('Не удалось загрузить данные ресторанов');
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, [singleRestaurant, slug]);

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        setCurrentPage(1);
        
        // Filter restaurants based on search term
        if (term.trim() === '') {
            setFilteredRestaurants(restaurants);
        } else {
            const filtered = restaurants.filter(restaurant => 
                restaurant.name.toLowerCase().includes(term.toLowerCase()) ||
                (restaurant.address && restaurant.address.toLowerCase().includes(term.toLowerCase()))
            );
            setFilteredRestaurants(filtered);
        }
    };
    
    const handleCategoryChange = (categoryId) => {
        setActiveCategory(categoryId);
        setCurrentPage(1);
        
        if (categoryId === 'all') {
            setFilteredRestaurants(restaurants);
        } else {
            const filtered = restaurants.filter(restaurant => 
                restaurant.category === categoryId
            );
            setFilteredRestaurants(filtered);
        }
    };
    
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Function to handle showing reviews for a specific restaurant
    const handleShowReviews = (restaurantId) => {
        setShowReviewsFor(prevId => prevId === restaurantId ? null : restaurantId);
    };

    // Update the refresh reviews function to use the correct API endpoint
    const refreshReviews = async (restaurantId) => {
        try {
            toast.info("Обновление отзывов...");
            
            // Use the correct API base URL
            const API_BASE_URL = 'http://localhost:5000/api';
            
            // Fetch all reviews
            const reviewsResponse = await axios.get(`${API_BASE_URL}/reviews`);
            let allReviews = [];
            
            if (reviewsResponse.data && Array.isArray(reviewsResponse.data.reviews)) {
                allReviews = reviewsResponse.data.reviews;
            } else if (Array.isArray(reviewsResponse.data)) {
                allReviews = reviewsResponse.data;
            }
            
            // Find the restaurant by ID
            const restaurant = restaurants.find(r => r.id === restaurantId);
            
            // Filter reviews for this restaurant
            const restaurantReviews = allReviews.filter(
                review => review.restaurant_id === restaurantId || 
                         review.restaurantId === restaurantId ||
                         (restaurant && (review.restaurant_name === restaurant.name || 
                                      review.restaurantName === restaurant.name))
            );
            
            // Update state with filtered reviews
            if (restaurantReviews.length > 0) {
                // Update reviews state
                setRestaurantReviews(prev => ({
                    ...prev,
                    [restaurantId]: restaurantReviews
                }));
                
                // Update restaurant objects too
                setRestaurants(prev => 
                    prev.map(restaurant => 
                        restaurant.id === restaurantId 
                            ? {...restaurant, reviews: restaurantReviews, hasReviews: true}
                            : restaurant
                    )
                );
                
                setFilteredRestaurants(prev => 
                    prev.map(restaurant => 
                        restaurant.id === restaurantId 
                            ? {...restaurant, reviews: restaurantReviews, hasReviews: true}
                            : restaurant
                    )
                );
                
                toast.success(`Загружено ${restaurantReviews.length} отзывов`);
                return true;
            } else {
                console.log(`No reviews found for restaurant ${restaurantId}`);
                toast.info("Отзывы не найдены");
                return false;
            }
        } catch (err) {
            console.error(`Error refreshing reviews for restaurant ID ${restaurantId}:`, err);
            toast.error("Ошибка при обновлении отзывов");
            return false;
        }
    };

    // Update the RestaurantReviews component to always link to the restaurant of the review
    const RestaurantReviews = ({ restaurantId, isDarkMode }) => {
        const reviews = restaurantReviews[restaurantId] || [];
        console.log(`Rendering ${reviews.length} reviews for restaurant ${restaurantId}`);
        
        // If reviews not fetched yet or empty
        if (reviews.length === 0) {
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
                        // Get the actual restaurant ID this review belongs to
                        const reviewRestaurantId = review.restaurant_id || review.restaurantId || restaurantId;
                        
                        // Find the restaurant object from our list of restaurants
                        const reviewRestaurant = restaurants.find(r => r.id === reviewRestaurantId) || 
                                               { id: reviewRestaurantId, slug: reviewRestaurantId };
                        
                        // Determine the URL for this restaurant
                        const restaurantUrl = `/restaurant/${reviewRestaurant.slug || reviewRestaurant.id}`;
                        
                        return (
                            <motion.div 
                                key={index}
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
                                            {review.user_name || review.username || review.name || 'Гость'}
                                        </span>
                                        
                                        {/* Always show which restaurant this review is for */}
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
                                    
                                    {/* Add a clickable like counter similar to the image */}
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex items-center gap-1"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                        </svg>
                                        <span>{review.likes || 0}</span>
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

    // Render a restaurant card
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
                        
                        {/* Reviews section - shows when button is clicked */}
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

    // Render section showing top restaurants
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