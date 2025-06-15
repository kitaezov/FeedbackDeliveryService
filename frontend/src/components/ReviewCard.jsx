import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Trash2, User, Receipt, ImageIcon, MessageCircle, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from './Card';
import { motion } from 'framer-motion';
import { restaurantData } from '../features/restaurants/restaurantData';
import { getCategoryName } from '../features/restaurants/constants/categories';

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

const ReviewCard = ({ review, user, onDelete = () => {}, isDarkMode = false }) => {
    // Добавляем лог для отладки объекта отзыва
    console.log('Получен отзыв в ReviewCard:', review);
    
    const [showDetails, setShowDetails] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showResponse, setShowResponse] = useState(true);

    // Проверяем наличие отзыва
    if (!review) {
        console.warn('ReviewCard: получен пустой объект отзыва');
        return null;
    }

    // Нормализация полей отзыва для обработки разных форматов данных
    const reviewData = {
        id: review.id,
        userId: review.userId || review.user_id,
        userName: review.author?.name || review.user_name || review.userName || review.name || 'Аноним',
        restaurantName: review.restaurant_name || review.restaurantName || 'Ресторан',
        restaurantCategory: review.restaurant_category || review.restaurantCategory,
        rating: Number(review.rating) || 0,
        comment: review.comment || review.text || '',
        date: review.created_at || review.date || new Date().toISOString(),
        avatar: review.avatar ? getImageUrl(review.avatar) : null,
        photos: Array.isArray(review.photos) ? review.photos.map(photo => 
            typeof photo === 'string' ? { url: getImageUrl(photo) } : photo
        ) : [],
        receiptPhoto: review.receipt_photo ? getImageUrl(review.receipt_photo) : null,
        hasReceipt: review.has_receipt || Boolean(review.receipt_photo) || (Array.isArray(review.photos) && review.photos.some(p => p.isReceipt)) || false,
        ratings: {
            food: Number(review.food_rating || review.ratings?.food || 0),
            service: Number(review.service_rating || review.ratings?.service || 0),
            atmosphere: Number(review.atmosphere_rating || review.ratings?.atmosphere || 0),
            price: Number(review.price_rating || review.ratings?.price || 0),
            cleanliness: Number(review.cleanliness_rating || review.ratings?.cleanliness || 0)
        },
        responded: Boolean(review.responded || review.response),
        response: review.response || '',
        responseDate: review.response_date || review.responseDate || null,
        managerName: review.manager_name || review.managerName || ''
    };

    // Проверяем, принадлежит ли отзыв текущему пользователю
    const isCurrentUserReview = user && (user.id === reviewData.userId);

    // Обработчик удаления отзыва
    const handleDelete = async () => {
        if (window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
            setIsDeleting(true);
            try {
                await onDelete(reviewData.id);
            } catch (error) {
                console.error('Ошибка при удалении отзыва:', error);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    // Форматирование даты
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Ошибка форматирования даты:', error);
            return dateString;
        }
    };

    // Анимация для кнопок
    const buttonVariants = {
        hover: { scale: 1.05 },
        tap: { scale: 0.95 }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
        >
            <Card className={`w-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 
                                ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                {reviewData.avatar ? (
                                    <img 
                                        src={reviewData.avatar} 
                                        alt={reviewData.userName}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <User className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                )}
                            </div>
                            <div>
                                <h3 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                    {reviewData.userName}
                                </h3>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {formatDate(reviewData.date)}
                                </p>
                            </div>
                        </div>
                        
                        {/* Рейтинг */}
                        <div className="flex items-center">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        className={`text-lg ${
                                            star <= reviewData.rating
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
                    </div>

                    {/* Текст отзыва */}
                    <p className={`mb-6 leading-relaxed
                                border-l-4 border-gray-200 pl-4
                                italic font-light
                                ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        "{reviewData.comment}"
                    </p>

                    {/* Ответ менеджера */}
                    {reviewData.response && (
                        <div className="mb-2">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                    <MessageCircle size={16} className={`mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                    <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                        Ответ от ресторана
                                    </span>
                                </div>
                                <motion.button
                                    onClick={() => setShowResponse(!showResponse)}
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'} transition-all`}
                                >
                                    {showResponse ? "Скрыть" : "Показать"}
                                </motion.button>
                            </div>

                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ 
                                    opacity: showResponse ? 1 : 0,
                                    height: showResponse ? 'auto' : 0
                                }}
                                transition={{ 
                                    duration: 0.3,
                                    ease: "easeInOut"
                                }}
                                className="overflow-hidden"
                            >
                                <div className={`mb-6 pt-4 pb-4 px-4 rounded-lg
                                    ${isDarkMode ? 'bg-gray-700 border-l-4 border-blue-600' : 'bg-blue-50 border-l-4 border-blue-500'}`}>
                                    <div className="flex items-center mb-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center mr-2">
                                            <MessageCircle size={16} className="text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                                                Ответ от ресторана "{reviewData.restaurantName}"
                                                {reviewData.managerName && <span className="ml-1">• {reviewData.managerName}</span>}
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
                            </motion.div>
                        </div>
                    )}

                    {/* Индикатор наличия чека */}
                    {reviewData.hasReceipt && (
                        <div className={`mb-4 flex items-center text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            <Receipt className="w-3 h-3 mr-1" />
                            <span>Прикреплен чек</span>
                        </div>
                    )}
                    
                    {/* Секция фотографий (включая чек) */}
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
                                                console.error("Ошибка при открытии изображения:", error);
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
                        {reviewData.restaurantCategory && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {getCategoryName(reviewData.restaurantCategory)}
                            </div>
                        )}
                    </div>

                    {/* Кнопки управления */}
                    <div className="flex justify-between items-center">
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
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ReviewCard;