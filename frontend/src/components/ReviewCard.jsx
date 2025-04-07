<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Heart, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
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

const ReviewCard = ({ review, user, onLike = () => {}, onDelete = () => {}, isDarkMode = false }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [localLikes, setLocalLikes] = useState(review.likes || 0);
    const [isLiked, setIsLiked] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLiking, setIsLiking] = useState(false);

    // Check if this is the current user's review
    const isCurrentUserReview = user && review.userId === user.id;
    const restaurantSlug = review.restaurantSlug || (review.restaurantName ? review.restaurantName.toLowerCase().replace(/\s+/g, '-') : '');

    const getCategoryName = (categoryId) => {
        const categories = {
            food: 'Качество блюд',
            service: 'Уровень сервиса',
            atmosphere: 'Атмосфера заведения',
            price: 'Соотношение цена/качество',
            cleanliness: 'Чистота помещения'
        };
        return categories[categoryId] || categoryId;
    };

    const handleLike = async () => {
        if (!user) {
            return; // User must be logged in
        }
        
        if (isCurrentUserReview) {
            return; // Can't like your own review
        }
        
        if (isLiked || isLiking) {
            return; // Already liked or in process
        }
        
        try {
            setIsLiking(true);
            // First visually update the UI for better user experience
            setLocalLikes(prev => prev + 1);
            setIsLiked(true);
            
            // Then call the API
            await onLike(review.id);
        } catch (error) {
            // If there was an error, revert the UI change
            console.error('Error liking review:', error);
            setLocalLikes(prev => prev - 1);
            setIsLiked(false);
        } finally {
            setIsLiking(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
            setIsDeleting(true);
            try {
                await onDelete(review.id);
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
                            <img
                                src={review.avatar || restaurantData[1]?.logo}
                                alt={review.user_name || review.userName || 'Пользователь'}
                                className="w-14 h-14 rounded-full object-cover
                                           ring-2 ring-offset-2 ring-blue-50
                                           transition-transform group-hover:scale-105"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = restaurantData[1]?.logo;
                                }}
                            />
                        </div>

                        <div className="flex-grow">
                            <h3 className={`font-semibold text-lg
                                           transition-colors group-hover:text-blue-600
                                           ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                                {review.user_name || review.userName || 'Пользователь'}
                            </h3>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {review.date || 'Дата не указана'} •
                                <Link
                                    to={`/restaurant-ratings?restaurant=${restaurantSlug}`}
                                    className="ml-1 text-blue-400
                                               hover:text-blue-600
                                               transition-colors"
                                >
                                    {review.restaurantName || 'Неизвестное заведение'}
                                </Link>
                            </div>
                        </div>

                        {/* Рейтинг */}
                        <div className="flex items-center text-gray-400">
                            {[1, 2, 3, 4, 5].map(star => (
                                <span
                                    key={star}
                                    className={`text-xl transition-colors ${
                                        star <= Math.round(review.rating)
                                            ? "text-yellow-400"
                                            : isDarkMode ? "text-gray-600" : "text-gray-200"
                                    }`}
                                >
                                    ★
                                </span>
                            ))}
                            <span className={`ml-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {review.rating}
                            </span>
                        </div>
                    </div>

                    {/* Текст отзыва */}
                    <p className={`mb-6 leading-relaxed
                                  border-l-4 border-gray-200 pl-4
                                  italic font-light
                                  ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        "{review.comment}"
                    </p>

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
                            <motion.button
                                onClick={handleLike}
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                disabled={isCurrentUserReview || !user || isLiked || isLiking}
                                className={`flex items-center transition-all px-3 py-1.5 rounded-full ${
                                    isLiked
                                        ? 'text-red-500 bg-red-50'
                                        : isCurrentUserReview 
                                          ? 'text-gray-300 cursor-not-allowed'
                                          : isDarkMode 
                                            ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20' 
                                            : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                                }`}
                            >
                                <Heart
                                    className={`w-4 h-4 mr-2 ${isLiking ? 'animate-pulse' : ''}`}
                                    fill={isLiked ? 'currentColor' : 'none'}
                                    strokeWidth={1.5}
                                />
                                <span className="font-medium">{localLikes}</span>
                            </motion.button>
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

                    {/* Детальные оценки */}
                    {showDetails && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.entries(review.ratings || {}).filter(([_, rating]) => rating > 0).map(([category, rating]) => (
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
=======
import React from 'react';
import PropTypes from 'prop-types';
import { Star, ThumbsUp } from 'lucide-react';

/**
 * Компонент карточки отзыва для отображения информации о ресторане
 * @component
 * @param {Object} props - Свойства компонента
 * @param {Object} props.review - Объект с данными отзыва
 * @param {string} props.review.id - Уникальный идентификатор отзыва
 * @param {string} props.review.userName - Имя пользователя
 * @param {string} props.review.avatar - URL аватара пользователя
 * @param {string} props.review.date - Дата отзыва
 * @param {number} props.review.rating - Рейтинг (от 0 до 5)
 * @param {string} props.review.comment - Текст комментария
 * @param {number} props.review.likes - Количество лайков
 * @param {string} props.review.restaurantName - Название ресторана
 */
const ReviewCard = ({ review }) => {
    try {
        // Функция для генерации звёзд рейтинга
        const renderStars = () => {
            try {
                return [...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`h-4 w-4 ${
                            i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                        data-testid={`star-${i}`}
                    />
                ));
            } catch (error) {
                console.error('Ошибка при рендеринге звезд:', error);
                return null;
            }
        };

        // Обработчик ошибок загрузки изображения
        const handleImageError = (e) => {
            try {
                e.currentTarget.src = '/default-avatar.png';
                console.warn('Ошибка загрузки изображения. Установлено изображение по умолчанию.');
            } catch (error) {
                console.error('Ошибка при обработке ошибки загрузки изображения:', error);
            }
        };

        return (
            <div
                className="p-4 border-b dark:border-gray-700 transform transition-all duration-200 dark:hover:bg-gray-750"
                data-testid="review-card"
            >
                <div className="flex items-start space-x-4">
                    <img
                        src={review.avatar}
                        alt={`${review.userName}'s avatar`}
                        className="w-10 h-10 rounded-full shadow-md"
                        onError={handleImageError}
                        data-testid="avatar-image"
                    />
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{review.userName}</h3>
                            <span className="text-sm text-gray-500">{review.date}</span>
                        </div>

                        <div className="flex items-center space-x-1 my-1" data-testid="rating-stars">
                            {renderStars()}
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {review.comment}
                        </p>

                        <div className="flex items-center space-x-4 mt-2">
                            <button
                                className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
                                data-testid="like-button"
                            >
                                <ThumbsUp className="h-4 w-4" />
                                <span>{review.likes}</span>
                            </button>
                            <span className="text-gray-500 italic">
                                {review.restaurantName}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('Ошибка при рендеринге ReviewCard:', error);
        return null;
    }
};

ReviewCard.propTypes = {
    review: PropTypes.shape({
        id: PropTypes.string.isRequired,
        userName: PropTypes.string.isRequired,
        avatar: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        rating: PropTypes.number.isRequired,
        comment: PropTypes.string.isRequired,
        likes: PropTypes.number.isRequired,
        restaurantName: PropTypes.string.isRequired
    }).isRequired
};

export { ReviewCard };
>>>>>>> c0de413dc1865264c2ef241c20aa63fec52080b1
