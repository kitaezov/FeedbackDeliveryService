import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { User, MapPin, DollarSign, Award, Smile, Star, Clock, Phone, Globe, ChevronLeft, X, Heart, ThumbsUp, Check, FileText, Camera, ThumbsDown, ImagePlus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import api from '../../utils/api';
import { API_BASE, API_URL } from '../../config';
import { restaurantService } from '../../features/restaurants/services/restaurantService';

const RestaurantButton = ({ restaurant, isSelected, onSelect }) => (
    <button
        type="button"
        onClick={() => onSelect(restaurant)}
        className={`
            w-full p-0 rounded-lg transition-all 
            border relative overflow-hidden shadow-sm
            ${isSelected
            ? 'border-gray-400 dark:border-gray-500 ring-2 ring-gray-400 dark:ring-gray-500'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
        `}
    >
        <div className="w-full pt-[60%] relative">
            <img
                src={restaurant.image}
                alt={`${restaurant.name} cuisine`}
                className="absolute top-0 left-0 w-full h-full object-cover"
            />
        </div>
        <div className="p-2 bg-white dark:bg-gray-800">
            <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300 truncate">
                {restaurant.name}
            </h3>
            <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {restaurant.cuisine} | {restaurant.priceRange}
                </p>
                <div className="flex items-center">
                    <Star className="w-3 h-3 text-yellow-500 mr-1" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{restaurant.avgRating}</span>
                </div>
            </div>
        </div>
    </button>
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
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
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
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
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
    const modalRef = useRef(null);

    // Close when clicking outside the modal content
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    // Close on escape key press
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        >
            <motion.div 
                ref={modalRef}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700"
            >
                {/* Заголовок с кнопкой закрытия */}
                <div className="flex justify-between items-start p-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-1">
                            {restaurant.name}
                        </h2>
                        <div className="flex items-center">
                            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                {restaurant.cuisine}
                            </span>
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                {restaurant.priceRange}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                    >
                        <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Изображение ресторана - расположено на всю ширину в верхней части */}
                <div className="relative w-full">
                    <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-56 object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>

                {/* Navigation tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        className={`flex-1 py-3 text-center font-medium text-sm ${
                            !showReviewForm 
                              ? 'text-gray-800 dark:text-white border-b-2 border-gray-800 dark:border-white' 
                              : 'text-gray-500 dark:text-gray-400'
                        } transition-colors focus:outline-none`}
                        onClick={() => setShowReviewForm(false)}
                    >
                        Информация
                    </button>
                    <button
                        type="button"
                        className={`flex-1 py-3 text-center font-medium text-sm ${
                            showReviewForm 
                              ? 'text-gray-800 dark:text-white border-b-2 border-gray-800 dark:border-white' 
                              : 'text-gray-500 dark:text-gray-400'
                        } transition-colors focus:outline-none`}
                        onClick={() => setShowReviewForm(true)}
                    >
                        Ваш отзыв
                    </button>
                </div>

                {/* Restaurant info */}
                {!showReviewForm ? (
                    <div className="p-5">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                                <Clock className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-green-600 dark:text-green-400">
                                    {restaurant.isOpen ? 'Открыто' : 'Закрыто'} · {restaurant.hours}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Время работы ресторана
                                </div>
                            </div>
                        </div>

                        {restaurant.description && (
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{restaurant.description}</p>
                            </div>
                        )}

                        {/* Compact contact information */}
                        <div className="grid grid-cols-1 gap-3 mb-6">
                            {restaurant.address && (
                                <div className="flex items-center">
                                    <div className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 mr-3">
                                        <MapPin className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{restaurant.address}</span>
                                </div>
                            )}
                            
                            {restaurant.phone && (
                                <div className="flex items-center">
                                    <div className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 mr-3">
                                        <Phone className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{restaurant.phone}</span>
                                </div>
                            )}
                            
                            {restaurant.website && restaurant.website.indexOf('freepik.com') === -1 && (
                                <div className="flex items-center">
                                    <div className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 mr-3">
                                        <Globe className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <a 
                                        href={restaurant.website} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        {restaurant.website}
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Features section - redesigned to be more minimalist */}
                        {restaurant.features && restaurant.features.length > 0 && (
                            <motion.div 
                                className="mb-6"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Особенности</h3>
                                <div className="flex flex-wrap gap-2">
                                    {restaurant.features.map((feature, index) => (
                                        <motion.div 
                                            key={index} 
                                            className="inline-flex items-center px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-full border border-gray-100 dark:border-gray-600"
                                            variants={featureBlockVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                        >
                                            <Check className="w-3 h-3 text-green-500 dark:text-green-400 mr-1.5"/>
                                            <span className="text-xs text-gray-700 dark:text-gray-300">{feature}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Action buttons */}
                        <div className="space-y-3">
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
                                className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white py-3 px-5 rounded-lg font-medium w-full transition-colors shadow-sm"
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                            >
                                <FileText className="w-4 h-4 mr-2"/>
                                Посмотреть меню
                            </motion.button>

                            {user ? (
                                <motion.button
                                    
                                >
                                    
                                </motion.button>
                            ) : (
                                <motion.div
                                    className="w-full bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center shadow-sm"
                                >
                                    <User className="w-6 h-6 mx-auto text-gray-400 dark:text-gray-500 mb-2"/>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Чтобы оставить отзыв, войдите или зарегистрируйтесь</p>
                                    <button
                                        className="bg-gray-800 dark:bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors">
                                        Войти
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-5">
                        <div className="flex items-center mb-5">
                            <button
                                onClick={() => setShowReviewForm(false)}
                                className="mr-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 focus:outline-none"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div>
                                <p className="text-lg font-medium text-gray-800 dark:text-gray-100">{restaurant.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Поделитесь своим опытом</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Оцените ресторан
                                    </h3>

                                    {/* Rating explanation */}
                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex space-x-3">
                                        <span>1 - Плохо</span>
                                        <span>3 - Нормально</span>
                                        <span>5 - Отлично</span>
                                    </div>
                                </div>

                                {ratingCategories.map((category, index) => (
                                    <div
                                        key={category.id}
                                        className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600"
                                    >
                                        <div className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-600 mr-3">
                                            {category.icon}
                                        </div>
                                        <span className="flex-grow text-sm text-gray-700 dark:text-gray-300">
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
                                    </div>
                                ))}
                                {showValidation && Object.keys(ratings).length < ratingCategories.length && (
                                    <p className="text-xs text-red-500 dark:text-red-400">
                                        Пожалуйста, оцените все категории
                                    </p>
                                )}
                            </div>

                            {/* Add photo section */}
                            <div
                                className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-dashed border-gray-200 dark:border-gray-600"
                            >
                                <div className="flex items-center">
                                    <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-600 mr-3">
                                        <Camera className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Добавьте фото блюд</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Необязательно, но поможет другим пользователям</p>
                                    </div>
                                    <button
                                        className="ml-auto bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-white text-xs px-3 py-1.5 rounded-md flex items-center transition-colors"
                                        onClick={() => fileInputRef.current?.click()}
                                        type="button"
                                    >
                                        <ImagePlus className="w-3 h-3 mr-1.5" />
                                        Загрузить
                                    </button>
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
                                    <div 
                                        className="grid grid-cols-5 gap-2 mt-3"
                                    >
                                        {photos.map((photo) => (
                                            <div 
                                                key={photo.id}
                                                className="relative group rounded-lg overflow-hidden aspect-square"
                                            >
                                                <img 
                                                    src={photo.preview} 
                                                    alt="Preview" 
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <button
                                                    type="button"
                                                    className="absolute top-1 right-1 p-1.5 bg-black bg-opacity-60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                                                    onClick={() => handleRemovePhoto(photo.id)}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                        {/* Placeholder for remaining slots */}
                                        {Array.from({length: Math.min(5 - photos.length, 2)}).map((_, index) => (
                                            <div 
                                                key={`placeholder-${index}`}
                                                className="border border-dashed border-gray-300 dark:border-gray-500 rounded-lg aspect-square flex items-center justify-center cursor-pointer bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <ImagePlus className="w-5 h-5 text-gray-400 dark:text-gray-400" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {photos.length > 0 && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        {photos.length}/5 фотографий добавлено
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Ваш отзыв
                                </label>
                                <div className="relative w-full">
                                <textarea
                                    className="
                                        w-full p-3 border rounded-lg
                                        bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600
                                        min-h-[120px] resize-none
                                        text-sm text-gray-700 dark:text-gray-200
                                        focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-500 
                                        focus:border-gray-300 dark:focus:border-gray-500
                                        transition-all
                                        pr-10
                                    "
                                    placeholder="Что понравилось или не понравилось? Какие блюда особенно вкусные? Как обслуживание?"
                                    value={feedback}
                                    onChange={e => setFeedback(e.target.value.slice(0, 250))}
                                    maxLength={250}
                                    required    
                                />
                                    <span
                                        className={`absolute bottom-2 right-3 text-xs ${
                                            feedback.length > 200 
                                                ? "text-red-500 dark:text-red-400" 
                                                : "text-gray-500 dark:text-gray-400"
                                        }`}
                                    >
                                        {feedback.length}/250
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Подробные отзывы помогают другим пользователям сделать правильный выбор
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className={`
                                w-full py-3 px-4 rounded-lg text-white font-medium
                                ${submitting 
                                    ? 'bg-blue-400 dark:bg-blue-500 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'}
                                transition-colors shadow-sm
                                `}
                            >
                                {submitting ? 'Отправка...' : 'Отправить отзыв'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Reviews */}
                {!showReviewForm && (
                    <div className="px-5 pb-5 mb-5 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mt-5 mb-4">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Отзывы</h3>
                            {restaurantReviews.length > 0 && (
                                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                                    {restaurantReviews.length}
                                </span>
                            )}
                        </div>
                        
                        {loadingReviews ? (
                            <div className="py-8 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300"></div>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Загрузка отзывов...</p>
                            </div>
                        ) : restaurantReviews.length > 0 ? (
                            <div className="space-y-4">
                                {restaurantReviews.map((review) => (
                                    <div
                                        key={review.id}
                                        className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
                                    >
                                        <div className="flex justify-between mb-3">
                                            <div className="flex items-center">
                                                <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full w-8 h-8 mr-2">
                                                    <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm text-gray-800 dark:text-gray-200">{review.user_name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(review.created_at || review.date).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-3.5 h-3.5 ${i < Math.round(review.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                                                    />
                                                ))}
                                                <span className="ml-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">{review.rating}.0</span>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{review.text || review.comment}</p>

                                        {/* Review photos */}
                                        {review.photos && review.photos.length > 0 && (
                                            <div className="mt-3 flex gap-2 overflow-x-auto pb-2 snap-x">
                                                {review.photos.map((photo, index) => (
                                                    <div 
                                                        key={index}
                                                        className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden snap-start cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => {
                                                            // Open full-sized image in new tab
                                                            window.open(photo.url || photo, '_blank');
                                                        }}
                                                    >
                                                        <img 
                                                            src={photo.url || photo} 
                                                            alt={`Фото блюда ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Review feedback */}
                                        <div className="mt-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                Был ли отзыв полезен?
                                            </div>
                                            <div className="flex space-x-2">
                                                <button className="inline-flex items-center text-xs px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors">
                                                    <ThumbsUp className="w-3 h-3 mr-1"/>
                                                    <span>{review.likes || 0}</span>
                                                </button>
                                                <button className="inline-flex items-center text-xs px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors">
                                                    <ThumbsDown className="w-3 h-3 mr-1"/>
                                                    <span>{review.dislikes || 0}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="p-6 bg-gray-50 dark:bg-gray-700 text-center rounded-lg border border-gray-100 dark:border-gray-600 shadow-sm"
                            >
                                <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-600 inline-flex mx-auto mb-3">
                                    <Star className="w-5 h-5 text-gray-400 dark:text-gray-300" />
                                </div>
                                <h4 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Ещё нет отзывов</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Будьте первым, кто поделится своими впечатлениями</p>
                            
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
            <div
                className="flex flex-col items-center justify-center py-10 px-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md"
            >
                <Award className="w-10 h-10 mb-4 text-gray-400 dark:text-gray-500" />
                <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-200">Нет доступных ресторанов</h3>
                <p className="text-sm text-center max-w-md text-gray-500 dark:text-gray-400">
                    В данный момент список ресторанов пуст
                </p>
            </div>
        );
    }

    return (
        <div
            className="w-full overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg shadow-md bg-white dark:bg-gray-800"
        >
            <div className="p-4">
                {!user ? (
                    <div className="text-center py-10">
                        <User className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 mb-4">Войдите в систему, чтобы оставить отзыв</p>
                        <button
                            className="py-2 px-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg"
                        >
                            Войти
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Restaurant Selection Grid */}
                        {restaurants.length > 0 ? (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">Выберите ресторан</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {restaurants.map((restaurant) => (
                                            <RestaurantButton
                                                key={restaurant.id || restaurant.name}
                                                restaurant={restaurant}
                                                isSelected={selectedRestaurant && selectedRestaurant.name === restaurant.name}
                                                onSelect={handleRestaurantSelect}
                                            />
                                        ))}
                                    </div>
                                </div>
                                
                                {!selectedRestaurant && (
                                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                        Выберите ресторан для написания отзыва
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400">Загрузка ресторанов...</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            <AnimatePresence>
                {selectedRestaurant && (
                    <RestaurantDetailModal
                        restaurant={selectedRestaurant}
                        onClose={handleCloseDetail}
                        onReviewSubmitted={handleReviewSubmitted}
                        user={user}
                    />
                )}
            </AnimatePresence>
        </div>
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