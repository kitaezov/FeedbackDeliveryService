import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StarRating } from './StarRating';
import { Button, Card, Badge } from '../../../common/components/ui';
import { formatAddress } from '../../../common/utils/formatUtils';
import { FileText, Clock, Map, Phone, Mail, Globe, Coffee, Utensils, DollarSign, Wifi, Music, Car, Check, Star, ArrowRight, User } from 'lucide-react';
import { restaurantService } from '../services/restaurantService';

/**
 * Компонент для отображения подробной информации о ресторане
 * 
 * @param {Object} props
 * @param {Object} props.restaurant - Данные ресторана
 * @param {Function} props.onAddReview - Функция для добавления отзыва
 * @returns {JSX.Element}
 */

// Анимации для карточек и элементов
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
            type: 'tween',
            duration: 0.15
        }
    },
    hover: {
        scale: 1.01,
        transition: { duration: 0.15, type: "tween" }
    }
};

// Анимации для иконок
const iconVariants = {
    hover: { 
        scale: 1.1,
        rotate: 3,
        transition: { 
            duration: 0.15,
            type: "tween"
        }
    }
};

// Анимации для кнопок
const buttonVariants = {
    hover: {
        scale: 1.03,
        transition: { 
            duration: 0.15,
            type: "tween" 
        }
    },
    tap: {
        scale: 0.97,
        transition: { 
            duration: 0.1 
        }
    }
};

// Сопоставление особенностей с иконками
const featureIcons = {
    "Wi-Fi": Wifi,
    "Парковка": Car,
    "Живая музыка": Music,
    "Доставка": Utensils,
    "Веранда": Coffee,
    // Добавьте другие соответствия по необходимости
};

// Утилитная функция для форматирования URL изображения
const getImageUrl = (image) => {
    if (!image) return null;
    
    // Если это полный URL, используйте его напрямую
    if (image.startsWith('http://') || image.startsWith('https://')) {
        return image;
    }
    
    // Если он начинается с косой черты, добавьте базовый URL API
    if (image.startsWith('/')) {
        return `${process.env.REACT_APP_API_URL || ''}${image}`;
    }
    
    // Если он имеет домен, но не протокол, добавьте https://
    if (image.includes('.') && !image.includes(' ') && !image.match(/^[a-zA-Z]+:\/\//)) {
        return 'https://' + image;
    }
    
    // В противном случае, добавьте базовый URL API
    return `${process.env.REACT_APP_API_URL || ''}${image}`;
};

export const RestaurantDetails = ({ restaurant, onAddReview }) => {
    const [activeTab, setActiveTab] = useState('details');
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [reviewError, setReviewError] = useState(null);
    
    // Fetch reviews when the component mounts or when the restaurant ID changes
    useEffect(() => {
        if (restaurant?.id) {
            fetchRestaurantReviews();
        }
    }, [restaurant?.id]);
    
    // Function to fetch reviews for this restaurant
    const fetchRestaurantReviews = async () => {
        if (!restaurant?.id) return;
        
        try {
            setLoadingReviews(true);
            setReviewError(null);
            
            console.log('Fetching reviews for restaurant ID:', restaurant.id);
            const response = await restaurantService.getRestaurantReviews(restaurant.id);
            console.log('Reviews response received:', response);
            
            // Check for reviews in the response
            if (response && Array.isArray(response.reviews)) {
                setReviews(response.reviews);
                console.log(`Successfully loaded ${response.reviews.length} reviews for restaurant ${restaurant.id}`);
            } else {
                console.warn('No valid reviews array found in the response');
                setReviews([]);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setReviewError('Не удалось загрузить отзывы');
            setReviews([]);
        } finally {
            setLoadingReviews(false);
        }
    };
    
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'reviews' && reviews.length === 0) {
            fetchRestaurantReviews();
        }
    };
    
    // Обработчик для открытия меню ресторана в PDF
    const handleOpenMenu = async () => {
        // Используем новый метод из сервиса для открытия меню с обработкой ошибок
        try {
            await restaurantService.openRestaurantMenu(restaurant.id, () => {
                // Если меню не найдено, показываем сообщение пользователю
                alert('Меню этого ресторана еще не добавлено');
            });
        } catch (error) {
            console.error('Error opening restaurant menu:', error);
        }
    };
    
    if (!restaurant) {
        return <div className="text-center py-8">Загрузка информации о ресторане...</div>;
    }
    
    const {
        id,
        name,
        image,
        description,
        cuisine,
        address,
        rating,
        reviewCount,
        priceRange,
        workingHours,
        features,
        contacts
    } = restaurant;
    
    // Преобразуем диапазон цен в символы
    const renderPriceRange = () => {
        if (!priceRange) return null;
        return Array(priceRange).fill('$').join('');
    };

    // Функция для правильного склонения слова "звезда" в зависимости от числа
    const getStarWord = (rating) => {
        const lastDigit = rating % 10;
        const lastTwoDigits = rating % 100;
        
        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
            return 'звёзд';
        }
        
        if (lastDigit === 1) {
            return 'звезда';
        }
        
        if (lastDigit >= 2 && lastDigit <= 4) {
            return 'звезды';
        }
        
        return 'звёзд';
    };

    // Получить иконку для особенности
    const getFeatureIcon = (feature) => {
        const Icon = featureIcons[feature] || Utensils;
        return Icon;
    };
    
    // Add this function to render reviews
    const renderReviews = () => {
        if (loadingReviews) {
            return (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700 dark:border-gray-300"></div>
                </div>
            );
        }
        
        if (reviewError) {
            return (
                <div className="p-4 text-center text-red-500">
                    <p>{reviewError}</p>
                    <button 
                        onClick={fetchRestaurantReviews}
                        className="mt-2 text-blue-500 hover:underline"
                    >
                        Попробовать снова
                    </button>
                </div>
            );
        }
        
        if (reviews.length === 0) {
            return (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-8 bg-gray-50 dark:bg-gray-700 text-center rounded-lg border border-gray-100 dark:border-gray-600 shadow-sm"
                >
                    <motion.div 
                        className="inline-block mb-4"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                            type: "spring",
                            stiffness: 400,
                            damping: 20
                        }}
                    >
                        <Star className="w-12 h-12 text-gray-300 dark:text-gray-500 mx-auto" />
                    </motion.div>
                    <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Ещё нет отзывов</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Делитесь своими впечатлениями и помогайте другим сделать выбор
                    </p>
                    <motion.button
                        onClick={onAddReview}
                        className="text-white bg-gray-700 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        Оставить первый отзыв
                    </motion.button>
                </motion.div>
            );
        }
        
        return (
            <div className="space-y-4">
                {reviews.map((review) => (
                    <motion.div 
                        key={review.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                                {review.author?.avatar ? (
                                    <img 
                                        src={review.author.avatar} 
                                        alt={review.author.name || review.user_name || "User"} 
                                        className="w-10 h-10 rounded-full mr-3"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                                        <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                    </div>
                                )}
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {review.author?.name || review.user_name || review.userName || "Анонимный пользователь"}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(review.date || review.created_at).toLocaleDateString('ru-RU', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        fill={i < Math.round(review.rating || 0) ? "#FFB800" : "none"}
                                        stroke={i < Math.round(review.rating || 0) ? "#FFB800" : "#94a3b8"}
                                        className="mr-0.5"
                                    />
                                ))}
                            </div>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300">
                            {review.comment || review.text || "Пользователь не оставил комментарий"}
                        </p>
                        
                        {review.photos && review.photos.length > 0 && (
                            <div className="mt-3 flex gap-2 overflow-x-auto py-2">
                                {review.photos.map((photo, index) => (
                                    <img 
                                        key={index}
                                        src={typeof photo === 'string' ? photo : photo.url} 
                                        alt={`Фото ${index + 1} к отзыву`}
                                        className="h-20 w-auto rounded-md object-cover"
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        );
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {/* Изображение ресторана */}
            <div className="relative h-64 w-full">
                <img 
                    src={getImageUrl(image)} 
                    alt={name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="p-4 text-white">
                        <h1 className="text-2xl md:text-3xl font-bold">{name}</h1>
                        <div className="flex items-center mt-2">
                            <StarRating rating={rating} size="md" />
                            <span className="ml-2 text-sm">
                                {rating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? 'отзыв' : 
                                    reviewCount > 1 && reviewCount < 5 ? 'отзыва' : 'отзывов'})
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {cuisine && (
                                <Badge variant="secondary" size="sm">
                                    {cuisine}
                                </Badge>
                            )}
                            {priceRange && (
                                <Badge variant="secondary" size="sm">
                                    {renderPriceRange()}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Вкладки */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex">
                    <button
                        className={`px-4 py-3 text-sm font-medium border-b-2 ${
                            activeTab === 'details'
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                        onClick={() => handleTabChange('details')}
                    >
                        Описание
                    </button>
                    <button
                        className={`px-4 py-3 text-sm font-medium border-b-2 ${
                            activeTab === 'reviews'
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                        onClick={() => handleTabChange('reviews')}
                    >
                        Отзывы ({reviewCount})
                    </button>
                </nav>
            </div>
            
            {/* Содержимое вкладок */}
            <div className="p-4">
                {activeTab === 'details' ? (
                    <div className="space-y-6">
                        {/* Описание */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2">О ресторане</h3>
                            <p className="text-gray-700 dark:text-gray-300">{description}</p>
                        </div>
                        
                        {/* Кнопка меню */}
                        <motion.div
                            className="flex justify-center"
                            initial="hidden"
                            animate="visible"
                            variants={cardVariants}
                        >
                            <motion.button
                                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-colors w-full justify-center"
                                onClick={handleOpenMenu}
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                            >
                                <motion.div variants={iconVariants}>
                                    <FileText size={20} />
                                </motion.div>
                                Посмотреть меню
                            </motion.button>
                        </motion.div>
                        
                        {/* Особенности - обновленный стиль */}
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                            <h3 className="text-lg font-semibold mb-3 flex items-center">
                                <motion.div variants={iconVariants} whileHover="hover">
                                    <Coffee className="w-5 h-5 mr-2 text-primary-500" />
                                </motion.div>
                                Особенности
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {features && features.map((feature, index) => (
                                    <motion.div 
                                        key={index}
                                        className="flex items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
                                        whileHover="hover"
                                        variants={cardVariants}
                                    >
                                        <motion.div variants={iconVariants}>
                                            {React.createElement(getFeatureIcon(feature), { 
                                                className: "w-5 h-5 text-gray-500 dark:text-gray-400 mr-2"
                                            })}
                                        </motion.div>
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {feature}
                                        </span>
                                    </motion.div>
                                ))}
                                {(!features || features.length === 0) && (
                                    <p className="text-gray-500 dark:text-gray-400 text-sm col-span-2">
                                        Информация об особенностях не указана
                                    </p>
                                )}
                            </div>
                        </motion.div>
                        
                        {/* Контактная информация */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <motion.div
                                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                whileHover="hover"
                            >
                                <h3 className="text-lg font-semibold mb-3 flex items-center">
                                    <motion.div variants={iconVariants} whileHover="hover">
                                        <Map className="w-5 h-5 mr-2 text-primary-500" />
                                    </motion.div>
                                    Контактная информация
                                </h3>
                                <ul className="space-y-2">
                                    <motion.li className="flex items-start p-2 bg-gray-50 dark:bg-gray-700 rounded-lg" whileHover="hover" variants={cardVariants}>
                                        <motion.div variants={iconVariants}>
                                            <Map className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                        </motion.div>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {formatAddress(address)}
                                        </span>
                                    </motion.li>
                                    {contacts?.phone && (
                                        <motion.li className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg" whileHover="hover" variants={cardVariants}>
                                            <motion.div variants={iconVariants}>
                                                <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                                            </motion.div>
                                            <a href={`tel:${contacts.phone}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                                                {contacts.phone}
                                            </a>
                                        </motion.li>
                                    )}
                                    {contacts?.email && (
                                        <motion.li className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg" whileHover="hover" variants={cardVariants}>
                                            <motion.div variants={iconVariants}>
                                                <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                                            </motion.div>
                                            <a href={`mailto:${contacts.email}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                                                {contacts.email}
                                            </a>
                                        </motion.li>
                                    )}
                                    {contacts?.website && (
                                        <motion.li className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg" whileHover="hover" variants={cardVariants}>
                                            <motion.div variants={iconVariants}>
                                                <Globe className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                                            </motion.div>
                                            <a href={contacts.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">
                                                {contacts.website.replace(/^https?:\/\//, '')}
                                            </a>
                                        </motion.li>
                                    )}
                                </ul>
                            </motion.div>
                            
                            <motion.div
                                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                whileHover="hover"
                            >
                                <h3 className="text-lg font-semibold mb-3 flex items-center">
                                    <motion.div variants={iconVariants} whileHover="hover">
                                        <Clock className="w-5 h-5 mr-2 text-primary-500" />
                                    </motion.div>
                                    Время работы
                                </h3>
                                {workingHours ? (
                                    <ul className="space-y-2">
                                        {Object.entries(workingHours).map(([day, hours]) => (
                                            <motion.li 
                                                key={day} 
                                                className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                                whileHover="hover"
                                                variants={cardVariants}
                                            >
                                                <span className="text-gray-700 dark:text-gray-300 capitalize">
                                                    {day}:
                                                </span>
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    {hours || 'Закрыто'}
                                                </span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                        Информация о времени работы не указана
                                    </p>
                                )}
                            </motion.div>
                        </div>

                        {/* Добавление блока с отзывами для дополнительной информации */}
                        <motion.div
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                        >
                            <h3 className="text-lg font-semibold mb-3 flex items-center">
                                <motion.div variants={iconVariants} whileHover="hover">
                                    <Star className="w-5 h-5 mr-2 text-primary-500" />
                                </motion.div>
                                Отзывы
                            </h3>
                            {reviewCount > 0 ? (
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    <p>У ресторана {reviewCount} {reviewCount === 1 ? 'отзыв' : reviewCount > 1 && reviewCount < 5 ? 'отзыва' : 'отзывов'} и рейтинг {rating.toFixed(1)}/5 {getStarWord(Math.round(rating))}</p>
                                    <motion.button
                                        className="mt-2 text-primary-600 dark:text-primary-400 hover:underline flex items-center"
                                        onClick={() => handleTabChange('reviews')}
                                        whileHover="hover"
                                        variants={buttonVariants}
                                    >
                                        Посмотреть все отзывы →
                                    </motion.button>
                                </div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="p-8 bg-gray-50 dark:bg-gray-700 text-center rounded-lg border border-gray-100 dark:border-gray-600 shadow-sm"
                                >
                                    <motion.div 
                                        className="inline-block mb-4"
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        transition={{ 
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 20
                                        }}
                                    >
                                        <Star className="w-12 h-12 text-gray-300 dark:text-gray-500 mx-auto" />
                                    </motion.div>
                                    <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Ещё нет отзывов</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        Делитесь своими впечатлениями и помогайте другим сделать выбор
                                    </p>
                                    <motion.button
                                        onClick={onAddReview}
                                        className="text-white bg-gray-700 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        Оставить первый отзыв
                                    </motion.button>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Отзывы посетителей</h3>
                            <Button 
                                variant="primary" 
                                size="sm"
                                onClick={onAddReview}
                            >
                                Оставить отзыв
                            </Button>
                        </div>
                        
                        {renderReviews()}
                    </div>
                )}
            </div>
        </div>
    );
}; 