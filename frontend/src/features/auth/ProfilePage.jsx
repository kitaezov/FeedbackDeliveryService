import React, {useState, useEffect, useRef} from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import {
    UserCircle,
    AlertCircle,
    CheckCircle,
    Save,
    Edit2,
    X,
    Star,
    ThumbsUp,
    Trash2,
    Calendar,
    Coffee,
    UserCircle2,
    Mail,
    Key,
    ArrowLeft,
    CircleAlert,
    CircleCheck
} from "lucide-react";
import { useAuth } from './AuthContext';
import { useTheme } from '../../common/contexts/ThemeContext';
import { formatDate as formatDateUtil } from '../../common/utils/formatUtils';

import {motion, AnimatePresence} from "framer-motion";
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { API_URL } from '../../config';

/**
 * Компонент уведомления с анимацией
 * 
 * Отображает временное уведомление с заданным типом и сообщением, которое автоматически скрывается
 * 
 * @param {string} type - Тип уведомления ('error', 'success', 'info', 'warning')
 * @param {string} message - Текст сообщения для отображения
 * @param {Function} onClose - Функция для закрытия уведомления
 * @returns {JSX.Element} - React-компонент уведомления
 */
const Notification = ({type, message, onClose}) => {
    // Автоматическое закрытие уведомления через 3 секунды
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    // Стили и иконки в зависимости от типа уведомления
    const typeStyles = {
        error: 'bg-red-50 border-red-300 text-red-700',
        success: 'bg-green-50 border-green-300 text-green-700',
        info: 'bg-gray-100 border-gray-300 text-gray-700',
        warning: 'bg-yellow-50 border-yellow-300 text-yellow-700'
    };

    const icons = {
        error: <AlertCircle className="w-6 h-6 text-red-500"/>,
        success: <CheckCircle className="w-6 h-6 text-green-500"/>,
        info: <AlertCircle className="w-6 h-6 text-gray-600"/>,
        warning: <AlertCircle className="w-6 h-6 text-yellow-500"/>
    };

    return (
        <motion.div
            initial={{opacity: 0, y: -20}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -20}}
            className={`
                fixed top-4 right-4 z-50
                flex items-center 
                px-4 py-3 
                rounded-lg 
                shadow-lg 
                border 
                ${typeStyles[type] || typeStyles.info}
            `}
            role="alert"
            aria-live="assertive"
        >
            <div className="mr-3">
                {icons[type] || icons.info}
            </div>
            <div className="text-sm font-medium">
                {message}
            </div>
            <button
                onClick={onClose}
                className="ml-4 focus:outline-none"
                aria-label="Закрыть уведомление"
            >
                <span className="text-gray-500 hover:text-gray-700">×</span>
            </button>
        </motion.div>
    );
};

/**
 * Компонент для отображения пустого списка отзывов
 * 
 * Отображает информативное сообщение и визуальный элемент, когда у пользователя нет отзывов
 * 
 * @returns {JSX.Element} - React-компонент для состояния отсутствия отзывов
 */
const NoReviews = () => (
    <motion.div
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{duration: 0.5}}
        className="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-6 flex flex-col items-center justify-center text-center border border-gray-200 dark:border-gray-700 shadow-xl dark:shadow-gray-900/30"
    >
        <motion.div
            initial={{scale: 0.8}}
            animate={{scale: 1}}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 20
            }}
        >
            <Coffee className="w-16 h-16 text-gray-400 dark:text-gray-300 mb-4"/>
        </motion.div>
        <h3 className="text-xl font-medium text-gray-700 dark:text-gray-200 mb-2">
            У вас пока нет отзывов
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Ваши отзывы появятся здесь после их создания
        </p>
    </motion.div>
);

// Константы для валидации форм
const VALIDATION_RULES = {
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 50,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MIN_PASSWORD_LENGTH: 6
};

/**
 * Основной компонент страницы профиля пользователя
 * 
 * Отображает информацию о пользователе, позволяет редактировать профиль,
 * управлять аватаром и просматривать/удалять свои отзывы
 * 
 * @param {Object} user - Данные пользователя
 * @param {Function} onUpdateUser - Функция для обновления данных пользователя
 * @param {Function} onLogout - Функция для выхода из системы
 * @returns {JSX.Element} - React-компонент страницы профиля
 */
const ProfilePage = ({ onLogout }) => {
    const { user, setUser, updateAuthUser } = useAuth();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    // Состояния компонента
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState(user);
    const [errors, setErrors] = useState({});
    const [userReviews, setUserReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [deleteReviewId, setDeleteReviewId] = useState(null);

    /**
     * Форматирует дату для API
     * 
     * @param {string|Date} date - Дата для форматирования
     * @returns {string} - Форматированная дата в формате ISO
     */
    const formatDateForApi = (date) => {
        if (!date) return new Date().toISOString();
        return new Date(date).toISOString();
    };

    // Загрузка данных профиля пользователя при монтировании компонента
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                // Получение токена из localStorage, sessionStorage или из объекта пользователя
                const token = localStorage.getItem('token') || sessionStorage.getItem('token') || user.token;
                
                if (!token) {
                    throw new Error('Токен авторизации не найден');
                }

                // Запрос к API для получения профиля пользователя
                const response = await api.get('/auth/profile');

                console.log('Ответ от сервера с профилем:', response.data);
                
                // Обновление данных пользователя
                if (response.data && response.data.user) {
                    const profileData = response.data.user;
                    
                    // Обновление пользователя с полученными данными
                    setUser({
                        ...user,
                        ...profileData,
                        token // сохраняем текущий токен
                    });
                }
            } catch (error) {
                console.error('Ошибка загрузки профиля:', error);
                
                // Не показываем пользователю сообщение об ошибке, только логируем
                if (error.response?.status === 401 || error.response?.status === 403) {
                    console.warn('Ошибка авторизации при загрузке профиля');
                }
            }
        };

        // Загружаем профиль пользователя
        fetchUserProfile();
    }, [user.id, setUser, user.token]);

    // Загрузка отзывов пользователя при монтировании компонента
    useEffect(() => {
        const fetchUserReviews = async () => {
            try {
                // Запрос к API для получения всех отзывов
                const response = await api.get('/reviews');

                console.log('Ответ от сервера с отзывами:', response.data);
                
                // Получаем массив отзывов из ответа сервера
                const reviewsData = response.data.reviews || [];
                
                if (!Array.isArray(reviewsData)) {
                    throw new Error('Неверный формат данных отзывов');
                }

                // Фильтрация отзывов по ID пользователя, а не по имени
                const userReviews = reviewsData
                    .filter(review => review.user_id === user.id)
                    .map(review => ({
                        ...review,
                        // Обеспечиваем совместимость полей с обоими форматами
                        id: review.id,
                        userId: review.user_id || review.userId,
                        userName: review.user_name || review.userName,
                        restaurantName: review.restaurant_name || review.restaurantName,
                        rating: review.rating,
                        comment: review.comment,
                        date: review.date || new Date().toISOString().split('T')[0],
                        likes: review.likes || 0,
                        // Преобразуем детальные оценки в формат, ожидаемый фронтендом
                        ratings: {
                            food: review.food_rating || 0,
                            service: review.service_rating || 0,
                            atmosphere: review.atmosphere_rating || 0,
                            price: review.price_rating || 0,
                            cleanliness: review.cleanliness_rating || 0
                        }
                    }));

                console.log('Отфильтрованные отзывы пользователя:', userReviews);

                // Обновление состояния отзывов
                setUserReviews(userReviews);

                // Расчет статистики пользователя
                const reviewStats = {
                    totalReviews: userReviews.length,
                    averageRating: userReviews.length
                        ? (userReviews.reduce((sum, review) => sum + Number(review.rating), 0) / userReviews.length).toFixed(1)
                        : 0,
                    totalLikes: user.total_likes || userReviews.reduce((sum, review) => sum + (Number(review.likes) || 0), 0)
                };

                // Обновление данных пользователя с новой статистикой
                setUser({
                    ...user,
                    ...reviewStats,
                    reviews: userReviews
                });

                setIsLoading(false);
            } catch (error) {
                console.error('Ошибка загрузки отзывов:', error);
                setIsLoading(false);
                setNotification({
                    type: 'error',
                    message: error.message === 'Неверный формат данных отзывов' 
                        ? 'Получены некорректные данные от сервера'
                        : 'Не удалось загрузить отзывы. Проверьте подключение к интернету.'
                });
            }
        };

        fetchUserReviews();
    }, [user.name, user.id, setUser, user.token]);

    /**
     * Закрывает уведомление
     */
    const closeNotification = () => {
        setNotification(null);
    };

    /**
     * Валидирует форму редактирования профиля
     * 
     * @returns {boolean} - Результат валидации (true - данные корректны, false - есть ошибки)
     */
    const validateForm = () => {
        const newErrors = {};

        // Валидация имени пользователя
        if (!editedUser.name || editedUser.name.length < VALIDATION_RULES.MIN_NAME_LENGTH) {
            newErrors.name = `Имя должно содержать минимум ${VALIDATION_RULES.MIN_NAME_LENGTH} символа`;
        } else if (editedUser.name.length > VALIDATION_RULES.MAX_NAME_LENGTH) {
            newErrors.name = `Имя не должно превышать ${VALIDATION_RULES.MAX_NAME_LENGTH} символов`;
        }

        // Валидация email
        if (!editedUser.email || !VALIDATION_RULES.EMAIL_REGEX.test(editedUser.email)) {
            newErrors.email = 'Некорректный email адрес';
        }

        // Валидация нового пароля, если он указан
        if (editedUser.newPassword && editedUser.newPassword.length < VALIDATION_RULES.MIN_PASSWORD_LENGTH) {
            newErrors.password = `Пароль должен содержать минимум ${VALIDATION_RULES.MIN_PASSWORD_LENGTH} символов`;
        }

        // Проверка, указан ли текущий пароль при смене пароля
        if (editedUser.newPassword && !editedUser.currentPassword) {
            newErrors.currentPassword = 'Для смены пароля необходимо указать текущий пароль';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Обрабатывает отправку формы редактирования профиля
     * 
     * @param {Event} e - Событие отправки формы
     * @returns {Promise<void>} - Promise, завершающийся после обновления профиля
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (!validateForm()) {
                return;
            }

            // Подготовка данных для обновления
            const updateData = {
                userId: user.id,
                name: editedUser.name,
                email: editedUser.email,
                currentPassword: editedUser.currentPassword,
                newPassword: editedUser.newPassword,
                phoneNumber: editedUser.phoneNumber || user.phoneNumber,
                birthDate: editedUser.birthDate || user.birthDate
            };

            // Отправка запроса на обновление профиля
            const response = await api.put('/profile', updateData);

            // Обновление данных пользователя
            setUser({
                ...user,
                name: response.data.user.name,
                email: response.data.user.email,
                phoneNumber: response.data.user.phoneNumber,
                birthDate: response.data.user.birthDate,
                avatar: response.data.user.avatar
            });

            // Выход из режима редактирования
            setIsEditing(false);

            // Показ уведомления об успешном обновлении
            setNotification({
                type: 'success',
                message: 'Профиль успешно обновлен'
            });
        } catch (error) {
            console.error('Ошибка при обновлении профиля:', error);
            
            // Определение типа ошибки
            if (error.response?.status === 401 || error.response?.status === 403) {
                setErrors({
                    submit: 'Сессия истекла. Пожалуйста, войдите снова.'
                });
            } else if (error.response?.data?.field) {
                // Если сервер указал конкретное поле с ошибкой
                setErrors({
                    [error.response.data.field]: error.response.data.message || 'Некорректные данные'
                });
            } else if (error.response?.data?.message) {
                setErrors({
                    submit: error.response.data.message
                });
            } else if (!error.response && error.request) {
                setErrors({
                    submit: 'Не удалось подключиться к серверу. Проверьте интернет-соединение.'
                });
            } else {
                setErrors({
                    submit: 'Произошла ошибка при обновлении профиля. Попробуйте позже.'
                });
            }
        }
    };

    /**
     * Обрабатывает изменение значения поля ввода
     * 
     * @param {string} field - Имя поля формы
     * @param {string} value - Новое значение поля
     */
    const handleInputChange = (field, value) => {
        setEditedUser({...editedUser, [field]: value});
        
        // Сброс ошибки для изменяемого поля
        if (errors[field]) {
            setErrors({...errors, [field]: null});
        }
    };

    /**
     * Переключает отображение панели администратора
     */
    const toggleAdminPanel = () => {
        // Перенаправляем пользователя на страницу администратора
        navigate('/admin');
    };

    /**
     * Форматирует дату для отображения
     * 
     * @param {string|Date} dateString - Дата для форматирования
     * @returns {string} - Отформатированная дата в локальном формате
     */
    const formatDate = (dateString) => {
        try {
            if (!dateString) return 'Дата не указана';
            
            const date = new Date(dateString);
            
            // Проверка на валидность даты
            if (isNaN(date.getTime())) {
                return 'Некорректная дата';
            }
            
            // Проверяем, является ли время полуночью (00:00)
            const isDefaultTime = date.getHours() === 0 && date.getMinutes() === 0;
            
            // Используем разные форматы в зависимости от времени
            if (isDefaultTime) {
                // Только дата без времени, если время 00:00
                return date.toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } else {
                // Дата со временем для всех других случаев
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

    /**
     * Удаляет отзыв пользователя
     * 
     * @param {number} reviewId - Идентификатор отзыва для удаления
     * @returns {Promise<void>} - Promise, завершающийся после удаления отзыва
     */
    const handleDeleteReview = async (reviewId) => {
        try {
            // Установка ID удаляемого отзыва для блокировки кнопки
            setDeleteReviewId(reviewId);

            // Выполнение запроса на удаление с обработкой ошибок
            const response = await api.delete(`/reviews/${reviewId}`);

            // Обновление локального состояния отзывов
            const updatedReviews = userReviews.filter(review => review.id !== reviewId);
            setUserReviews(updatedReviews);

            // Пересчет статистики отзывов
            const reviewStats = {
                totalReviews: updatedReviews.length,
                averageRating: updatedReviews.length
                    ? (updatedReviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) / updatedReviews.length).toFixed(1)
                    : 0,
                totalLikes: updatedReviews.reduce((sum, review) => sum + (Number(review.likes) || 0), 0)
            };

            // Обновление пользователя с новой статистикой
            setUser({
                ...user,
                ...reviewStats,
                reviews: updatedReviews,
            });

            // Показ уведомления об успешном удалении
            setNotification({
                type: 'success',
                message: 'Отзыв успешно удален'
            });
        } catch (error) {
            console.error('Ошибка удаления отзыва:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                reviewId: reviewId
            });

            // Определение типа ошибки и соответствующего сообщения
            let errorMessage = 'Не удалось удалить отзыв';
            
            if (error.response?.status === 401 || error.response?.status === 403) {
                errorMessage = 'Сессия истекла. Пожалуйста, войдите снова';
            } else if (error.response?.status === 404) {
                errorMessage = 'Отзыв не найден или уже был удален';
                // Обновляем список отзывов, удаляя ненайденный отзыв
                const updatedReviews = userReviews.filter(review => review.id !== reviewId);
                setUserReviews(updatedReviews);
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (!error.response && error.request) {
                errorMessage = 'Сервер не отвечает. Проверьте подключение к интернету';
            }

            // Показ уведомления об ошибке
            setNotification({
                type: 'error',
                message: errorMessage
            });
        } finally {
            // Сброс ID удаляемого отзыва
            setDeleteReviewId(null);
        }
    };

    return (
        <div className="space-y-6 w-full max-w-full mx-auto px-4 py-6">
            {/* Уведомление */}
            <AnimatePresence>
                {notification && (
                    <Notification
                        type={notification.type}
                        message={notification.message}
                        onClose={closeNotification}
                    />
                )}
            </AnimatePresence>
            
            {/* Кнопка назад */}
            <motion.button
                onClick={() => navigate(-1)}
                whileHover={{ x: -3 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors mb-4 w-full"
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span className="text-sm">Назад</span>
            </motion.button>

            {/* User Profile Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
            >
                <Card className="border border-gray-200 dark:border-gray-700 shadow-xl dark:shadow-gray-900/30 dark:bg-gray-800 w-full">
                    <CardHeader className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg font-medium text-gray-800 dark:text-gray-100">
                                Профиль пользователя
                            </CardTitle>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6">
                        <AnimatePresence mode="wait">
                            {isEditing ? (
                                <motion.form
                                    key="editForm"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    onSubmit={handleSubmit}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Поле ввода имени */}
                                        <div className="space-y-1">
                                            <label 
                                                htmlFor="name" 
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Имя
                                            </label>
                                            <div className="relative">
                                                <UserCircle2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <input
                                                    id="name"
                                                    type="text"
                                                    value={editedUser.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    className="block w-full pl-10 pr-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:ring-1 focus:ring-gray-500 focus:border-gray-500 dark:focus:border-gray-400"
                                                    required
                                                    minLength={VALIDATION_RULES.MIN_NAME_LENGTH}
                                                    maxLength={VALIDATION_RULES.MAX_NAME_LENGTH}
                                                />
                                            </div>
                                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                        </div>

                                        {/* Поле ввода email */}
                                        <div className="space-y-1">
                                            <label 
                                                htmlFor="email" 
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Email
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <input
                                                    id="email"
                                                    type="email"
                                                    value={editedUser.email}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                    className="block w-full pl-10 pr-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:ring-1 focus:ring-gray-500 focus:border-gray-500 dark:focus:border-gray-400"
                                                    required
                                                    pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                                                />
                                            </div>
                                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                        </div>

                                        {/* Поле ввода текущего пароля */}
                                        <div className="space-y-1">
                                            <label 
                                                htmlFor="currentPassword" 
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Текущий пароль
                                            </label>
                                            <div className="relative">
                                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <input
                                                    id="currentPassword"
                                                    type="password"
                                                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                                                    className="block w-full pl-10 pr-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:ring-1 focus:ring-gray-500 focus:border-gray-500 dark:focus:border-gray-400"
                                                />
                                            </div>
                                            {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>}
                                        </div>

                                        {/* Поле ввода нового пароля */}
                                        <div className="space-y-1">
                                            <label 
                                                htmlFor="newPassword" 
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Новый пароль (необязательно)
                                            </label>
                                            <div className="relative">
                                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <input
                                                    id="newPassword"
                                                    type="password"
                                                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                                    className="block w-full pl-10 pr-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:ring-1 focus:ring-gray-500 focus:border-gray-500 dark:focus:border-gray-400"
                                                    minLength={VALIDATION_RULES.MIN_PASSWORD_LENGTH}
                                                />
                                            </div>
                                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                        </div>
                                    </div>

                                    {/* Ошибки отправки формы */}
                                    {errors.submit && (
                                        <div
                                            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm"
                                            role="alert"
                                        >
                                            {errors.submit}
                                        </div>
                                    )}

                                    {/* Кнопка отправки формы */}
                                    <div className="flex justify-end">
                                        <motion.button
                                            type="submit"
                                            whileHover={{ scale: 1.02, y: -1 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="
                                                px-5 py-2
                                                bg-gradient-to-r from-gray-600 to-gray-700
                                                text-white
                                                rounded-md
                                                text-sm font-medium
                                                shadow-sm hover:shadow
                                                transition-all duration-200
                                                flex items-center
                                            "
                                        >
                                            <Save className="w-4 h-4 mr-2 flex-shrink-0"/>
                                            <span>Сохранить изменения</span>
                                        </motion.button>
                                    </div>
                                </motion.form>
                            ) : (
                                <motion.div
                                    key="profileView"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    {/* Основная информация профиля */}
                                    <div className="flex flex-col md:flex-row gap-6 relative">
                                        <div className="flex-shrink-0">
                                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-4 border-gray-300 dark:border-gray-600">
                                                <UserCircle2 size={64} className="text-gray-400 dark:text-gray-300" />
                                            </div>
                                        </div>

                                        <div className="flex-grow">
                                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-1">{user.name}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 mb-2 flex items-center">
                                                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                                {user.email}
                                            </p>
                                            {user.role === 'admin' && (
                                                <span className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-800 dark:text-gray-300 text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center">
                                                    <Star className="w-3 h-3 mr-1 text-yellow-500" />
                                                    Администратор
                                                </span>
                                            )}
                                        </div>
                                        
                                        <motion.button
                                            onClick={() => {
                                                setIsEditing(!isEditing);
                                                setEditedUser(user);
                                            }}
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            className={`
                                                px-3 py-1.5 rounded 
                                                flex items-center 
                                                text-sm font-medium
                                                absolute top-0 right-0
                                                transition-all duration-200 
                                                ${isEditing
                                                ? 'bg-gray-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            {isEditing ? (
                                                <>
                                                    <X className="w-4 h-4 mr-1.5"/>
                                                    <span>Отмена</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Edit2 className="w-4 h-4 mr-1.5"/>
                                                    <span>Редактировать</span>
                                                </>
                                            )}
                                        </motion.button>
                                    </div>

                                    {/* Статистика пользователя */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                                        <motion.div
                                            whileHover={{ y: -2 }}
                                            className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700 shadow-xl dark:shadow-gray-900/30 transition-all duration-200"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Отзывов</span>
                                            </div>
                                            <div className="text-2xl font-bold text-gray-800 dark:text-white">{user.totalReviews || 0}</div>
                                        </motion.div>

                                        <motion.div
                                            whileHover={{ y: -2 }}
                                            className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700 shadow-xl dark:shadow-gray-900/30 transition-all duration-200"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Средняя оценка</span>
                                            </div>
                                            <div className="text-2xl font-bold text-gray-800 dark:text-white">{user.averageRating || 0}</div>
                                        </motion.div>

                                        <motion.div
                                            whileHover={{ y: -2 }}
                                            className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700 shadow-xl dark:shadow-gray-900/30 transition-all duration-200"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Получено лайков</span>
                                            </div>
                                            <div className="text-2xl font-bold text-gray-800 dark:text-white">{user.totalLikes || 0}</div>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Карточка отзывов пользователя */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="w-full"
            >
                <Card className="border border-gray-200 dark:border-gray-700 shadow-xl dark:shadow-gray-900/30 dark:bg-gray-800">
                    <CardHeader className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <CardTitle className="text-lg font-medium text-gray-800 dark:text-gray-100 flex items-center">
                            <Coffee className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-300"/>
                            Мои отзывы
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {isLoading ? (
                            <div className="flex justify-center items-center p-8">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1.5,
                                        ease: "linear"
                                    }}
                                >
                                    <Coffee className="w-8 h-8 text-gray-400 dark:text-gray-500"/>
                                </motion.div>
                            </div>
                        ) : userReviews.length > 0 ? (
                            <div className="space-y-4">
                                {userReviews.map(review => (
                                    <motion.div
                                        key={review.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        whileHover={{ y: -2 }}
                                        className="p-5 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow dark:hover:shadow-gray-900/50 transition-all duration-200"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                                                    <UserCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                                </div>
                                                <h4 className="font-medium text-gray-800 dark:text-gray-100 text-lg">{review.restaurantName}</h4>
                                            </div>
                                            <div className="flex space-x-1">
                                                {Array.from({length: 5}).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < Math.round(Number(review.rating))
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-gray-300 dark:text-gray-500'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm line-clamp-3">{review.comment}</p>

                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                                <Calendar className="w-3.5 h-3.5 mr-1" />
                                                {review.date ? formatDate(review.date) : 'Дата не указана'}
                                                
                                                <span className="mx-2">•</span>
                                                
                                                <ThumbsUp className="w-3.5 h-3.5 mr-1 text-blue-500 dark:text-blue-400" />
                                                {Number(review.likes) || 0}
                                            </div>
                                            
                                            <motion.button
                                                onClick={() => handleDeleteReview(review.id)}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                disabled={deleteReviewId === review.id}
                                                className={`text-gray-400 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors ${deleteReviewId === review.id ? 'opacity-50' : ''}`}
                                            >
                                                {deleteReviewId === review.id ? (
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                    >
                                                        <Coffee className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                                    </motion.div>
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <NoReviews />
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export { ProfilePage };
