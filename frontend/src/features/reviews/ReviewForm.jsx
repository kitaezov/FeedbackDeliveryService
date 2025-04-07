import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { User, MapPin, DollarSign, Award, Smile, Star, Clock, Phone, Globe, ChevronLeft, X, Heart, ThumbsUp, Check, FileText, Camera, ThumbsDown, ImagePlus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import api from '../../utils/api';
import { API_BASE, API_URL } from '../../config';
import { restaurantService } from '../../features/restaurants/services/restaurantService';

const RestaurantButton = ({ restaurant, isSelected, onSelect }) => (
    <motion.button
        type="button"
        onClick={() => onSelect(restaurant)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.2 }}
        className={`
            w-full p-0 rounded-lg transition-all 
            border relative overflow-hidden
            ${isSelected
            ? 'border-gray-400 ring-2 ring-gray-400'
            : 'border-gray-200 hover:border-gray-300'}
        `}
    >
        <div className="w-full pt-[60%] relative">
            <img
                src={restaurant.image}
                alt={`${restaurant.name} cuisine`}
                className="absolute top-0 left-0 w-full h-full object-cover"
            />
        </div>
        <div className="p-2">
            <h3 className="font-medium text-sm text-gray-700 truncate">
                {restaurant.name}
            </h3>
            <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500 truncate">
                    {restaurant.cuisine} | {restaurant.priceRange}
                </p>
                <div className="flex items-center">
                    <Star className="w-3 h-3 text-yellow-500 mr-1" />
                    <span className="text-xs font-medium text-gray-600">{restaurant.avgRating}</span>
                </div>
            </div>
        </div>
    </motion.button>
);

const StarRating = ({ value, onClick, size = "normal" }) => {
    return (
        <motion.button
            type="button"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className={`
                ${size === "normal" ? 'w-6 h-6' : 'w-4 h-4'} transition-colors
                ${value ? 'text-yellow-500' : 'text-gray-300 hover:text-gray-400'}
            `}
        >
            ★
        </motion.button>
    );
};

// Animation variants for feature blocks (similar to NavigationBar animations)
const featureBlockVariants = {
    hover: {
        scale: 1.02,
        transition: { 
            duration: 0.2,
            type: "spring", 
            stiffness: 400 
        }
    },
    tap: {
        scale: 0.98,
        transition: { 
            duration: 0.1 
        }
    }
};

// Animation variants for icons
const iconVariants = {
    hover: { 
        scale: 1.15,
        rotate: 5,
        transition: { 
            duration: 0.2,
            type: "spring", 
            stiffness: 400 
        }
    }
};

// Animation variants for buttons
const buttonVariants = {
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

// Modified RestaurantDetailModal component to include the review form directly
const RestaurantDetailModal = ({ restaurant, onClose, onReviewSubmitted, user }) => {
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [ratings, setRatings] = useState({});
    const [feedback, setFeedback] = useState('');
    const [showValidation, setShowValidation] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [restaurantReviews, setRestaurantReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [photos, setPhotos] = useState([]);
    const fileInputRef = useRef(null);

    // Cleanup object URLs when component unmounts
    useEffect(() => {
        return () => {
            photos.forEach(photo => {
                if (photo.preview) {
                    URL.revokeObjectURL(photo.preview);
                }
            });
        };
    }, [photos]);

    // Fetch reviews for the restaurant when it's selected
    useEffect(() => {
        const fetchRestaurantReviews = async () => {
            if (!restaurant) return;
            
            try {
                setLoadingReviews(true);
                const response = await api.get(`/reviews?restaurantName=${encodeURIComponent(restaurant.name)}`);
                
                if (response.data && response.data.reviews) {
                    setRestaurantReviews(response.data.reviews);
                }
            } catch (error) {
                console.error('Error fetching restaurant reviews:', error);
            } finally {
                setLoadingReviews(false);
            }
        };

        fetchRestaurantReviews();
    }, [restaurant]);

    if (!restaurant) return null;

    const ratingCategories = [
        {id: 'food', name: 'Качество блюд', icon: <Star className="w-5 h-5 text-gray-400"/>},
        {id: 'service', name: 'Уровень сервиса', icon: <Smile className="w-5 h-5 text-gray-400"/>},
        {id: 'atmosphere', name: 'Атмосфера', icon: <MapPin className="w-5 h-5 text-gray-400"/>},
        {id: 'price', name: 'Цена/Качество', icon: <DollarSign className="w-5 h-5 text-gray-400"/>},
        {id: 'cleanliness', name: 'Чистота', icon: <Award className="w-5 h-5 text-gray-400"/>}
    ];

    const handlePhotoSelect = (e) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const selectedFiles = Array.from(e.target.files);
        const maxPhotos = 5;
        const maxSizeInMB = 5; // Maximum file size in MB
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024; // Convert to bytes
        
        // Validate and filter files
        const validFiles = selectedFiles.filter(file => {
            // Check file type
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                const event = new CustomEvent('notification', {
                    detail: {
                        type: 'error',
                        message: `Неподдерживаемый тип файла: ${file.name}. Разрешены только JPEG, PNG, GIF, и WebP.`
                    }
                });
                document.dispatchEvent(event);
                return false;
            }
            
            // Check file size
            if (file.size > maxSizeInBytes) {
                const event = new CustomEvent('notification', {
                    detail: {
                        type: 'error',
                        message: `Файл слишком большой: ${file.name}. Максимальный размер: ${maxSizeInMB}МБ.`
                    }
                });
                document.dispatchEvent(event);
                return false;
            }
            
            return true;
        });
        
        if (validFiles.length === 0) return;
        
        // Check if adding these would exceed the maximum
        if (photos.length + validFiles.length > maxPhotos) {
            const event = new CustomEvent('notification', {
                detail: {
                    type: 'warning',
                    message: `Вы можете загрузить максимум ${maxPhotos} фотографий`
                }
            });
            document.dispatchEvent(event);
            
            // Only add photos up to the maximum
            const remainingSlots = maxPhotos - photos.length;
            if (remainingSlots <= 0) return;
            
            validFiles.splice(remainingSlots);
        }
        
        // Generate previews for selected files
        const newPhotos = validFiles.map(file => ({
            file,
            id: Math.random().toString(36).substring(2),
            preview: URL.createObjectURL(file)
        }));
        
        console.log('Добавление фотографий:', newPhotos.map(p => ({
            name: p.file.name, 
            type: p.file.type,
            size: `${(p.file.size / 1024).toFixed(1)} KB`
        })));
        
        setPhotos(prevPhotos => [...prevPhotos, ...newPhotos]);
        
        // Reset the file input to allow selecting the same files again
        e.target.value = '';
    };
    
    const handleRemovePhoto = (photoId) => {
        setPhotos(prevPhotos => {
            const updatedPhotos = prevPhotos.filter(photo => photo.id !== photoId);
            
            // Revoke the object URL to avoid memory leaks
            const photoToRemove = prevPhotos.find(photo => photo.id === photoId);
            if (photoToRemove && photoToRemove.preview) {
                URL.revokeObjectURL(photoToRemove.preview);
            }
            
            return updatedPhotos;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Check if the user is logged in
        if (!user) {
            const event = new CustomEvent('notification', {
                detail: {
                    type: 'error',
                    message: 'Необходимо войти в систему, чтобы оставить отзыв'
                }
            });
            document.dispatchEvent(event);
            return;
        }

        if (Object.keys(ratings).length < ratingCategories.length) {
            setShowValidation(true);
            return;
        }

        const averageRating = Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length;

        // Create a JSON object for the ratings to properly structure the data
        const ratingsData = {
            food: parseInt(Math.round(ratings.food || 0), 10),
            service: parseInt(Math.round(ratings.service || 0), 10),
            atmosphere: parseInt(Math.round(ratings.atmosphere || 0), 10),
            price: parseInt(Math.round(ratings.price || 0), 10),
            cleanliness: parseInt(Math.round(ratings.cleanliness || 0), 10)
        };
        
        // Create a structured review object that matches backend expectations
        const reviewData = {
            userId: user?.id || 0,
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            rating: parseInt(Math.round(averageRating), 10),
            comment: feedback,
            ratings: ratingsData
        };
        
        // Convert to JSON for debugging
        console.log('Structured review data:', JSON.stringify(reviewData));
        
        // Отправка на сервер
        setSubmitting(true);
        
        // Use direct axios call instead of api instance to avoid interceptor issues with FormData
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        // Check if we have photos to upload
        if (photos.length > 0) {
            // If we have photos, use FormData to send both JSON and files
            const formData = new FormData();
            
            // Add the JSON data as a string
            formData.append('reviewData', JSON.stringify(reviewData));
            
            // Add photos
            photos.forEach((photo, index) => {
                if (photo.file) {
                    formData.append('photos', photo.file);
                }
            });
            
            // Use FormData content type
            axios.post(`${API_URL}/api/reviews/with-photos`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            })
            .then(response => handleSuccessResponse(response))
            .catch(error => handleErrorResponse(error));
        } else {
            // If no photos, use simple JSON request
            axios.post(`${API_URL}/api/reviews`, reviewData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            })
            .then(response => handleSuccessResponse(response))
            .catch(error => handleErrorResponse(error));
        }
        
        // Success handler function
        const handleSuccessResponse = (response) => {
            setSubmitting(false);
            console.log('Успешный ответ от сервера:', response.data);
            
            // Add the review to the list
            if (response.data && response.data.review) {
                setRestaurantReviews(prevReviews => [response.data.review, ...prevReviews]);
            }
            
            // Call the callback with the review data
            if (onReviewSubmitted) {
                onReviewSubmitted(response.data.review || {
                    userId: user?.id || 0,
                    restaurantId: restaurant.id,
                    restaurantName: restaurant.name,
                    rating: parseInt(Math.round(averageRating), 10),
                    comment: feedback,
                    photos: photos.length
                });
            }

            // Сбросить форму
            setRatings({});
            setFeedback('');
            setShowValidation(false);
            setPhotos([]);
            setShowReviewForm(false);

            // Показать уведомление об успешной отправке через компонент уведомлений
            const event = new CustomEvent('notification', {
                detail: {
                    type: 'success',
                    message: 'Ваш отзыв успешно отправлен!'
                }
            });
            document.dispatchEvent(event);
        };
        
        // Error handler function
        const handleErrorResponse = (error) => {
            setSubmitting(false);
            console.error('Ошибка при отправке отзыва:', error);
            
            // Get detailed error message
            let errorMessage = 'Ошибка при отправке отзыва';
            
            if (error.response) {
                console.error('Ответ сервера с ошибкой:', error.response.data);
                errorMessage = error.response.data.message || 
                              error.response.data.error || 
                              `Ошибка сервера: ${error.response.status}`;
            } else if (error.request) {
                console.error('Нет ответа от сервера:', error.request);
                errorMessage = 'Сервер не отвечает. Проверьте подключение к интернету.';
            } else {
                console.error('Ошибка запроса:', error.message);
                errorMessage = `Ошибка запроса: ${error.message}`;
            }
            
            // Показать уведомление об ошибке с более подробной информацией
            const event = new CustomEvent('notification', {
                detail: {
                    type: 'error',
                    message: errorMessage
                }
            });
            document.dispatchEvent(event);
        };
    };

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{opacity: 0, scale: 0.9, y: 20}}
                animate={{opacity: 1, scale: 1, y: 0}}
                exit={{opacity: 0, scale: 0.9, y: 20}}
                transition={{duration: 0.3}}
                className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header with photo */}
                <div className="relative h-56 md:h-64">
                    <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                    />
                    <div
                        className="absolute top-0 left-0 w-full p-4 flex justify-between bg-gradient-to-b from-black/50 to-transparent">
                        <motion.button
                            whileHover={{scale: 1.1}}
                            whileTap={{scale: 0.9}}
                            onClick={onClose}
                            className="p-2 bg-white/90 rounded-full"
                            aria-label="Закрыть"
                        >
                            <X className="w-5 h-5 text-gray-700"/>
                        </motion.button>
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center bg-white/90 p-2 px-3 rounded-full">
                                <Star className="w-4 h-4 text-yellow-500 mr-1"/>
                                <span className="text-sm font-bold text-gray-800">{restaurant.avgRating}</span>
                                <span
                                    className="text-xs text-gray-500 ml-1">({restaurant.reviews.length} отзывов)</span>
                            </div>
                            <motion.button
                                whileHover={{scale: 1.1}}
                                whileTap={{scale: 0.9}}
                                className="p-2 bg-white/90 rounded-full"
                                aria-label="Добавить в избранное"
                            >
                                <Heart className="w-5 h-5 text-gray-700"/>
                            </motion.button>
                        </div>
                    </div>

                    {restaurant.isNew && (
                        <div
                            className="absolute top-4 left-16 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            Новое место
                        </div>
                    )}

                    {restaurant.discount && (
                        <div
                            className="absolute bottom-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            Скидка {restaurant.discount}%
                        </div>
                    )}
                </div>

                {/* Navigation tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        type="button"
                        className={`flex-1 py-3 text-center font-medium text-sm ${!showReviewForm ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-500'}`}
                        onClick={() => setShowReviewForm(false)}
                    >
                        Информация
                    </button>
                    <button
                        type="button"
                        className={`flex-1 py-3 text-center font-medium text-sm ${showReviewForm ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-500'}`}
                        onClick={() => setShowReviewForm(true)}
                    >
                        Оставить отзыв
                    </button>
                </div>

                {/* Restaurant info */}
                {!showReviewForm ? (
                    <div className="p-4">
                        <h2 className="text-2xl font-bold text-gray-800">{restaurant.name}</h2>

                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                {restaurant.cuisine}
                            </span>
                            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                {restaurant.priceRange}
                            </span>
                            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                {restaurant.deliveryTime} мин
                            </span>
                        </div>

                        <div className="mt-3 flex items-center">
                            <motion.div whileHover="hover" variants={iconVariants}>
                                <Clock className="w-4 h-4 text-green-500 mr-2"/>
                            </motion.div>
                            <span className="text-sm font-medium text-green-600">
                                {restaurant.isOpen ? 'Открыто' : 'Закрыто'} · {restaurant.hours}
                            </span>
                        </div>

                        <p className="mt-4 text-gray-700">{restaurant.description}</p>

                        {/* Features section - redesigned to be more minimalist */}
                        <motion.div 
                            className="mt-5 pt-5 border-t border-gray-100"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Особенности</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {restaurant.features?.map((feature, index) => (
                                    <motion.div 
                                        key={index} 
                                        className="flex items-center bg-gray-50 p-3 rounded-lg border border-gray-100"
                                        variants={featureBlockVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                    >
                                        <motion.div variants={iconVariants}>
                                            <Check className="w-4 h-4 text-gray-500 mr-2"/>
                                        </motion.div>
                                        <span className="text-sm text-gray-700">{feature}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Contact information - redesigned with cards */}
                        <motion.div 
                            className="mt-6"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Контакты</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <motion.a
                                    href={`https://maps.google.com/?q=${restaurant.address}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100"
                                    variants={featureBlockVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    <motion.div variants={iconVariants}>
                                        <MapPin className="w-5 h-5 text-gray-500"/>
                                    </motion.div>
                                    <span className="ml-3 text-gray-700 text-sm">{restaurant.address}</span>
                                </motion.a>

                                <motion.a
                                    href={`tel:${restaurant.phone.replace(/\D/g, '')}`}
                                    className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100"
                                    variants={featureBlockVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    <motion.div variants={iconVariants}>
                                        <Phone className="w-5 h-5 text-gray-500"/>
                                    </motion.div>
                                    <span className="ml-3 text-gray-700 text-sm">{restaurant.phone}</span>
                                </motion.a>

                                <motion.div
                                    className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100"
                                    variants={featureBlockVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    <motion.div variants={iconVariants}>
                                        <Clock className="w-5 h-5 text-gray-500"/>
                                    </motion.div>
                                    <span className="ml-3 text-gray-700 text-sm">{restaurant.hours}</span>
                                </motion.div>

                                {restaurant.website && (
                                    <motion.a
                                        href={restaurant.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100"
                                        variants={featureBlockVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                    >
                                        <motion.div variants={iconVariants}>
                                            <Globe className="w-5 h-5 text-gray-500"/>
                                        </motion.div>
                                        <span className="ml-3 text-gray-700 text-sm">{restaurant.website}</span>
                                    </motion.a>
                                )}
                            </div>
                        </motion.div>

                        {/* Menu button - Enhanced for PDF viewing */}
                        <motion.div 
                            className="mt-6"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                        >
                            <motion.button
                                onClick={async () => {
                                    try {
                                        await restaurantService.openRestaurantMenu(restaurant.id, () => {
                                            // Если меню не найдено, показываем сообщение
                                            alert('Меню этого ресторана еще не добавлено');
                                        });
                                    } catch (error) {
                                        console.error('Error opening menu:', error);
                                    }
                                }}
                                className="flex items-center justify-center bg-gray-700 text-white py-3 px-5 rounded-lg font-medium shadow-sm hover:bg-gray-800 transition-colors w-full"
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                            >
                                <motion.div 
                                    className="mr-2"
                                    variants={iconVariants}
                                >
                                    <FileText className="w-5 h-5"/>
                                </motion.div>
                                Посмотреть меню
                            </motion.button>
                        </motion.div>

                        {/* Review button */}
                        {user ? (
                            <motion.button
                                onClick={() => setShowReviewForm(true)}
                                className="flex items-center justify-center bg-gray-700 text-white py-3 px-5 rounded-lg font-medium shadow-sm hover:bg-gray-800 transition-colors w-full mt-3"
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                            >
                                <motion.div 
                                    className="mr-2"
                                    variants={iconVariants}
                                >
                                    <FileText className="w-5 h-5"/>
                                </motion.div>
                                Оставить отзыв
                            </motion.button>
                        ) : (
                            <motion.div
                                className="w-full bg-gray-100 p-4 rounded-lg mt-3 text-center"
                            >
                                <User className="w-8 h-8 mx-auto text-gray-400 mb-2"/>
                                <p className="text-sm text-gray-600 mb-2">Чтобы оставить отзыв, войдите или
                                    зарегистрируйтесь</p>
                                <button
                                    className="bg-gray-700 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition-colors">
                                    Войти
                                </button>
                            </motion.div>
                        )}
                    </div>
                ) : (
                    <div className="p-4">
                        <div className="flex items-center mb-4">
                            <motion.button
                                whileHover={{scale: 1.1}}
                                whileTap={{scale: 0.9}}
                                onClick={() => setShowReviewForm(false)}
                                className="p-2 mr-3 bg-gray-100 rounded-full"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-700"/>
                            </motion.button>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">Оставить отзыв</h2>
                                <p className="text-sm text-gray-500">{restaurant.name}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-3">
                                <h3 className="text-lg font-medium text-gray-700">
                                    Оцените ресторан
                                </h3>

                                {/* Rating explanation */}
                                <div className="text-xs text-gray-500 mb-4 flex justify-between">
                                    <span>1 - Очень плохо</span>
                                    <span>3 - Нормально</span>
                                    <span>5 - Отлично</span>
                                </div>

                                {ratingCategories.map((category, index) => (
                                    <motion.div
                                        key={category.id}
                                        initial={{opacity: 0, y: 10}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{duration: 0.3, delay: 0.1 + index * 0.05}}
                                        className="flex items-center bg-gray-100 p-2.5 rounded-lg border border-gray-200"
                                    >
                                        <motion.div whileHover={{rotate: 15}} transition={{duration: 0.2}}>
                                            {category.icon}
                                        </motion.div>
                                        <span className="ml-3 flex-grow text-sm text-gray-600">
                                        {category.name}
                                    </span>
                                        <div className="flex space-x-1">
                                            {[1, 2, 3, 4, 5].map(value => (
                                                <StarRating
                                                    key={value}
                                                    value={ratings[category.id] >= value}
                                                    onClick={() => setRatings(prev => ({
                                                        ...prev,
                                                        [category.id]: value
                                                    }))}
                                                />
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                                <AnimatePresence>
                                    {showValidation && Object.keys(ratings).length < ratingCategories.length && (
                                        <motion.p
                                            initial={{opacity: 0, height: 0}}
                                            animate={{opacity: 1, height: 'auto'}}
                                            exit={{opacity: 0, height: 0}}
                                            transition={{duration: 0.2}}
                                            className="text-sm text-red-500 mt-2"
                                        >
                                            Пожалуйста, оцените все категории
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Add photo section - Enhanced with preview and functionality */}
                            <motion.div
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                transition={{duration: 0.3, delay: 0.3}}
                                className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300"
                            >
                                <div className="flex items-center">
                                    <Camera className="w-5 h-5 text-gray-500 mr-3"/>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Добавьте фото блюд</p>
                                        <p className="text-xs text-gray-500">Необязательно, но поможет другим пользователям</p>
                                    </div>
                                    <motion.button
                                        whileHover={{scale: 1.05}}
                                        whileTap={{scale: 0.95}}
                                        className="ml-auto bg-gray-700 text-white text-xs px-3 py-1.5 rounded-md flex items-center"
                                        onClick={() => fileInputRef.current?.click()}
                                        type="button"
                                    >
                                        <ImagePlus className="w-3.5 h-3.5 mr-1.5" />
                                        Загрузить
                                    </motion.button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        multiple
                                        onChange={handlePhotoSelect}
                                        aria-label="Загрузить фотографии"
                                        data-testid="photo-upload"
                                    />
                                </div>
                                
                                {/* Photo previews */}
                                {photos.length > 0 && (
                                    <motion.div 
                                        className="grid grid-cols-5 gap-2 mt-3"
                                        initial={{opacity: 0, y: 10}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{duration: 0.3}}
                                    >
                                        {photos.map((photo) => (
                                            <motion.div 
                                                key={photo.id}
                                                className="relative group rounded-lg overflow-hidden aspect-square"
                                                initial={{opacity: 0, scale: 0.8}}
                                                animate={{opacity: 1, scale: 1}}
                                                exit={{opacity: 0, scale: 0.8}}
                                                whileHover={{scale: 1.03}}
                                                layout
                                            >
                                                <img 
                                                    src={photo.preview} 
                                                    alt="Preview" 
                                                    className="w-full h-full object-cover"
                                                />
                                                <motion.button
                                                    type="button"
                                                    className="absolute top-1 right-1 p-1 bg-gray-800 bg-opacity-70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleRemovePhoto(photo.id)}
                                                    whileHover={{scale: 1.1}}
                                                    whileTap={{scale: 0.9}}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </motion.button>
                                            </motion.div>
                                        ))}
                                        {/* Placeholder for remaining slots */}
                                        {Array.from({length: Math.min(5 - photos.length, 2)}).map((_, index) => (
                                            <motion.div 
                                                key={`placeholder-${index}`}
                                                className="border border-dashed border-gray-300 rounded-lg aspect-square flex items-center justify-center cursor-pointer"
                                                initial={{opacity: 0, scale: 0.8}}
                                                animate={{opacity: 1, scale: 1}}
                                                transition={{delay: 0.1 * index}}
                                                whileHover={{scale: 1.03}}
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <ImagePlus className="w-6 h-6 text-gray-400" />
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                                {photos.length > 0 && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        {photos.length}/5 фотографий добавлено
                                    </p>
                                )}
                            </motion.div>

                            <motion.div
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                transition={{duration: 0.3, delay: 0.4}}
                            >
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Ваш отзыв
                                </label>
                                <div className="relative w-full">
                                <textarea
                                    className="
                                        w-full p-3 border rounded-lg
                                        bg-gray-100 border-gray-200
                                        min-h-[120px] resize-none
                                        text-sm text-gray-700
                                        focus:ring-1 focus:ring-gray-300 focus:border-gray-300
                                        transition-all
                                        pr-10
                                    "
                                    placeholder="Что понравилось или не понравилось? Какие блюда особенно вкусные? Как обслуживание?"
                                    value={feedback}
                                    onChange={e => setFeedback(e.target.value.slice(0, 250))}
                                    maxLength={250}
                                    required    
                                />
                                    <motion.span
                                        animate={{
                                            color: feedback.length > 200 ? "#ef4444" : "#6b7280"
                                        }}
                                        className="absolute bottom-2 right-3 text-xs text-gray-500"
                                    >
                                        {feedback.length}/250
                                    </motion.span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Подробные отзывы помогают другим пользователям сделать правильный выбор
                                </p>
                            </motion.div>

                            <motion.button
                                whileHover={{scale: 1.03}}
                                whileTap={{scale: 0.97}}
                                type="submit"
                                disabled={submitting}
                                className={`
                                w-full bg-gray-700 text-white
                                px-5 py-2.5 rounded-lg
                                text-sm font-medium
                                hover:bg-gray-800
                                transition-colors
                                ${submitting ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                            >
                                {submitting ? (
                                    <span className="flex items-center justify-center">
                                    <motion.span
                                        animate={{rotate: 360}}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 1,
                                            ease: "linear"
                                        }}
                                        className="inline-block mr-2"
                                    >
                                        ⟳
                                    </motion.span>
                                    Отправляется...
                                </span>
                                ) : 'Отправить отзыв'}
                            </motion.button>
                        </form>
                    </div>
                )}

                {/* Reviews */}
                {!showReviewForm && (
                    <div className="mt-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Отзывы</h3>
                        
                        {loadingReviews ? (
                            <div className="py-4 text-center text-gray-500">
                                Загрузка отзывов...
                            </div>
                        ) : restaurantReviews.length > 0 ? (
                            <div className="space-y-4">
                                {restaurantReviews.map((review) => (
                                    <motion.div
                                        key={review.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 border border-gray-200 rounded-md"
                                    >
                                        <div className="flex justify-between mb-2">
                                            <div className="flex items-center">
                                                <div className="flex items-center justify-center bg-gray-200 rounded-full w-8 h-8 mr-2">
                                                    <User className="w-4 h-4 text-gray-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm">{review.user_name}</div>
                                                    <div className="text-xs text-gray-500">{new Date(review.created_at || review.date).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < Math.round(review.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                                    />
                                                ))}
                                                <span className="ml-2 text-sm text-gray-600">{review.rating}.0</span>
                                            </div>
                                        </div>

                                        <p className="text-gray-700 text-sm">{review.text || review.comment}</p>

                                        {/* Review photos */}
                                        {review.photos && review.photos.length > 0 && (
                                            <motion.div 
                                                className="mt-3 flex gap-2 overflow-x-auto pb-2 snap-x"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                {review.photos.map((photo, index) => (
                                                    <motion.div 
                                                        key={index}
                                                        className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden snap-start"
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => {
                                                            // Open full-sized image in new tab or modal
                                                            window.open(photo.url || photo, '_blank');
                                                        }}
                                                    >
                                                        <img 
                                                            src={photo.url || photo} 
                                                            alt={`Фото блюда ${index + 1}`}
                                                            className="w-full h-full object-cover cursor-pointer"
                                                        />
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        )}

                                        {/* Review feedback */}
                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="text-xs text-gray-500">
                                                Этот отзыв был полезен?
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded flex items-center transition-colors">
                                                    <ThumbsUp className="w-3 h-3 mr-1"/>
                                                    {review.likes || 0}
                                                </button>
                                                <button
                                                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded flex items-center transition-colors">
                                                    <ThumbsDown className="w-3 h-3 mr-1"/>
                                                    {review.dislikes || 0}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="p-6 bg-gray-50 text-center rounded-lg border border-gray-100 shadow-sm"
                            >
                                <motion.div 
                                    className="inline-block mb-3"
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={{ 
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 20
                                    }}
                                >
                                    <Star className="w-10 h-10 text-gray-300 mx-auto" />
                                </motion.div>
                                <h4 className="text-base font-medium text-gray-700 mb-2">Ещё нет отзывов</h4>
                                <p className="text-sm text-gray-500 mb-4">Делитесь своими впечатлениями и помогайте другим сделать выбор</p>
                            </motion.div>
                        )}
                    </div>
                )}
            </motion.div>
        </motion.div>
    )}

const ReviewForm = ({ user, onReviewSubmitted }) => {
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch restaurants from the API
    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                setLoading(true);
                const response = await api.get('/restaurants');
                
                // Filter only active restaurants
                const activeRestaurants = response.data.restaurants.filter(
                    restaurant => restaurant.is_active
                );
                
                // Transform API data to the format expected by the UI
                const formattedRestaurants = activeRestaurants.map(restaurant => ({
                    id: restaurant.id,
                    name: restaurant.name,
                    cuisine: restaurant.cuisine || 'Разная',
                    priceRange: restaurant.price_range || '₽₽',
                    image: restaurant.image_url || 'https://img.freepik.com/free-photo/restaurant-interior_1127-3392.jpg?w=740',
                    address: restaurant.address || 'Адрес не указан',
                    phone: restaurant.contact_phone || 'Телефон не указан',
                    hours: restaurant.hours || '10:00 - 22:00',
                    website: restaurant.website || '',
                    description: restaurant.description || 'Описание отсутствует',
                    avgRating: restaurant.rating || 0,
                    slug: restaurant.slug || '',
                    reviews: [] // We'll fetch reviews separately if needed
                }));
                
                setRestaurants(formattedRestaurants);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching restaurants:', error);
                setError('Не удалось загрузить список ресторанов');
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

    const handleRestaurantSelect = (restaurant) => {
        setSelectedRestaurant(restaurant);
        setShowDetail(true);
    };

    const handleCloseDetail = () => {
        setShowDetail(false);
    };

    const handleReviewSubmitted = (reviewData) => {
        if (onReviewSubmitted) {
            onReviewSubmitted(reviewData);
        }
        // Можно добавить обновление списка ресторанов с новым отзывом
    };

    if (!user && !showDetail) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md mx-auto p-4 bg-white shadow-md rounded-lg text-center border border-gray-200"
            >
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20
                    }}
                >
                    <User className="w-14 h-14 mx-auto text-gray-400 mb-4 animate-pulse"/>
                </motion.div>
                <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="text-xl font-medium text-gray-700 mb-2"
                >
                    Требуется авторизация
                </motion.h3>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                    className="text-gray-500 mb-5 text-sm"
                >
                    Чтобы оставить отзыв, войдите или зарегистрируйтесь
                </motion.p>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gray-700 text-white px-5 py-2 rounded-md text-sm hover:bg-gray-800 transition-colors"
                >
                    Войти
                </motion.button>
            </motion.div>
        );
    }

    // Show loading state while fetching restaurants
    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto p-4 text-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="rounded-full bg-gray-200 h-12 w-12 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2.5"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="grid grid-cols-4 gap-4 w-full">
                        {[...Array(8)].map((_, index) => (
                            <div key={index} className="bg-gray-200 h-40 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="w-full max-w-4xl mx-auto p-4 text-center">
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
                    <p>{error}</p>
                    <button 
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        onClick={() => window.location.reload()}
                    >
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    // Show empty state if no restaurants
    if (restaurants.length === 0) {
        return (
            <div className="w-full max-w-4xl mx-auto p-4 text-center">
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Нет доступных ресторанов</h3>
                    <p className="text-gray-500 mb-2">В данный момент список ресторанов пуст</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-4xl mx-auto"
            >
                <div className="p-4 bg-white shadow-md rounded-lg border border-gray-200 mb-6">
                    {/* Изменено: сделал сетку адаптивной */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {restaurants.map((restaurant, index) => (
                            <motion.div
                                key={restaurant.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <RestaurantButton
                                    restaurant={restaurant}
                                    isSelected={selectedRestaurant?.id === restaurant.id}
                                    onSelect={handleRestaurantSelect}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {showDetail && selectedRestaurant && (
                    <RestaurantDetailModal
                        restaurant={selectedRestaurant}
                        onClose={handleCloseDetail}
                        onReviewSubmitted={handleReviewSubmitted}
                        user={user}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

RestaurantDetailModal.propTypes = {
    restaurant: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onReviewSubmitted: PropTypes.func,
    user: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string
    })
};

ReviewForm.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string
    }),
    onReviewSubmitted: PropTypes.func
};

export { ReviewForm };