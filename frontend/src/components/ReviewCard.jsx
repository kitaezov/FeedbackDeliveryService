import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Heart, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Card, CardContent } from './Card';
import { motion } from 'framer-motion';
import { restaurantData } from '../features/restaurants/restaurantData';

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
        <div className="group relative w-full card-equal">
            <Card
                className={`overflow-hidden transition-all duration-300 w-full
                           ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800 border-none'} 
                           shadow-[0_4px_20px_rgba(0,0,0,0.05)]
                           hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)]
                           rounded-2xl
                           card-body-fill`}
            >
                <CardContent className="card-content">
                    {/* Профиль и базовая информация */}
                    <div className="flex flex-wrap md:flex-nowrap items-center mb-6 gap-4">
                        <div className="relative">
                            <img
                                src={review.avatar || restaurantData[1]?.logo}
                                alt={review.user_name || review.userName || 'Пользователь'}
                                className="avatar-md rounded-full object-cover
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
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    disabled={isDeleting}
                                    className={`transition-all ${
                                        isDeleting ? 'opacity-50' : 'text-red-500 hover:text-red-600'
                                    }`}
                                    title="Удалить отзыв"
                                >
                                    <Trash2 className="icon-md" />
                                </motion.button>
                            )}
                            <button
                                onClick={handleLike}
                                disabled={isCurrentUserReview || !user || isLiked || isLiking}
                                className={`flex items-center transition-all ${
                                    isLiked
                                        ? 'text-red-500'
                                        : isCurrentUserReview 
                                          ? 'text-gray-300 cursor-not-allowed'
                                          : isDarkMode 
                                            ? 'text-gray-400 hover:text-red-400' 
                                            : 'text-gray-400 hover:text-red-500'
                                }`}
                            >
                                <Heart
                                    className={`icon-md mr-2 ${isLiking ? 'animate-pulse' : ''}`}
                                    fill={isLiked ? 'currentColor' : 'none'}
                                    strokeWidth={1.5}
                                />
                                <span className="font-medium">{localLikes}</span>
                            </button>
                        </div>

                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className={`flex items-center transition-all text-sm font-medium
                                      ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'}`}
                        >
                            {showDetails ? (
                                <>
                                    <span>Свернуть детали</span>
                                    <ChevronUp className="icon-sm ml-1" />
                                </>
                            ) : (
                                <>
                                    <span>Показать детали</span>
                                    <ChevronDown className="icon-sm ml-1" />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Детальные оценки */}
                    {showDetails && (
                        <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.entries(review.ratings || {}).filter(([_, rating]) => rating > 0).map(([category, rating]) => (
                                    <div
                                        key={category}
                                        className={`flex justify-between items-center
                                                 rounded-lg p-3
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
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ReviewCard;