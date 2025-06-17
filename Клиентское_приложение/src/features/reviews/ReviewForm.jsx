import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { User, MapPin, DollarSign, Award, Smile, Star, Clock, Phone, Globe, ChevronLeft, X, Heart, ThumbsUp, Check, FileText, Camera, ThumbsDown, ImagePlus, Trash2, Utensils, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import api from '../../utils/api';
import { API_BASE, API_URL } from '../../config';
import { restaurantService } from '../../features/restaurants/services/restaurantService';
import { restaurantPlaceholder, largeRestaurantPlaceholder } from '../../utils/placeholders';
import { useNotification } from '../../components/NotificationContext';

const RestaurantButton = ({ restaurant, isSelected, onSelect }) => (
    <button
        type="button"
        onClick={() => onSelect(restaurant)}
        className={`
            flex flex-col overflow-hidden rounded-lg border transition-all duration-200
            ${isSelected 
                ? 'border-blue-500 ring-2 ring-blue-300 shadow-lg scale-[1.02]' 
                : 'border-gray-200 dark:border-gray-800 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700'
            }
        `}
    >
        <div className="w-full pt-[60%] relative">
            <img
                src={restaurant.image || restaurant.image_url || restaurant.imageUrl || restaurantPlaceholder()}
                alt={`${restaurant.name} cuisine`}
                className="absolute top-0 left-0 w-full h-full object-cover"
            />
        </div>
        <div className="p-2 bg-white dark:bg-gray-800">
            <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300 truncate">
                {restaurant.name}
            </h3>
            <div className="flex items-center justify-between mt-1">
                <div className="flex items-center">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {restaurant.category || restaurant.cuisine}
                    </span>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        {restaurant.price_range || restaurant.priceRange}
                    </span>
                </div>
                <div className="flex items-center">
                    <Star className="w-3 h-3 text-yellow-500 mr-1" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {restaurant.avgRating ? restaurant.avgRating.toFixed(1) : '0.0'}
                    </span>
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

// Анимации для блоков функциональных блоков (похожие на анимации NavigationBar) 
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

// Анимации для иконок
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

// Анимации для кнопок
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

// Анимации для кнопки меню - с менее интенсивной анимацией
const menuButtonVariants = {
    initial: { opacity: 0, y: 5 },
    animate: { opacity: 1, y: 0 },
    hover: {
        scale: 1.02, // Уменьшенный эффект масштабирования
        transition: { 
            duration: 0.15,
            type: "spring", 
            stiffness: 300 
        }
    },
    tap: {
        scale: 0.98,
        transition: { 
            duration: 0.1 
        }
    }
};

// Измененный компонент RestaurantDetailModal для включения формы отзыва непосредственно
const RestaurantDetailModal = ({ restaurant, onClose, onReviewSubmitted, user }) => {
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [ratings, setRatings] = useState({});
    const [feedback, setFeedback] = useState('');
    const [showValidation, setShowValidation] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [restaurantReviews, setRestaurantReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [photos, setPhotos] = useState([]);
    const [receiptPhoto, setReceiptPhoto] = useState(null);
    const [reviewType, setReviewType] = useState('inRestaurant'); // 'inRestaurant' or 'delivery'
    const fileInputRef = useRef(null);
    const receiptInputRef = useRef(null);
    const modalRef = useRef(null);
    const lastLoadedRestaurantId = useRef(null);

    // Функция для проверки, открыт ли ресторан
    const checkIfOpen = (workingHours) => {
        if (!workingHours) return false;

        // Получаем текущее время в МСК
        const now = new Date();
        const mskTime = new Date(now.getTime() + (now.getTimezoneOffset() + 180) * 60000); // +180 минут для МСК
        const currentHour = mskTime.getHours();
        const currentMinutes = mskTime.getMinutes();
        const currentTime = currentHour * 60 + currentMinutes; // Текущее время в минутах

        // Парсим часы работы
        const timeRangeMatch = workingHours.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
        if (!timeRangeMatch) return false;

        const [_, openHour, openMinute, closeHour, closeMinute] = timeRangeMatch;
        const openTime = parseInt(openHour) * 60 + parseInt(openMinute);
        const closeTime = parseInt(closeHour) * 60 + parseInt(closeMinute);

        return currentTime >= openTime && currentTime <= closeTime;
    };

    // Получаем статус открытия
    const isOpen = checkIfOpen(restaurant.hours || restaurant.workingHours);

    // Функция для блокировки скролла на заднем фоне
    useEffect(() => {
        // Сохраняем текущую позицию прокрутки
        const scrollY = window.scrollY;
        
        // Блокируем прокрутку на body
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        
        // Восстанавливаем прокрутку при размонтировании
        return () => {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, scrollY);
        };
    }, []);

    // Функция для закрытия формы
    const handleClose = () => {
        // Сбрасываем все состояния
        setShowReviewForm(false);
        setRatings({});
        setFeedback('');
        setPhotos([]);
        setReceiptPhoto(null);
        // Закрываем модальное окно
        if (onClose) {
            onClose();
        }
    };

    // Обработчик клика по оверлею
    const handleOverlayClick = (e) => {
        // Если клик был по оверлею (не по контенту модального окна)
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    // Обработчик нажатия клавиши Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    // Поиск отзывов для ресторана при его выборе
    useEffect(() => {
        if (restaurant?.id && lastLoadedRestaurantId.current !== restaurant.id) {
            fetchRestaurantReviews();
            lastLoadedRestaurantId.current = restaurant.id;
        }
    }, [restaurant]);

    // Получение отзывов для выбранного ресторана
    const fetchRestaurantReviews = async () => {
        if (!restaurant) return;
        
        setLoadingReviews(true);
        try {
            const response = await api.get(`/reviews?restaurantName=${encodeURIComponent(restaurant.name)}`);
            console.log('Получены отзывы для ресторана:', response.data);
            
            if (response.data && response.data.reviews) {
                // Преобразуем данные отзывов для единообразия
                const formattedReviews = response.data.reviews.map(review => ({
                    id: review.id,
                    user_id: review.user_id,
                    user_name: review.author?.name || review.user_name || review.userName || review.name || 'Аноним',
                    rating: review.rating,
                    text: review.comment || review.text,
                    created_at: review.created_at || review.date,
                    photos: review.photos || [],
                    hasReceipt: review.hasReceipt || false,
                    likes: review.likes || 0,
                    dislikes: review.dislikes || 0,
                    response: review.response || '',
                    manager_name: review.manager_name || review.managerName || '',
                    responded: Boolean(review.response) || Boolean(review.responded),
                    showResponse: true
                }));
                
                console.log('Форматированные отзывы:', formattedReviews);
                setRestaurantReviews(formattedReviews);
            } else {
                setRestaurantReviews([]);
            }
        } catch (error) {
            console.error('Ошибка при получении отзывов:', error);
            setRestaurantReviews([]);
        } finally {
            setLoadingReviews(false);
        }
    };

    if (!restaurant) return null;

    const inRestaurantCategories = [
        {id: 'food', name: 'Качество блюд', icon: <Star className="w-5 h-5 text-gray-400"/>},
        {id: 'service', name: 'Уровень сервиса', icon: <Smile className="w-5 h-5 text-gray-400"/>},
        {id: 'atmosphere', name: 'Атмосфера', icon: <MapPin className="w-5 h-5 text-gray-400"/>},
        {id: 'price', name: 'Цена/Качество', icon: <DollarSign className="w-5 h-5 text-gray-400"/>},
        {id: 'cleanliness', name: 'Чистота', icon: <Award className="w-5 h-5 text-gray-400"/>}
    ];

    const deliveryCategories = [
        {id: 'food', name: 'Качество блюд', icon: <Star className="w-5 h-5 text-gray-400"/>},
        {id: 'price', name: 'Цена/Качество', icon: <DollarSign className="w-5 h-5 text-gray-400"/>},
        {id: 'deliverySpeed', name: 'Скорость доставки', icon: <Clock className="w-5 h-5 text-gray-400"/>},
        {id: 'deliveryQuality', name: 'Качество доставки', icon: <Award className="w-5 h-5 text-gray-400"/>}
    ];

    const ratingCategories = reviewType === 'inRestaurant' ? inRestaurantCategories : deliveryCategories;

    const handlePhotoSelect = (e) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const selectedFiles = Array.from(e.target.files);
        const maxPhotos = 5;
        const maxSizeInMB = 5; // Максимальный размер файла в MB
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024; // Преобразовать в байты
        
        // Проверка и фильтрация файлов
        const validFiles = selectedFiles.filter(file => {
            // Проверка типа файла
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
            
            // Проверка размера файла
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
        
        // Проверка, превысит ли добавление этих файлов максимальное количество
        if (photos.length + validFiles.length > maxPhotos) {
            const event = new CustomEvent('notification', {
                detail: {
                    type: 'warning',
                    message: `Вы можете загрузить максимум ${maxPhotos} фотографий`
                }
            });
            document.dispatchEvent(event);
            
            // Добавьте фотографии до максимума
            const remainingSlots = maxPhotos - photos.length;
            if (remainingSlots <= 0) return;
            
            validFiles.splice(remainingSlots);
        }
        
        // Генерировать превью для выбранных файлов
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
        
        // Сбросить входной файл, чтобы разрешить выбор одних и тех же файлов снова
        e.target.value = '';
    };
    
    const handleRemovePhoto = (photoId) => {
        setPhotos(prevPhotos => {
            const updatedPhotos = prevPhotos.filter(photo => photo.id !== photoId);
            
            // Отменить URL-объект, чтобы избежать утечек памяти
            const photoToRemove = prevPhotos.find(photo => photo.id === photoId);
            if (photoToRemove && photoToRemove.preview) {
                URL.revokeObjectURL(photoToRemove.preview);
            }
            
            return updatedPhotos;
        });
    };

    // Обработчик выбора фото чека
    const handleReceiptSelect = (e) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const file = e.target.files[0];
        const maxSizeInMB = 5; // Максимальный размер файла в MB
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024; // Преобразовать в байты
        
        // Проверка файла
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            const event = new CustomEvent('notification', {
                detail: {
                    type: 'error',
                    message: `Неподдерживаемый тип файла. Разрешены только JPEG, PNG, GIF, и WebP.`
                }
            });
            document.dispatchEvent(event);
            return;
        }
        
        // Проверка размера файла
        if (file.size > maxSizeInBytes) {
            const event = new CustomEvent('notification', {
                detail: {
                    type: 'error',
                    message: `Файл слишком большой. Максимальный размер: ${maxSizeInMB}МБ.`
                }
            });
            document.dispatchEvent(event);
            return;
        }
        
        // Генерировать превью
        const newReceipt = {
            file,
            id: Math.random().toString(36).substring(2),
            preview: URL.createObjectURL(file),
            isReceipt: true
        };
        
        console.log('Добавление фото чека:', {
            name: file.name, 
            type: file.type,
            size: `${(file.size / 1024).toFixed(1)} KB`
        });
        
        setReceiptPhoto(newReceipt);
        
        // Сбросить входной файл, чтобы разрешить выбор одних и тех же файлов снова
        e.target.value = '';
    };
    
    const handleRemoveReceiptPhoto = () => {
        if (receiptPhoto && receiptPhoto.preview) {
            URL.revokeObjectURL(receiptPhoto.preview);
        }
        setReceiptPhoto(null);
    };

    // Обработчик успешного ответа
    const handleSuccessResponse = (response) => {
        setSubmitting(false);
        console.log('Успешный ответ от сервера:', response.data);
        
        // Добавить отзыв в список, если его там еще нет
        if (response.data && response.data.review) {
            setRestaurantReviews(prevReviews => {
                if (prevReviews.some(r => r.id === response.data.review.id)) return prevReviews;
                return [response.data.review, ...prevReviews];
            });
        }
        
        // Вызовите обратный вызов с данными отзыва
        if (onReviewSubmitted) {
            onReviewSubmitted(response.data.review || {
                userId: user?.id || 0,
                restaurantId: restaurant.id,
                restaurantName: restaurant.name,
                rating: response.data.review?.rating || 5,
                comment: feedback,
                photos: photos.length,
                hasReceipt: !!receiptPhoto,
                type: reviewType, // Добавляем тип отзыва в возвращаемые данные
                reviewType: reviewType, // Дублируем для совместимости
                isDelivery: reviewType === 'delivery', // Добавляем явный флаг для доставки
                delivery: reviewType === 'delivery' // Дублируем для совместимости
            });
        }

        // Сбросить форму
        setRatings({});
        setFeedback('');
        setShowValidation(false);
        setPhotos([]);
        setReceiptPhoto(null);
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
    
    // Обработчик ошибки
    const handleErrorResponse = (error) => {
        setSubmitting(false);
        console.error('Ошибка при отправке отзыва:', error);
        
        // Получить подробное сообщение об ошибке
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

    // Обработчик выбора типа отзыва
    const handleReviewTypeChange = (type) => {
        console.log(`Выбран тип отзыва: ${type}`);
        setReviewType(type);
        // Сбросить оценки при изменении типа
        setRatings({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Проверка, авторизован ли пользователь
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

        // Проверка минимальной длины отзыва
        if (feedback.length < 10) {
            setShowValidation(true);
            return;
        }

        if (Object.keys(ratings).length < ratingCategories.length) {
            setShowValidation(true);
            return;
        }

        try {
            // Получаем актуальные данные о ресторане
            const restaurantResponse = await api.get(`/restaurants/by-name/${encodeURIComponent(restaurant.name)}`);
            const restaurantData = restaurantResponse.data.restaurant;

            if (!restaurantData) {
                throw new Error('Не удалось получить данные о ресторане');
            }

            const averageRating = Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length;

            // Создать JSON-объект для оценок, чтобы правильно структурировать данные
            const ratingsData = {};
            
            // Добавляем рейтинги в зависимости от типа отзыва
            if (reviewType === 'inRestaurant') {
                // Рейтинги для отзыва о посещении ресторана
                ratingsData.food = parseInt(Math.round(ratings.food || 0), 10);
                ratingsData.service = parseInt(Math.round(ratings.service || 0), 10);
                ratingsData.atmosphere = parseInt(Math.round(ratings.atmosphere || 0), 10);
                ratingsData.price = parseInt(Math.round(ratings.price || 0), 10);
                ratingsData.cleanliness = parseInt(Math.round(ratings.cleanliness || 0), 10);
            } else {
                // Рейтинги для отзыва о доставке
                ratingsData.food = parseInt(Math.round(ratings.food || 0), 10);
                ratingsData.price = parseInt(Math.round(ratings.price || 0), 10);
                ratingsData.deliverySpeed = parseInt(Math.round(ratings.deliverySpeed || 0), 10);
                ratingsData.deliveryQuality = parseInt(Math.round(ratings.deliveryQuality || 0), 10);
            }
            
            // Создать структурированный объект отзыва, который соответствует ожиданиям бэкенда
            const reviewData = {
                userId: user?.id || 0,
                restaurantId: restaurantData.id,
                restaurantName: restaurantData.name,
                restaurantCategory: restaurantData.category,
                rating: parseInt(Math.round(averageRating), 10),
                comment: feedback,
                ratings: ratingsData,
                reviewType: reviewType, // Убедимся, что тип отзыва передается корректно
                type: reviewType, // Добавляем дублирующее поле для совместимости с разными API
                hasReceipt: !!receiptPhoto,
                isDelivery: reviewType === 'delivery', // Добавляем явный флаг для доставки
                delivery: reviewType === 'delivery' // Дублируем для совместимости
            };
            
            // Преобразовать в JSON для отладки
            console.log('Структурированные данные отзыва:', JSON.stringify(reviewData));
            console.log('Тип отзыва:', reviewType); // Добавляем явный лог типа отзыва
            
            // Отправка на сервер
            setSubmitting(true);
            
            // Используйте прямой вызов axios вместо api экземпляра, чтобы избежать проблем с перехватчиками при использовании FormData
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            
            // Проверьте, имеем ли мы фото или чек для отправки
            if (photos.length > 0 || receiptPhoto) {
                // Если у нас есть фото или чек, используйте FormData для отправки как JSON, так и файлов
                const formData = new FormData();
                
                // Добавьте данные JSON как строку
                formData.append('reviewData', JSON.stringify(reviewData));
                
                // Добавляем тип отзыва как отдельное поле для надежности
formData.append('reviewType', reviewType);
// Используем другое имя поля для избежания дублирования
formData.append('reviewTypeAlt', reviewType);
formData.append('isDelivery', reviewType === 'delivery' ? 'true' : 'false');
                
                try {
                    // Добавьте обычные фото - убедитесь, что имя поля точно 'photos'
                    if (photos.length > 0) {
                        photos.forEach((photo) => {
                            if (photo.file) {
                                formData.append('photos', photo.file);
                            }
                        });
                    }
                    
                    // Добавьте фото чека - убедитесь, что имя поля точно 'receiptPhoto'
                    if (receiptPhoto && receiptPhoto.file) {
                        formData.append('receiptPhoto', receiptPhoto.file);
                    }
                    
                    console.log('FormData prepared with:', { 
                        hasPhotos: photos.length > 0, 
                        hasReceipt: !!receiptPhoto,
                        fieldNames: [...formData.keys()], // Логирование всех имен полей
                        reviewType: reviewType // Добавляем тип отзыва в логи
                    });
                    
                    // Используйте тип содержимого FormData - пусть браузер установит его автоматически
                    const response = await axios.post(`${API_URL}/api/reviews/with-photos`, formData, {
                        headers: {
                            // Не устанавливайте Content-Type - браузер установит его с границей
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                        }
                    });
                    
                    handleSuccessResponse(response);
                } catch (error) {
                    handleErrorResponse(error);
                }
            } else {
                // Если нет фото, используйте простой JSON-запрос
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
        } catch (error) {
            handleErrorResponse(error);
        }
    };

    // Компонент для отображения отзывов в модальном окне
    const RestaurantReviewsList = ({ restaurant, maxReviews = 3 }) => {
        const [reviews, setReviews] = useState([]);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState(null);

        useEffect(() => {
            const fetchReviews = async () => {
                if (!restaurant?.id) return;
                
                try {
                    setLoading(true);
                    const response = await restaurantService.getRestaurantReviews(restaurant.id);
                    
                    if (response && Array.isArray(response.reviews)) {
                        setReviews(response.reviews);
                    } else {
                        setReviews([]);
                    }
                    setError(null);
                } catch (err) {
                    console.error('Error fetching reviews:', err);
                    setError('Не удалось загрузить отзывы');
                } finally {
                    setLoading(false);
                }
            };
            
            fetchReviews();
        }, [restaurant?.id]);

        if (loading) {
            return (
                <div className="py-4 text-center">
                    <div className="animate-spin h-6 w-6 border-2 border-gray-500 rounded-full border-t-transparent mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Загрузка отзывов...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="py-4 text-center">
                    <p className="text-sm text-red-500">{error}</p>
                </div>
            );
        }

        if (reviews.length === 0) {
            return (
                <div className="py-4 text-center bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Star className="w-8 h-8 text-gray-300 dark:text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">У этого ресторана пока нет отзывов</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Будьте первым, кто оставит отзыв!</p>
                </div>
            );
        }

        // Показываем только первые maxReviews отзывов
        const displayedReviews = reviews.slice(0, maxReviews);

        return (
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Последние отзывы</h3>
                
                {displayedReviews.map((review) => (
                    <div 
                        key={review.id} 
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-2">
                                    {review.author?.avatar ? (
                                        <img 
                                            src={review.author.avatar} 
                                            alt={review.author.name || review.user_name || "User"} 
                                            className="w-8 h-8 rounded-full"
                                        />
                                    ) : (
                                        <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {review.author?.name || review.user_name || review.userName || "Пользователь"}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(review.date || review.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        fill={i < review.rating ? "#FFB800" : "none"}
                                        stroke={i < review.rating ? "#FFB800" : "#94a3b8"}
                                        className="mr-0.5"
                                    />
                                ))}
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {review.comment || review.text || "Пользователь не оставил комментарий"}
                        </p>
                    </div>
                ))}
                
                {reviews.length > maxReviews && (
                    <div className="text-center mt-2">
                        <button 
                            onClick={() => {
                                handleClose();
                                window.location.href = `/restaurants/${restaurant.id}?tab=reviews`;
                            }}
                            className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                        >
                            Показать все отзывы ({reviews.length})
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={handleOverlayClick}
        >
            <div 
                ref={modalRef}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative custom-scrollbar"
                onClick={e => e.stopPropagation()}
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
                }}
            >
                {/* Кнопка закрытия в правом верхнем углу */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 focus:outline-none z-50"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Заголовок с кнопкой закрытия */}
                <div className="flex justify-between items-start p-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-1">
                            {restaurant.name}
                        </h2>
                        <div className="flex items-center">
                            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                {restaurant.category || restaurant.cuisine}
                            </span>
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                {restaurant.price_range || restaurant.priceRange}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Изображение ресторана - расположено на всю ширину в верхней части */}
                <div className="relative w-full">
                    <img
                        src={restaurant.image || restaurant.image_url || restaurant.imageUrl || largeRestaurantPlaceholder()}
                        alt={restaurant.name}
                        className="w-full h-64 object-cover rounded-t-lg"
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
                                <div className={`text-sm font-medium ${isOpen ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {isOpen ? 'Открыто' : 'Закрыто'} · {restaurant.hours || restaurant.workingHours || 'Время работы не указано'}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Время работы ресторана (МСК)
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
                            
                            {(restaurant.min_price || restaurant.minPrice) && (
                                <div className="flex items-center">
                                    <div className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 mr-3">
                                        <DollarSign className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        Мин. заказ: {restaurant.min_price || restaurant.minPrice}₽
                                    </span>
                                </div>
                            )}
                            
                            {(restaurant.delivery_time || restaurant.deliveryTime) && (
                                <div className="flex items-center">
                                    <div className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 mr-3">
                                        <Clock className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        Время доставки: {restaurant.delivery_time || restaurant.deliveryTime} мин
                                    </span>
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
                                variants={menuButtonVariants}
                                whileHover="hover"
                                whileTap="tap"
                            >
                                <FileText className="w-4 h-4 mr-2"/>
                                Посмотреть меню
                            </motion.button>

                            {/* Секция с отзывами */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm"
                            >
                                <RestaurantReviewsList restaurant={restaurant} />
                            </motion.div>

                            {user ? (
                                <motion.button
                                    
                                >
                                    
                                </motion.button>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="p-6 bg-gray-50 dark:bg-gray-700 text-center rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300"
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
                                        <User className="w-10 h-10 mb-3 opacity-30" />
                                    </motion.div>
                                    <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Требуется авторизация</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                        Чтобы выбрать ресторан и оставить отзыв, необходимо войти или зарегистрироваться
                                    </p>
                                    <div className="flex justify-center gap-3">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="bg-gray-700 text-white px-5 py-2 rounded-md text-sm hover:bg-gray-800 transition-colors shadow-sm"
                                        >
                                            Войти
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="bg-white text-gray-700 px-5 py-2 rounded-md text-sm hover:bg-gray-50 transition-colors shadow-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                                        >
                                            Регистрация
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center">
                                <button
                                    onClick={handleClose}
                                    className="mr-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 focus:outline-none"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <div>
                                    <p className="text-lg font-medium text-gray-800 dark:text-gray-100">{restaurant.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Поделитесь своим опытом</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Review type selection */}
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Тип отзыва:
                                </label>
                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => handleReviewTypeChange('inRestaurant')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            reviewType === 'inRestaurant'
                                                ? 'bg-gray-800 text-white dark:bg-gray-700'
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                                        }`}
                                    >
                                        В ресторане
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleReviewTypeChange('delivery')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            reviewType === 'delivery'
                                                ? 'bg-gray-800 text-white dark:bg-gray-700'
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                                        }`}
                                    >
                                        Доставка
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Оцените {reviewType === 'inRestaurant' ? 'ресторан' : 'доставку'}
                                    </h3>
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

                            {/* Add receipt photo section */}
                            <div
                                className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-dashed border-gray-200 dark:border-gray-600 mb-4"
                            >
                                <div className="flex items-center">
                                    <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-600 mr-3">
                                        <Receipt className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Добавить фото чека</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Необязательно, но поможет другим пользователям</p>
                                    </div>
                                    {!receiptPhoto ? (
                                        <button
                                            className="ml-auto bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-white text-xs px-3 py-1.5 rounded-md flex items-center transition-colors"
                                            onClick={() => receiptInputRef.current?.click()}
                                            type="button"
                                        >
                                            <Receipt className="w-3 h-3 mr-1.5" />
                                            Загрузить
                                        </button>
                                    ) : (
                                        <button
                                            className="ml-auto bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-300 text-xs px-3 py-1.5 rounded-md flex items-center transition-colors"
                                            onClick={handleRemoveReceiptPhoto}
                                            type="button"
                                        >
                                            <Trash2 className="w-3 h-3 mr-1.5" />
                                            Удалить
                                        </button>
                                    )}
                                    <input 
                                        type="file" 
                                        ref={receiptInputRef}
                                        className="hidden"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        onChange={handleReceiptSelect}
                                        aria-label="Загрузить фото чека"
                                        data-testid="receipt-upload"
                                    />
                                </div>
                                
                                {/* Receipt photo preview */}
                                {receiptPhoto && (
                                    <div className="mt-3">
                                        <div className="relative inline-block rounded-lg overflow-hidden">
                                            <img 
                                                src={receiptPhoto.preview} 
                                                alt="Фото чека" 
                                                className="h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                                            />
                                            <div className="absolute bottom-1 right-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded flex items-center">
                                                <Receipt className="w-3 h-3 mr-1" />
                                                <span>Чек</span>
                                            </div>
                                        </div>
                                    </div>
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
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Добавить фото</p>
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
                                    className={`
                                        w-full p-3 border rounded-lg
                                        bg-gray-50 dark:bg-gray-700 
                                        ${feedback.length < 10 && showValidation ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-gray-600'}
                                        min-h-[120px] resize-none
                                        text-sm text-gray-700 dark:text-gray-200
                                        focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-500 
                                        focus:border-gray-300 dark:focus:border-gray-500
                                        transition-all
                                        pr-10
                                    `}
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
                                                : feedback.length < 10 && showValidation
                                                ? "text-red-500 dark:text-red-400"
                                                : "text-gray-500 dark:text-gray-400"
                                        }`}
                                    >
                                        {feedback.length}/250
                                    </span>
                                </div>
                                {feedback.length < 10 && showValidation && (
                                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                                        Минимальная длина отзыва - 10 символов
                                    </p>
                                )}
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
                                    ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed' 
                                    : 'bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-700'}
                                transition-colors shadow-sm
                                `}
                            >
                                {submitting ? 'Отправка...' : 'Отправить отзыв'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
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

const ReviewForm = ({ user, onReviewSubmitted }) => {
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                setLoading(true);
                const data = await restaurantService.getRestaurants();
                
                console.log('Ответ API для ресторанов:', data);
                
                // Проверьте, существует ли данные и имеет ли ожидаемую структуру
                if (!data) {
                    console.error('Пустой ответ от API');
                    setError('Не получено данных от сервера');
                    setRestaurants([]);
                    return;
                }
                
                // Обработайте разные структуры ответов API
                let restaurantsArray = [];
                if (data.restaurants && Array.isArray(data.restaurants)) {
                    restaurantsArray = data.restaurants;
                } else if (Array.isArray(data)) {
                    restaurantsArray = data;
                } else {
                    console.error('Неожиданная структура данных:', data);
                    setError('Неверный формат данных');
                    setRestaurants([]);
                    return;
                }
                
                console.log('Restaurants array:', restaurantsArray);
                
                // Убедитесь, что все рестораны имеют согласованные имена полей для отображения
                const processedRestaurants = restaurantsArray.map(restaurant => ({
                    ...restaurant,
                    // Убедитесь, что у нас есть оба snake_case и camelCase для совместимости
                    id: restaurant.id || Math.random().toString(36).substr(2, 9),
                    name: restaurant.name || 'Unnamed Restaurant',
                    image: restaurant.image_url || restaurant.imageUrl || restaurantPlaceholder(),
                    category: restaurant.category || restaurant.cuisine || 'Разное',
                    cuisine: restaurant.category || restaurant.cuisine || 'Разное',
                    price_range: restaurant.price_range || restaurant.priceRange || '₽₽',
                    priceRange: restaurant.price_range || restaurant.priceRange || '₽₽',
                    min_price: restaurant.min_price || restaurant.minPrice || '',
                    minPrice: restaurant.min_price || restaurant.minPrice || '',
                    delivery_time: restaurant.delivery_time || restaurant.deliveryTime || '',
                    deliveryTime: restaurant.delivery_time || restaurant.deliveryTime || '',
                    avgRating: restaurant.avg_rating || restaurant.avgRating || 0,
                    // Добавляем обработку времени работы
                    hours: restaurant.hours || restaurant.workingHours || '10:00-22:00',
                    workingHours: restaurant.hours || restaurant.workingHours || '10:00-22:00'
                }));
                
                console.log('Обработанные рестораны:', processedRestaurants);
                setRestaurants(processedRestaurants);
            } catch (err) {
                console.error('Ошибка при получении ресторанов:', err);
                setError('Не удалось загрузить рестораны');
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

    const handleRestaurantSelect = (restaurant) => {
        setSelectedRestaurant(restaurant);
    };

    const handleCloseDetail = () => {
        setSelectedRestaurant(null);
    };

    const handleReviewSubmitted = (reviewData) => {
        setSelectedRestaurant(null);
        if (onReviewSubmitted) {
            onReviewSubmitted(reviewData);
        }
    };

    if (error) {
        return (
            <div className="text-red-500 p-4 text-center">
                {error}
            </div>
        );
    }

    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto">
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300"></div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Загрузка ресторанов...</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
                            <div className="w-full pt-[60%] bg-gray-200 dark:bg-gray-700"></div>
                            <div className="p-2">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {restaurants.length > 0 ? (
                    restaurants.map((restaurant) => (
                        <RestaurantButton
                            key={restaurant.id}
                            restaurant={restaurant}
                            isSelected={selectedRestaurant?.id === restaurant.id}
                            onSelect={handleRestaurantSelect}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <Utensils className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Нет доступных ресторанов</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            В данный момент список ресторанов пуст.
                        </p>
                    </div>
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

ReviewForm.propTypes = {
    user: PropTypes.object,
    onReviewSubmitted: PropTypes.func
};

export default ReviewForm;

// Добавляем глобальные стили для кастомного скроллбара в конец файла
// Эти стили будут применяться к элементам с классом custom-scrollbar
const style = document.createElement('style');
style.textContent = `
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(156, 163, 175, 0.5);
        border-radius: 20px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: rgba(156, 163, 175, 0.7);
    }
    
    /* Для темной темы */
    .dark .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(75, 85, 99, 0.5);
    }
    
    .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: rgba(75, 85, 99, 0.7);
    }
`;
document.head.appendChild(style);