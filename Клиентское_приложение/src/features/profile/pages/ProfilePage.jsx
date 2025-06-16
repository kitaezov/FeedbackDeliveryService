import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    UserCircle2, 
    Mail, 
    Phone, 
    Calendar, 
    Edit2, 
    Save, 
    X, 
    Upload, 
    Trash2, 
    Camera,
    AlertCircle,
    CheckCircle,
    Key,
    Eye,
    EyeOff,
    ArrowLeft,
    Star,
    MessageSquare
} from 'lucide-react';
import { useAuthContext } from '../../../common/contexts/AuthContext';
import { useTheme } from '../../../common/contexts/ThemeContext';
import { Link } from 'react-router-dom';
import api from '../../../utils/api';
import { API_URL } from '../../../config';
import { getAvatarUrl } from '../../../utils/imageUtils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

// Анимация для компонентов
const itemVariants = {
    hidden: { 
        opacity: 0, 
        y: 20 
    },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
            type: "spring", 
            stiffness: 400,
            damping: 25
        }
    },
    exit: { 
        opacity: 0, 
        y: -20,
        transition: { 
            duration: 0.2 
        }
    }
};

// Анимация для кнопок
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

// Анимация для полей ввода
const inputVariants = {
    focus: {
        scale: 1.02,
        borderColor: "#3b82f6",
        transition: { 
            duration: 0.2 
        }
    }
};

// Компонент уведомления
const Notification = ({ type, message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const typeStyles = {
        error: 'bg-red-50 border-red-300 text-red-700 dark:bg-red-900/40 dark:border-red-700 dark:text-red-200',
        success: 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/40 dark:border-green-700 dark:text-green-200',
        warning: 'bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-900/40 dark:border-yellow-700 dark:text-yellow-200',
        info: 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-200'
    };

    const icons = {
        error: <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400"/>,
        success: <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400"/>,
        warning: <AlertCircle className="w-5 h-5 text-yellow-500 dark:text-yellow-400"/>,
        info: <AlertCircle className="w-5 h-5 text-blue-500 dark:text-blue-400"/>
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`
                fixed top-4 right-4 z-50
                flex items-center 
                px-4 py-3 
                rounded-lg 
                shadow-lg 
                border 
                ${typeStyles[type] || typeStyles.info}
            `}
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
            >
                <X size={16} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" />
            </button>
        </motion.div>
    );
};

// Компонент поля ввода
const InputField = ({ 
    icon, 
    label, 
    type = 'text', 
    value, 
    onChange, 
    disabled = false,
    placeholder = '', 
    isPassword = false
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const actualType = isPassword ? (showPassword ? 'text' : 'password') : type;
    
    return (
        <motion.div 
            className="mb-4"
            variants={itemVariants}
        >
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {icon}
                </div>
                <motion.input
                    type={actualType}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    placeholder={placeholder}
                    whileFocus="focus"
                    variants={inputVariants}
                    className={`
                        block w-full pl-10 pr-${isPassword ? '10' : '3'} py-2 
                        border border-gray-300 rounded-md shadow-sm 
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                        bg-white dark:bg-gray-800 dark:border-gray-700 
                        text-gray-900 dark:text-gray-100
                        transition-all duration-200
                        ${disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : ''}
                    `}
                />
                {isPassword && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <motion.button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
                        >
                            {showPassword ? 
                                <EyeOff size={18} /> : 
                                <Eye size={18} />
                            }
                        </motion.button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Компонент отзыва пользователя
const ReviewCard = ({ review }) => {
    const { isDarkMode } = useTheme();
    
    // Форматирование даты
    const formattedDate = review.created_at ? 
        format(new Date(review.created_at), 'dd MMMM yyyy', { locale: ru }) : 
        '';
    
    return (
        <motion.div 
            className={`p-4 mb-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {review.restaurant_name}
                    </h3>
                    <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                            <Star 
                                key={i} 
                                size={16} 
                                className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} 
                            />
                        ))}
                        <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formattedDate}
                        </span>
                    </div>
                </div>
                <Link 
                    to={`/reviews/${review.id}`} 
                    className={`text-sm font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                >
                    Подробнее
                </Link>
            </div>
            
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                {review.comment.length > 150 ? `${review.comment.substring(0, 150)}...` : review.comment}
            </div>
            
            <div className="flex items-center text-sm">
                <MessageSquare size={14} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                <span className={`ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {review.likes} {review.likes === 1 ? 'лайк' : 
                     review.likes > 1 && review.likes < 5 ? 'лайка' : 'лайков'}
                </span>
            </div>
        </motion.div>
    );
};

// Главный компонент профиля
const ProfilePage = () => {
    const { user, updateUser } = useAuthContext();
    const { isDarkMode } = useTheme();
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        birthday: '',
        avatarUrl: null
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [notification, setNotification] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState({});
    const deleteConfirmRef = useRef(null);
    
    // Состояние для отзывов пользователя
    const [userReviews, setUserReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewsError, setReviewsError] = useState(null);

    // Загрузка данных профиля
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await api.get('/profile');
                if (response.data && response.data.user) {
                    const userData = response.data.user;
                    setProfileData({
                        name: userData.name || '',
                        email: userData.email || '',
                        phone: userData.phoneNumber || '',
                        birthday: userData.birthDate ? new Date(userData.birthDate).toISOString().split('T')[0] : '',
                        avatarUrl: userData.avatar
                    });
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
                setNotification({
                    type: 'error',
                    message: 'Не удалось загрузить данные профиля'
                });
            }
        };

        if (user) {
            fetchUserProfile();
        }
    }, [user]);

    // Загрузка отзывов пользователя
    useEffect(() => {
        const fetchUserReviews = async () => {
            if (!user) return;
            
            setReviewsLoading(true);
            setReviewsError(null);
            
            try {
                const response = await api.get('/reviews', { 
                    params: { 
                        userId: user.id,
                        limit: 5,
                        page: 1
                    } 
                });
                
                console.log('User reviews API response:', response);
                
                // Handle different response formats
                let reviewsData = [];
                
                if (response.data && Array.isArray(response.data)) {
                    // Direct array format
                    reviewsData = response.data;
                    console.log('Reviews data is an array:', reviewsData);
                } else if (response.data && response.data.reviews) {
                    if (Array.isArray(response.data.reviews)) {
                        // Format: { reviews: [...] }
                        reviewsData = response.data.reviews;
                        console.log('Reviews data is in reviews property:', reviewsData);
                    } else if (response.data.reviews && response.data.reviews.reviews && Array.isArray(response.data.reviews.reviews)) {
                        // Format: { reviews: { reviews: [...] } }
                        reviewsData = response.data.reviews.reviews;
                        console.log('Reviews data is nested in reviews.reviews:', reviewsData);
                    }
                }
                
                console.log('Final processed reviews data:', reviewsData);
                setUserReviews(reviewsData);
            } catch (error) {
                console.error('Error fetching user reviews:', error);
                setReviewsError('Не удалось загрузить отзывы');
                setNotification({
                    type: 'error',
                    message: 'Не удалось загрузить отзывы'
                });
            } finally {
                setReviewsLoading(false);
            }
        };

        if (user) {
            fetchUserReviews();
        }
    }, [user]);

    // Обработчик клика вне компонента
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (deleteConfirmRef.current && !deleteConfirmRef.current.contains(event.target)) {
                setShowDeleteConfirm(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Обработчик изменения полей формы
    const handleInputChange = (field, value) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Обработчик изменения полей пароля
    const handlePasswordChange = (field, value) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Очищаем ошибки при вводе
        if (passwordErrors[field]) {
            setPasswordErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    // Валидация пароля
    const validatePasswordChange = () => {
        const errors = {};
        
        if (!passwordData.currentPassword) {
            errors.currentPassword = 'Введите текущий пароль';
        }
        
        if (passwordData.newPassword) {
            if (passwordData.newPassword.length < 8) {
                errors.newPassword = 'Пароль должен содержать минимум 8 символов';
            }
            
            if (passwordData.newPassword !== passwordData.confirmPassword) {
                errors.confirmPassword = 'Пароли не совпадают';
            }
        }
        
        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Обработчик сохранения данных профиля
    const handleSaveProfile = async () => {
        try {
            console.log('Sending profile data:', {
                name: profileData.name,
                email: profileData.email,
                phoneNumber: profileData.phone,
                birthDate: profileData.birthday
            });
            
            const response = await api.put('/profile', {
                name: profileData.name,
                email: profileData.email,
                phoneNumber: profileData.phone,
                birthDate: profileData.birthday
            });

            if (response.status === 200) {
                setNotification({
                    type: 'success',
                    message: 'Профиль успешно обновлен'
                });
                setIsEditing(false);
                
                // Обновляем данные пользователя в контексте
                if (updateUser) {
                    updateUser({
                        ...user,
                        name: profileData.name,
                        email: profileData.email
                    });
                }
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setNotification({
                type: 'error',
                message: 'Не удалось обновить профиль'
            });
        }
    };

    // Обработчик смены пароля
    const handleChangePassword = async () => {
        if (!validatePasswordChange()) {
            return;
        }
        
        try {
            const response = await api.put('/profile/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            
            if (response.status === 200) {
                setNotification({
                    type: 'success',
                    message: 'Пароль успешно изменен'
                });
                
                // Сбрасываем форму смены пароля
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                
                setIsChangingPassword(false);
            }
        } catch (error) {
            console.error('Error changing password:', error);
            
            // Обрабатываем возможные ошибки от сервера
            if (error.response && error.response.data && error.response.data.message) {
                if (error.response.data.message.includes('current password')) {
                    setPasswordErrors(prev => ({
                        ...prev,
                        currentPassword: 'Неверный текущий пароль'
                    }));
                } else {
                    setNotification({
                        type: 'error',
                        message: error.response.data.message
                    });
                }
            } else {
                setNotification({
                    type: 'error',
                    message: 'Не удалось изменить пароль'
                });
            }
        }
    };

    // Обработчик загрузки аватара
    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setIsUploading(true);
        
        try {
            // Создаем FormData для загрузки файла
            const formData = new FormData();
            formData.append('avatar', file);
            
            const response = await api.post('/profile/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (response.status === 200 && response.data.avatarUrl) {
                setProfileData(prev => ({
                    ...prev,
                    avatarUrl: response.data.avatarUrl
                }));
                
                // Обновляем аватар в контексте пользователя
                if (updateUser) {
                    updateUser({
                        ...user,
                        avatar: response.data.avatarUrl
                    });
                }
                
                setNotification({
                    type: 'success',
                    message: 'Аватар успешно обновлен'
                });
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            setNotification({
                type: 'error',
                message: 'Не удалось загрузить аватар'
            });
        } finally {
            setIsUploading(false);
        }
    };

    // Обработчик удаления аватара
    const handleDeleteAvatar = async () => {
        try {
            const response = await api.delete('/profile/avatar');
            
            if (response.status === 200) {
                setProfileData(prev => ({
                    ...prev,
                    avatarUrl: null
                }));
        
                // Обновляем аватар в контексте пользователя
                if (updateUser) {
                    updateUser({
                        ...user,
                        avatar: null
                    });
                }
        
                setNotification({
                    type: 'success',
                    message: 'Аватар успешно удален'
                });
        
                setShowDeleteConfirm(false);
            }
        } catch (error) {
            console.error('Error deleting avatar:', error);
            setNotification({
                type: 'error',
                message: 'Не удалось удалить аватар'
            });
        }
    };

    const closeNotification = () => setNotification(null);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <AnimatePresence>
                {notification && (
                    <Notification
                        type={notification.type}
                        message={notification.message}
                        onClose={closeNotification}
                    />
                )}
            </AnimatePresence>

            {/* Заголовок с кнопкой назад */}
            <motion.div 
                className="flex items-center mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Link to="/">
                    <motion.button
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        className="mr-3 p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        <ArrowLeft size={20} />
                    </motion.button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Профиль пользователя</h1>
            </motion.div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors duration-300 mb-6">
                {/* Аватар и базовая информация */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Аватар с возможностью загрузки */}
                        <motion.div 
                            className="relative"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-md">
                                {profileData.avatarUrl ? (
                                    <img 
                                        src={getAvatarUrl ? getAvatarUrl(profileData.avatarUrl) : profileData.avatarUrl} 
                                        alt="Аватар пользователя"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                                        <UserCircle2 size={64} />
                                    </div>
                                )}
                                
                                {/* Кнопка загрузки аватара */}
                                <label 
                                    className="absolute bottom-0 right-0 p-1.5 bg-blue-500 hover:bg-blue-600 rounded-full text-white cursor-pointer shadow-md transition-all duration-200"
                                >
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleAvatarUpload} 
                                        className="hidden" 
                                    />
                                    <Camera size={16} />
                                </label>
                            </div>
                            
                            {/* Кнопка удаления аватара */}
                                {profileData.avatarUrl && (
                                    <motion.button
                                        variants={buttonVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="mt-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium flex items-center justify-center w-full"
                                    >
                                    <Trash2 size={14} className="mr-1" />
                                        Удалить фото
                                    </motion.button>
                                )}
                        </motion.div>
                        
                        {/* Основная информация */}
                        <motion.div 
                            className="flex-grow"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                                    Основная информация
                                </h2>
                                
                                <motion.button
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={`
                                        px-3 py-1.5 rounded-md flex items-center 
                                        ${isEditing 
                                            ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200' 
                                            : 'bg-blue-500 text-white dark:bg-blue-600'
                                        }
                                        transition-colors duration-200
                                    `}
                                >
                                    {isEditing ? (
                                        <>
                                            <X size={16} className="mr-1" />
                                            <span>Отмена</span>
                                        </>
                                    ) : (
                                        <>
                                            <Edit2 size={16} className="mr-1" />
                                            <span>Изменить</span>
                                        </>
                                    )}
                                </motion.button>
                    </div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1, duration: 0.3 }}
                            >
                                <InputField 
                                    icon={<UserCircle2 size={18} className="text-gray-500 dark:text-gray-400" />}
                                    label="Имя"
                                        value={profileData.name}
                                    onChange={(value) => handleInputChange('name', value)}
                                    disabled={!isEditing}
                                    placeholder="Введите ваше имя"
                                />
                                
                                <InputField 
                                    icon={<Mail size={18} className="text-gray-500 dark:text-gray-400" />}
                                    label="Email"
                                        type="email"
                                        value={profileData.email}
                                    onChange={(value) => handleInputChange('email', value)}
                                    disabled={!isEditing}
                                    placeholder="Введите ваш email"
                                />
                                
                                <InputField 
                                    icon={<Phone size={18} className="text-gray-500 dark:text-gray-400" />}
                                    label="Телефон"
                                        type="tel"
                                        value={profileData.phone}
                                    onChange={(value) => handleInputChange('phone', value)}
                                    disabled={!isEditing}
                                    placeholder="Введите ваш телефон"
                                />
                                
                                <InputField 
                                    icon={<Calendar size={18} className="text-gray-500 dark:text-gray-400" />}
                                    label="Дата рождения"
                                        type="date"
                                        value={profileData.birthday}
                                    onChange={(value) => handleInputChange('birthday', value)}
                                    disabled={!isEditing}
                                />
                                
                                {isEditing && (
                                    <motion.div 
                                        className="mt-4"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <motion.button
                                            variants={buttonVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                            onClick={handleSaveProfile}
                                            className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center justify-center hover:bg-green-600 transition-colors duration-200"
                                        >
                                            <Save size={18} className="mr-2" />
                                            Сохранить изменения
                                        </motion.button>
                                    </motion.div>
                                )}
                            </motion.div>
                        </motion.div>
                                </div>
                            </div>
                
                {/* Смена пароля */}
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                            Безопасность
                                </h2>
                                
                        <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => setIsChangingPassword(!isChangingPassword)}
                            className={`
                                px-3 py-1.5 rounded-md flex items-center 
                                ${isChangingPassword 
                                    ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200' 
                                    : 'bg-blue-500 text-white dark:bg-blue-600'
                                }
                                transition-colors duration-200
                            `}
                        >
                            {isChangingPassword ? (
                                <>
                                    <X size={16} className="mr-1" />
                                    <span>Отмена</span>
                                </>
                            ) : (
                                <>
                                    <Key size={16} className="mr-1" />
                                    <span>Сменить пароль</span>
                                </>
                            )}
                        </motion.button>
                    </div>
                    
                    <AnimatePresence>
                        {isChangingPassword && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="space-y-4 mt-2">
                                    <div>
                                        <InputField 
                                            icon={<Key size={18} className="text-gray-500 dark:text-gray-400" />}
                                            label="Текущий пароль"
                                            value={passwordData.currentPassword}
                                            onChange={(value) => handlePasswordChange('currentPassword', value)}
                                            isPassword={true}
                                            placeholder="Введите текущий пароль"
                                        />
                                        {passwordErrors.currentPassword && (
                                            <p className="mt-1 text-sm text-red-500">{passwordErrors.currentPassword}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <InputField 
                                            icon={<Key size={18} className="text-gray-500 dark:text-gray-400" />}
                                            label="Новый пароль (необязательно)"
                                            value={passwordData.newPassword}
                                            onChange={(value) => handlePasswordChange('newPassword', value)}
                                            isPassword={true}
                                            placeholder="Введите новый пароль"
                                        />
                                        {passwordErrors.newPassword && (
                                            <p className="mt-1 text-sm text-red-500">{passwordErrors.newPassword}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <InputField 
                                            icon={<Key size={18} className="text-gray-500 dark:text-gray-400" />}
                                            label="Подтверждение нового пароля"
                                            value={passwordData.confirmPassword}
                                            onChange={(value) => handlePasswordChange('confirmPassword', value)}
                                            isPassword={true}
                                            placeholder="Подтвердите новый пароль"
                                        />
                                        {passwordErrors.confirmPassword && (
                                            <p className="mt-1 text-sm text-red-500">{passwordErrors.confirmPassword}</p>
                                        )}
                                    </div>
                                    
                                    <motion.button
                                        variants={buttonVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                        onClick={handleChangePassword}
                                        className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center justify-center hover:bg-green-600 transition-colors duration-200"
                                    >
                                        <Save size={18} className="mr-2" />
                                        Сохранить изменения
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            
            {/* Отзывы пользователя */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors duration-300">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                            Мои отзывы
                        </h2>
                        
                        <Link to="/reviews/my">
                            <motion.button
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                className="px-3 py-1.5 rounded-md flex items-center bg-blue-500 text-white dark:bg-blue-600 transition-colors duration-200"
                            >
                                <span>Все отзывы</span>
                            </motion.button>
                        </Link>
                    </div>
                    
                    <div>
                        {reviewsLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : reviewsError ? (
                            <div className="text-center py-8 text-red-500 dark:text-red-400">
                                {reviewsError}
                            </div>
                        ) : userReviews.length > 0 ? (
                            <div>
                                {userReviews.map(review => (
                                    <ReviewCard key={review.id} review={review} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                У вас пока нет отзывов. Оставьте свой первый отзыв о ресторане!
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Модальное окно подтверждения удаления аватара */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <motion.div 
                            ref={deleteConfirmRef}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-sm w-full"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Удалить аватар?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Вы уверены, что хотите удалить ваш аватар? Это действие нельзя отменить.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <motion.button
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
                                >
                                    Отмена
                                </motion.button>
                                <motion.button
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    onClick={handleDeleteAvatar}
                                    className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600"
                                >
                                    Удалить
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfilePage; 