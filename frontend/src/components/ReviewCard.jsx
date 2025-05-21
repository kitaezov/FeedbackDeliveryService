import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Trash2, User, Receipt, ImageIcon, MessageCircle } from 'lucide-react';
import { Card, CardContent } from './Card';
import { motion } from 'framer-motion';
import { restaurantData } from '../features/restaurants/restaurantData';

// Animation variants
const buttonVariants = {
    initial: { opacity: 0, y: 5 },
    animate: { opacity: 1, y: 0 },
    hover: {
        scale: 1.05,
        transition: { 
            duration: 0.2,
            type: "spring", 
            stiffness: 400 
        }
    },
    tap: {
        scale: 0.95,
        transition: { 
            duration: 0.1 
        }
    }
};

// Utility function to format image URL
const getImageUrl = (image) => {
    if (!image) return null;
    
    try {
        // If it's a string that might be JSON, try to parse it
        if (typeof image === 'string' && (image.startsWith('{') || image.startsWith('['))) {
            try {
                const parsed = JSON.parse(image);
                if (parsed && typeof parsed === 'object') {
                    if (parsed.url) {
                        return getImageUrl(parsed.url);
                    }
                }
            } catch (e) {
                // Not valid JSON, continue with string processing
            }
        }
        
        // If it's already an object with url property, use that
        if (typeof image === 'object' && image.url) {
            return getImageUrl(image.url);
        }
        
        // If it's a full URL, use it directly, but ensure protocol is correct
        if (typeof image === 'string') {
            // Fix common URL issues
            let url = image;
            
            // Fix missing colon in http://
            if (url.match(/^http\/\//)) {
                url = url.replace('http//', 'http://');
            }
            
            if (url.startsWith('http://') || url.startsWith('https://')) {
                return url;
            }
            
            // If it starts with a slash, prepend the API base URL
            if (url.startsWith('/')) {
                return `${process.env.REACT_APP_API_URL || ''}${url}`;
            }
            
            // If it has a domain but no protocol, add https://
            if (url.includes('.') && !url.includes(' ') && !url.match(/^[a-zA-Z]+:\/\//)) {
                return 'https://' + url;
            }
            
            // Otherwise, prepend the API base URL
            return `${process.env.REACT_APP_API_URL || ''}${url}`;
        }
        
        // If we get here and it's not a string, return null
        return null;
    } catch (err) {
        console.error("Error formatting image URL:", err);
        return null;
    }
};

/**
 * Форматирует дату в читаемый вид
 * 
 * @param {string|Date} dateString - Дата для форматирования
 * @returns {string} - Отформатированная дата
 */
const formatDate = (dateString) => {
    if (!dateString) return 'Дата не указана';
    
    try {
        const date = new Date(dateString);
        
        // Проверка на валидность даты
        if (isNaN(date.getTime())) {
            return 'Некорректная дата';
        }
        
        // Проверяем, является ли время полуночью (00:00)
        const isDefaultTime = date.getHours() === 0 && date.getMinutes() === 0;
        
        if (isDefaultTime) {
            // Форматирование только даты без времени, если время 00:00
            return date.toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } else {
            // Дата со временем для других случаев
            return date.toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    } catch (error) {
        console.error('Ошибка форматирования даты:', error);
        return 'Некорректная дата';
    }
};

const ReviewCard = ({ review, user, onLike = () => {}, onDelete = () => {}, isDarkMode = false }) => {
    // Add console log to debug the review object
    console.log('ReviewCard received review:', review);
    
    const [showDetails, setShowDetails] = useState(false);
    const [localLikes, setLocalLikes] = useState(review.likes || 0);
    const [userVote, setUserVote] = useState(review.isLikedByUser ? 'up' : null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isVoting, setIsVoting] = useState(false);

    // Update vote state when review changes
    useEffect(() => {
        setUserVote(review.isLikedByUser ? 'up' : null);
        setLocalLikes(review.likes || 0);
    }, [review]);

    // Normalize review fields to handle different formats
    const reviewData = {
        id: review.id,
        userId: review.userId || review.user_id,
        userName: review.user_name || review.userName || 'Пользователь',
        restaurantName: review.restaurant_name || review.restaurantName || 'Ресторан',
        rating: review.rating || 0,
        comment: review.comment || '',
        date: review.date || new Date().toISOString(),
        avatar: review.avatar ? getImageUrl(review.avatar) : null,
        likes: review.likes || 0,
        photos: processPhotosArray(review.photos || []),
        receiptPhoto: review.receiptPhoto ? getImageUrl(review.receiptPhoto) : null,
        hasReceipt: review.hasReceipt || Boolean(review.receiptPhoto) || (review.photos && review.photos.some(p => p.isReceipt)) || false,
        ratings: review.ratings || {
            food: review.foodRating || review.food_rating || 0,
            service: review.serviceRating || review.service_rating || 0,
            atmosphere: review.atmosphereRating || review.atmosphere_rating || 0,
            price: review.priceRating || review.price_rating || 0,
            cleanliness: review.cleanlinessRating || review.cleanliness_rating || 0
        },
        // Add manager response data
        responded: review.responded || Boolean(review.response) || false,
        response: review.response || '',
        responseDate: review.responseDate || null
    };

    // Function to process photos array to ensure proper format
    function processPhotosArray(photos) {
        if (!Array.isArray(photos)) {
            return [];
        }
        
        return photos.map(photo => {
            // If it's a string that might be JSON, try to parse it
            if (typeof photo === 'string' && (photo.startsWith('{') || photo.startsWith('['))) {
                try {
                    return JSON.parse(photo);
                } catch (e) {
                    return photo;
                }
            }
            return photo;
        });
    }

    // Check if this is the current user's review
    const isCurrentUserReview = user && (reviewData.userId === user.id);
    const restaurantSlug = reviewData.restaurantName ? reviewData.restaurantName.toLowerCase().replace(/\s+/g, '-') : '';

    const getCategoryName = (categoryId) => {
        const categories = {
            food: 'Качество блюд',
            service: 'Уровень сервиса',
            atmosphere: 'Атмосфера заведения',
            price: 'Соотношение цена/качество',
            cleanliness: 'Чистота помещения',
            deliverySpeed: 'Скорость доставки',
            deliveryQuality: 'Качество доставки'
        };
        return categories[categoryId] || categoryId;
    };

    const handleVote = async (voteType) => {
        if (!user) {
            return; // User must be logged in
        }
        
        if (isCurrentUserReview) {
            return; // Can't vote own review
        }
        
        if (isVoting || userVote === voteType) {
            return; // Already in process or already voted
        }
        
        try {
            setIsVoting(true);
            
            // Оптимистичное обновление UI
            setUserVote(voteType);
            setLocalLikes(prev => voteType === 'up' ? prev + 1 : prev - 1);
            
            // Затем вызываем API через родительский компонент
            await onLike(reviewData.id, voteType);
        } catch (error) {
            // В любом случае оставляем голос, если это ошибка "уже проголосовал"
            if (error.response?.data?.message === 'Отзыв уже оценен') {
                setUserVote(voteType);
            } else {
                // Только для других ошибок откатываем изменения
                console.error('Error voting review:', error);
                setLocalLikes(prev => voteType === 'up' ? prev - 1 : prev + 1);
                setUserVote(null);
            }
        } finally {
            setIsVoting(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
            setIsDeleting(true);
            try {
                await onDelete(reviewData.id);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    return (
        <motion.div 
            className="group relative w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
        >
            <Card
                className={`overflow-hidden transition-all duration-300 w-full
                           ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800 border-none'} 
                           shadow-md hover:shadow-xl
                           rounded-2xl border border-gray-200 dark:border-gray-700`}
            >
                <CardContent className="p-6">
                    {/* Профиль и базовая информация */}
                    <div className="flex flex-wrap md:flex-nowrap items-center mb-6 gap-4">
                        <div className="relative">
                            {reviewData.avatar ? (
                                <img
                                    src={reviewData.avatar}
                                    alt={reviewData.userName}
                                    className="w-14 h-14 rounded-full object-cover
                                            ring-2 ring-offset-2 ring-blue-50
                                            transition-transform group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700
                                            ring-2 ring-offset-2 ring-blue-50
                                            transition-transform group-hover:scale-105">
                                    <User size={24} className="text-gray-500 dark:text-gray-400" />
                                </div>
                            )}
                        </div>

                        <div className="flex-grow">
                            <h3 className={`font-semibold text-lg
                                           transition-colors group-hover:text-blue-600
                                           ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                                {reviewData.userName}
                            </h3>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {formatDate(reviewData.date)}
                                <span className="ml-1">
                                    
                                </span>
                            </div>
                        </div>

                        {/* Рейтинг */}
                        <div className="flex items-center text-gray-400">
                            {[1, 2, 3, 4, 5].map(star => (
                                <span
                                    key={star}
                                    className={`text-xl transition-colors ${
                                        star <= Math.round(reviewData.rating)
                                            ? "text-yellow-400"
                                            : isDarkMode ? "text-gray-600" : "text-gray-200"
                                    }`}
                                >
                                    ★
                                </span>
                            ))}
                            <span className={`ml-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {reviewData.rating}
                            </span>
                        </div>
                    </div>

                    {/* Текст отзыва */}
                    <p className={`mb-6 leading-relaxed
                                  border-l-4 border-gray-200 pl-4
                                  italic font-light
                                  ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        "{reviewData.comment}"
                    </p>

                    {/* Manager Response */}
                    {reviewData.responded && reviewData.response && (
                        <div className={`mb-6 mt-6 pt-4 pb-4 px-4 rounded-lg
                                      ${isDarkMode ? 'bg-gray-700 border-l-4 border-blue-600' : 'bg-blue-50 border-l-4 border-blue-500'}`}>
                            <div className="flex items-center mb-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center mr-2">
                                    <MessageCircle size={16} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                                        Ответ от ресторана "{reviewData.restaurantName}"
                                    </h4>
                                    {reviewData.responseDate && (
                                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {formatDate(reviewData.responseDate)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <p className={`text-sm ml-10 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {reviewData.response}
                            </p>
                        </div>
                    )}

                    {/* Receipt photo indicator if exists */}
                    {reviewData.hasReceipt && (
                        <div className={`mb-4 flex items-center text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            <Receipt className="w-3 h-3 mr-1" />
                            <span>Прикреплен чек</span>
                        </div>
                    )}
                    
                    {/* Photos section (including receipt) */}
                    {(reviewData.photos && reviewData.photos.length > 0) && (
                        <div className="mb-4">
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {reviewData.photos.map((photo, index) => (
                                    <div 
                                        key={index}
                                        className="flex-shrink-0 w-14 h-14 rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative"
                                        onClick={() => {
                                            try {
                                                const formattedUrl = getImageUrl(photo);
                                                if (formattedUrl) {
                                                    window.open(formattedUrl, '_blank');
                                                }
                                            } catch (error) {
                                                console.error("Error opening image:", error);
                                            }
                                        }}
                                    >
                                        <img 
                                            src={getImageUrl(photo)}
                                            alt={photo.isReceipt ? "Фото чека" : `Фото ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                                            }}
                                        />
                                        {photo.isReceipt && (
                                            <div className="absolute bottom-0 right-0 bg-blue-500 p-0.5 rounded-tl">
                                                <Receipt className="w-2.5 h-2.5 text-white" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ресторан */}
                    <div className={`mb-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span>Ресторан: </span>
                        <span className="font-medium">{reviewData.restaurantName}</span>
                    </div>

                    {/* Кнопки управления */}
                    <div className="flex justify-between items-center">
                        
                        <div className="flex items-center space-x-3">
                            {isCurrentUserReview && (
                                <motion.button
                                    onClick={handleDelete}
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    disabled={isDeleting}
                                    className={`p-1.5 rounded-full ${
                                        isDeleting 
                                            ? 'opacity-50' 
                                            : 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100'
                                    } transition-all shadow-sm hover:shadow`}
                                    title="Удалить отзыв"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </motion.button>
                            )}
                            <div className="flex flex-col items-center space-y-1">
                                <motion.button
                                    onClick={() => handleVote('up')}
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    disabled={isCurrentUserReview || !user || isVoting || userVote === 'up'}
                                    className={`flex items-center justify-center p-1 rounded-full transition-all ${
                                        userVote === 'up'
                                            ? 'text-green-500 bg-green-50 cursor-not-allowed'
                                            : isCurrentUserReview 
                                              ? 'text-gray-300 cursor-not-allowed'
                                              : isDarkMode 
                                                ? 'text-gray-400 hover:text-green-400 hover:bg-green-900/20' 
                                                : 'text-gray-500 hover:text-green-500 hover:bg-green-50'
                                    }`}
                                >
                                    <ChevronUp
                                        className={`w-5 h-5 ${isVoting ? 'animate-pulse' : ''}`}
                                        strokeWidth={2.5}
                                    />
                                </motion.button>
                                
                                <span className={`text-sm font-medium ${
                                    localLikes > 0 
                                        ? 'text-green-500' 
                                        : localLikes < 0 
                                            ? 'text-red-500'
                                            : 'text-gray-500'
                                }`}>
                                    {localLikes > 0 ? `+${localLikes}` : localLikes}
                                </span>
                                
                                <motion.button
                                    onClick={() => handleVote('down')}
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    disabled={isCurrentUserReview || !user || isVoting || userVote === 'down'}
                                    className={`flex items-center justify-center p-1 rounded-full transition-all ${
                                        userVote === 'down'
                                            ? 'text-red-500 bg-red-50 cursor-not-allowed'
                                            : isCurrentUserReview 
                                              ? 'text-gray-300 cursor-not-allowed'
                                              : isDarkMode 
                                                ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20' 
                                                : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                                    }`}
                                >
                                    <ChevronDown
                                        className={`w-5 h-5 ${isVoting ? 'animate-pulse' : ''}`}
                                        strokeWidth={2.5}
                                    />
                                </motion.button>
                            </div>
                        </div>

                        <motion.button
                            onClick={() => setShowDetails(!showDetails)}
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            className={`flex items-center transition-all text-sm font-medium px-3 py-1.5 rounded-lg
                                      ${isDarkMode ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20' : 'text-blue-500 hover:text-blue-600 hover:bg-blue-50'}`}
                        >
                            {showDetails ? (
                                <>
                                    <span>Свернуть детали</span>
                                    <ChevronUp className="w-4 h-4 ml-1" />
                                </>
                            ) : (
                                <>
                                    <span>Показать детали</span>
                                    <ChevronDown className="w-4 h-4 ml-1" />
                                </>
                            )}
                        </motion.button>
                    </div>
                    {showDetails && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.entries(reviewData.ratings).filter(([_, rating]) => rating > 0).map(([category, rating]) => (
                                    <motion.div
                                        key={category}
                                        whileHover={{ y: -2 }}
                                        className={`flex justify-between items-center
                                                 rounded-xl p-3 shadow-sm hover:shadow transition-all
                                                 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                                    >
                                        <span className={`text-sm mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {getCategoryName(category)}
                                        </span>
                                        <div className="flex items-center">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <span
                                                    key={star}
                                                    className={`text-sm transition-colors ${
                                                        star <= rating
                                                            ? "text-yellow-400"
                                                            : isDarkMode ? "text-gray-600" : "text-gray-200"
                                                    }`}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ReviewCard;
