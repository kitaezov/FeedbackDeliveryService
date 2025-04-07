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
    Upload,
    Camera,
    ImageOff,
    CircleAlert,
    CircleCheck,
    UserCircle2
} from "lucide-react";
import ImageLoader from "../../components/ImageLoader";
import { getAvatarUrl, isValidImageFile, createImagePreview, optimizeImage, getImageAcceptString } from "../../utils/imageUtils";
import { useAuth } from './AuthContext';
import { useTheme } from '../../common/contexts/ThemeContext';

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

// В компоненте AvatarUploadModal определим константу для изображения по умолчанию
const fallbackSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAgMTJDMTIuMjA5MSAxMiAxNCAxMC4yMDkxIDE0IDhDMTQgNS43OTA4NiAxMi4yMDkxIDQgMTAgNEM3Ljc5MDg2IDQgNiA1Ljc5MDg2IDYgOEM2IDEwLjIwOTEgNy43OTA4NiAxMiAxMCAxMloiIGZpbGw9IiM2QjcyODAiLz48cGF0aCBkPSJNMTAgMEMyLjIzODU4IDAgLTMuMzk1MDZlLTA3IDIuMjM4NTggLTMuOTc5MDNlLTA3IDEwQy00LjU2MzAxZS0wNyAxNy43NjE0IDIuMjM4NTggMjAgMTAgMjBDMTcuNzYxNCAyMCAyMCAxNy43NjE0IDIwIDEwQzIwIDIuMjM4NTggMTcuNzYxNCAwIDEwIDBaTTE2LjkxOTEgMTYuOTE5MUMxNS40MzA4IDE4LjQwNzUgMTIuNzYxMyAxOCAxMCAxOEM3LjIzODc0IDE4IDQuNTY5MTggMTguNDA3NSAzLjA4MDg5IDE2LjkxOTFDMS41OTI1OSAxNS40MzA4IDIgMTIuNzYxMyAyIDEwQzIgNy4yMzg3NCAxLjU5MjU5IDQuNTY5MTggMy4wODA4OSAzLjA4MDg5QzQuNTY5MTggMS41OTI1OSA3LjIzODc0IDIgMTAgMkMxMi43NjEzIDIgMTUuNDMwOCAxLjU5MjU5IDE2LjkxOTEgMy4wODA4OUMxOC40MDc1IDQuNTY5MTggMTggNy4yMzg3NCAxOCAxMEMxOCAxMi43NjEzIDE4LjQwNzUgMTUuNDMwOCAxNi45MTkxIDE2LjkxOTFaIiBmaWxsPSIjNkI3MjgwIi8+PC9zdmc+';

/**
 * Компонент загрузки аватара пользователя
 * 
 * Отображает модальное окно для загрузки, просмотра и удаления аватара пользователя
 * 
 * @param {boolean} isOpen - Флаг открытия модального окна
 * @param {Function} onClose - Функция закрытия модального окна
 * @param {Function} onUpload - Функция загрузки нового аватара
 * @param {string} currentAvatar - URL текущего аватара
 * @param {Function} onDelete - Функция удаления аватара
 * @param {string} debugInfo - Отладочная информация для отображения
 * @param {Function} logDebugInfo - Функция для логирования отладочной информации
 * @returns {JSX.Element|null} - React-компонент модального окна
 */
const AvatarUploadModal = ({isOpen, onClose, onUpload, currentAvatar, onDelete, debugInfo, logDebugInfo}) => {
    // Состояния для управления загрузкой файла
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    // Сброс состояния при открытии/закрытии модального окна
    useEffect(() => {
        if (!isOpen) {
            setSelectedFile(null);
            setPreviewUrl(null);
            setError(null);
        }
    }, [isOpen, currentAvatar, logDebugInfo]);

    /**
     * Обработчик выбора файла
     * 
     * @param {Event} e - Событие изменения input[type=file]
     */
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            logDebugInfo("Файл не выбран");
            return;
        }
        
        logDebugInfo(`Выбран файл: ${file.name} (${file.type}, ${file.size} байт)`);
        
        // Проверка размера файла (максимум 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Размер файла не должен превышать 5MB');
            setSelectedFile(null);
            setPreviewUrl(null);
            logDebugInfo("Ошибка: файл слишком большой");
            return;
        }
        
        // Проверка типа файла
        if (!isValidImageFile(file)) {
            setError('Поддерживаются только форматы JPEG, PNG, GIF и WEBP');
            setSelectedFile(null);
            setPreviewUrl(null);
            logDebugInfo(`Ошибка: неподдерживаемый тип файла ${file.type}`);
            return;
        }
        
        // Проверим размер файла, если очень маленький, может быть поврежденным
        if (file.size < 100) {
            setError('Файл может быть поврежден. Пожалуйста, выберите другой файл.');
            setSelectedFile(null);
            setPreviewUrl(null);
            logDebugInfo(`Предупреждение: подозрительно маленький размер файла (${file.size} байт)`);
            return;
        }
        
        try {
            logDebugInfo("Начало создания превью...");
            // Сначала создаем превью, чтобы проверить, что файл валидный
            const preview = await createImagePreview(file);
            
            // Проверка, что превью действительно создалось
            if (!preview || preview.length < 100) {
                throw new Error('Не удалось создать превью, файл может быть поврежден');
            }
            
            logDebugInfo("Превью создано успешно, начинаю оптимизацию...");
            setPreviewUrl(preview);
            
            // Оптимизация изображения перед загрузкой
            let optimizedFile;
            
            // Для GIF-файлов пропускаем оптимизацию, чтобы сохранить анимацию
            if (file.type === 'image/gif') {
                logDebugInfo(`GIF файл - пропускаем оптимизацию для сохранения анимации`);
                optimizedFile = file;
            } else {
                optimizedFile = await optimizeImage(file, {
                    maxWidth: 500,
                    maxHeight: 500,
                    quality: 0.8
                });
                
                logDebugInfo(`Изображение оптимизировано: ${file.size} -> ${optimizedFile.size} байт`);
            }
            
            // Установка оптимизированного файла
            setSelectedFile(optimizedFile);
        } catch (err) {
            console.error('Ошибка обработки изображения:', err);
            setError('Ошибка обработки изображения: ' + (err.message || 'Неизвестная ошибка'));
            setSelectedFile(null);
            setPreviewUrl(null);
            logDebugInfo(`Ошибка обработки: ${err.message}`);
        }
    };

    /**
     * Обработчик загрузки файла
     */
    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Выберите файл для загрузки');
            logDebugInfo("Ошибка: файл не выбран");
            return;
        }

        setIsUploading(true);
        setError(null);
        logDebugInfo("Начало загрузки файла на сервер...");
        
        try {
            await onUpload(selectedFile);
            logDebugInfo("Файл успешно загружен");
            onClose();
        } catch (error) {
            console.error('Ошибка загрузки аватара:', error);
            setError(error.response?.data?.message || 'Не удалось загрузить аватар');
            logDebugInfo(`Ошибка загрузки: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    /**
     * Обработчик удаления аватара
     */
    const handleDelete = async () => {
        if (!currentAvatar) {
            setError('Нет аватара для удаления');
            return;
        }
        
        setIsUploading(true);
        setError(null);
        
        try {
            await onDelete();
            onClose();
        } catch (error) {
            console.error('Ошибка удаления аватара:', error);
            setError(error.response?.data?.message || 'Не удалось удалить аватар');
        } finally {
            setIsUploading(false);
        }
    };

    /**
     * Функция вызова диалога выбора файла
     */
    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    // Не рендерим ничего, если модальное окно закрыто
    if (!isOpen) return null;

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{y: -50, opacity: 0}}
                animate={{y: 0, opacity: 1}}
                exit={{y: 50, opacity: 0}}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
            >
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-6">Загрузка аватара</h2>

                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 flex items-start">
                            <CircleAlert className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"/>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <div className="flex flex-col items-center mb-6">
                        <div className="mb-4 relative">
                            <div
                                className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-gray-300"
                            >
                                {isUploading ? (
                                    <motion.div
                                        animate={{rotate: 360}}
                                        transition={{repeat: Infinity, duration: 1, ease: "linear"}}
                                        className="w-12 h-12 flex items-center justify-center"
                                    >
                                        <Camera className="w-8 h-8 text-gray-500"/>
                                    </motion.div>
                                ) : previewUrl ? (
                                    <div className="w-full h-full">
                                        <img
                                            src={previewUrl}
                                            alt="Предпросмотр аватара"
                                            className="w-full h-full object-cover"
                                            onLoad={() => console.log("Превью успешно загружено")}
                                            onError={(e) => {
                                                console.error("Ошибка загрузки превью");
                                                setPreviewUrl(null);
                                            }}
                                        />
                                    </div>
                                ) : currentAvatar ? (
                                    <div className="w-full h-full">
                                        <img 
                                            src={currentAvatar && currentAvatar.startsWith('/') 
                                                ? `${API_URL}${currentAvatar}`.replace(/\/\//g, '/') 
                                                : currentAvatar}
                                            alt="Текущий аватар"
                                            className="w-full h-full object-cover avatar-image"
                                            onLoad={() => console.log(`Текущий аватар успешно загружен напрямую`)}
                                            onError={(e) => {
                                                console.error(`Ошибка загрузки аватара напрямую: ${currentAvatar}`);
                                                e.target.onerror = null;
                                                e.target.src = fallbackSrc;
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <UserCircle className="w-24 h-24 text-gray-400"/>
                                )}
                            </div>
                            <motion.button
                                whileHover={{scale: 1.1}}
                                whileTap={{scale: 0.9}}
                                onClick={triggerFileInput}
                                className="absolute bottom-0 right-0 bg-gray-700 text-white p-2 rounded-full shadow-lg"
                                disabled={isUploading}
                            >
                                <Camera className="w-5 h-5"/>
                            </motion.button>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept={getImageAcceptString()}
                            className="hidden"
                            disabled={isUploading}
                        />

                        <div className="text-sm text-gray-500 text-center mb-4">
                            Рекомендуемый размер: 500x500 пикселей <br/>
                            Поддерживаемые форматы: JPEG, PNG, GIF, WEBP <br/>
                            Максимальный размер: 5MB
                        </div>


                        <div className="flex space-x-3">
                            <motion.button
                                whileHover={{scale: 1.05}}
                                whileTap={{scale: 0.95}}
                                onClick={triggerFileInput}
                                className="px-4 py-2 bg-gray-600 text-white rounded flex items-center space-x-2"
                                disabled={isUploading}
                            >
                                <Upload className="w-4 h-4"/>
                                <span>Выбрать файл</span>
                            </motion.button>

                            {currentAvatar && (
                                <motion.button
                                    whileHover={{scale: 1.05}}
                                    whileTap={{scale: 0.95}}
                                    onClick={() => {
                                        logDebugInfo("Запрос на удаление аватара");
                                        handleDelete();
                                    }}
                                    className="px-4 py-2 bg-red-600 text-white rounded flex items-center space-x-2"
                                    disabled={isUploading}
                                >
                                    <ImageOff className="w-4 h-4"/>
                                    <span>Удалить</span>
                                </motion.button>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 border-t pt-4">
                        <motion.button
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
                            disabled={isUploading}
                        >
                            Отмена
                        </motion.button>
                        <motion.button
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            onClick={handleUpload}
                            disabled={!selectedFile || isUploading}
                            className={`
                                px-4 py-2 bg-gray-700 text-white hover:bg-gray-600 rounded flex items-center space-x-2
                                ${(!selectedFile || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            {isUploading ? (
                                <>
                                    <motion.div
                                        animate={{rotate: 360}}
                                        transition={{repeat: Infinity, duration: 1, ease: "linear"}}
                                        className="w-4 h-4"
                                    >
                                        ◌
                                    </motion.div>
                                    <span>Загрузка...</span>
                                </>
                            ) : (
                                <>
                                    <CircleCheck className="w-4 h-4"/>
                                    <span>Сохранить</span>
                                </>
                            )}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
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
        className="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-6 flex flex-col items-center justify-center text-center"
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
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [debugInfo, setDebugInfo] = useState(null);
    // Новое состояние для хранения прямого URL аватара
    const [directAvatarUrl, setDirectAvatarUrl] = useState(
        user.avatar ? `${API_URL}${user.avatar}`.replace(/\/\//g, '/') : null
    );

    // Отладочная функция, доступная на уровне всего компонента
    const logDebugInfo = (info) => {
        console.log(`[Debug] ${info}`);
        setDebugInfo(prevInfo => {
            const newInfo = prevInfo ? `${prevInfo}\n${info}` : info;
            // Ограничиваем длину лога
            return newInfo.split('\n').slice(-10).join('\n');
        });
    };

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

                    // Обновляем прямой URL аватара
                    if (profileData.avatar) {
                        updateDirectAvatarUrl(profileData.avatar);
                    }
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
     * Обработчик загрузки аватара
     * 
     * @param {File} file - Файл аватара для загрузки
     * @returns {Promise<void>}
     */
    const handleAvatarUpload = async (file) => {
        setAvatarLoading(true);
        logDebugInfo(`Начало загрузки файла на сервер...`);
        
        try {
            if (!file) {
                throw new Error('Файл не выбран');
            }
            
            // Проверка типа файла
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                throw new Error('Неподдерживаемый формат файла. Разрешены только JPEG, PNG, GIF и WEBP');
            }
            
            // Проверка размера файла (не более 5 МБ)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('Размер файла превышает 5 МБ');
            }
            
            // Создание FormData для загрузки файла
            const formData = new FormData();
            
            // Для GIF-файлов пропускаем оптимизацию, чтобы сохранить анимацию
            if (file.type === 'image/gif') {
                logDebugInfo('GIF файл - пропускаем оптимизацию для сохранения анимации');
                formData.append('avatar', file);
            } else {
                formData.append('avatar', file);
            }
            
            // Получение токена
            const token = localStorage.getItem('token') || sessionStorage.getItem('token') || user.token;
            
            if (!token) {
                throw new Error('Токен авторизации не найден');
            }
            
            // Отладочная информация
            logDebugInfo(`Заголовки запроса: Content-Type=multipart/form-data, Authorization=Bearer ${token.substr(0, 10)}...`);
            
            // Исправленный эндпоинт для загрузки аватара
            const response = await api.post('/api/profile/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            logDebugInfo(`Ответ сервера: ${JSON.stringify(response.data)}`);
            
            // Обновление пользователя с новым аватаром
            if (response.data && (response.data.avatarUrl || response.data.avatar || response.data.user?.avatar)) {
                const newAvatarUrl = response.data.avatarUrl || response.data.avatar || response.data.user?.avatar;
                
                if (!newAvatarUrl) {
                    throw new Error('Сервер не вернул URL аватара');
                }
                
                // Обновляем пользователя
                setUser(prevUser => {
                    const updatedUser = {
                        ...prevUser,
                        avatar: newAvatarUrl
                    };
                    
                    // Обновляем глобальное состояние через AuthContext
                    if (updateAuthUser) {
                        updateAuthUser(updatedUser);
                    }
                    
                    // Диспатчим событие для обновления UI в других компонентах
                    const avatarEvent = new CustomEvent('avatar-updated', { 
                        detail: { 
                            userId: user.id,
                            avatarUrl: newAvatarUrl
                        } 
                    });
                    document.dispatchEvent(avatarEvent);
                    
                    return updatedUser;
                });
                
                // Обновляем прямой URL аватара
                updateDirectAvatarUrl(newAvatarUrl);
                
                setNotification({
                    type: 'success',
                    message: 'Аватар успешно загружен'
                });
                
                logDebugInfo(`Файл успешно загружен`);
            } else if (response.data && response.data.success) {
                // Если сервер вернул success, но не вернул URL, пробуем использовать имеющийся URL
                logDebugInfo(`Сервер вернул успех, но не вернул URL аватара, пробуем использовать старый URL`);
                
                // Перезагружаем профиль, чтобы получить актуальные данные
                try {
                    const profileResponse = await api.get('/profile');
                    
                    if (profileResponse.data && profileResponse.data.user && profileResponse.data.user.avatar) {
                        const newAvatarUrl = profileResponse.data.user.avatar;
                        
                        // Обновляем пользователя
                        setUser(prevUser => ({
                            ...prevUser,
                            avatar: newAvatarUrl
                        }));
                        
                        // Обновляем глобальное состояние
                        if (updateAuthUser) {
                            updateAuthUser({...user, avatar: newAvatarUrl});
                        }
                        
                        // Обновляем прямой URL аватара
                        updateDirectAvatarUrl(newAvatarUrl);
                        
                        setNotification({
                            type: 'success',
                            message: 'Аватар успешно загружен'
                        });
                    } else {
                        throw new Error('Не удалось получить новый URL аватара');
                    }
                } catch (profileError) {
                    console.error('Ошибка получения профиля после загрузки аватара:', profileError);
                    throw new Error('Не удалось обновить аватар');
                }
            } else {
                throw new Error('Неожиданный формат ответа сервера');
            }
            
            setShowAvatarModal(false);
        } catch (error) {
            console.error('Ошибка загрузки аватара:', error);
            
            setNotification({
                type: 'error',
                message: 'Не удалось загрузить аватар: ' + (error.message || 'неизвестная ошибка')
            });
        } finally {
            setAvatarLoading(false);
        }
    };

    /**
     * Обработчик удаления аватара
     */
    const handleAvatarDelete = async () => {
        try {
            setAvatarLoading(true);
            logDebugInfo(`Запрос на удаление аватара`);

            // Получение токена
            const token = localStorage.getItem('token') || sessionStorage.getItem('token') || user.token;
            
            if (!token) {
                throw new Error('Токен авторизации не найден');
            }

            // Отправка запроса на удаление аватара
            // Исправленный эндпоинт для удаления аватара
            await api.delete('/api/profile/avatar');

            // Обновление пользователя без аватара
            setUser(prevUser => {
                const updatedUser = {
                    ...prevUser,
                    avatar: null
                };
                
                // Обновляем глобальное состояние через AuthContext
                if (updateAuthUser) {
                    updateAuthUser(updatedUser);
                }
                
                // Диспатчим событие для обновления UI в других компонентах
                const avatarEvent = new CustomEvent('avatar-updated', { 
                    detail: { 
                        userId: user.id,
                        avatarUrl: null
                    } 
                });
                document.dispatchEvent(avatarEvent);
                
                return updatedUser;
            });

            // Обновляем прямой URL аватара
            updateDirectAvatarUrl(null);
            
            setNotification({
                type: 'success',
                message: 'Аватар успешно удален'
            });
            
            setShowAvatarModal(false);
        } catch (error) {
            console.error('Ошибка удаления аватара:', error);
            
            setNotification({
                type: 'error',
                message: 'Не удалось удалить аватар'
            });
        } finally {
            setAvatarLoading(false);
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
                // Обновляем аватар только если он пришел в ответе
                avatar: response.data.avatar || response.data.avatarUrl || response.data.user?.avatar || user.avatar
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
            // Валидация формы перед отправкой
            if (!validateForm()) {
                return;
            }

            // Подготовка данных для обновления
            const updateData = {
                id: user.id,
                name: editedUser.name,
                email: editedUser.email,
                currentPassword: editedUser.currentPassword,
                newPassword: editedUser.newPassword
            };

            // Отправка запроса на обновление профиля
            const response = await api.put('/profile', updateData);

            // Обновление данных пользователя
            setUser({
                ...user,
                name: response.data.user.name,
                email: response.data.user.email,
                avatar: response.data.avatarUrl
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
            const date = new Date(dateString);
            
            // Проверка, что date является валидной датой
            if (isNaN(date.getTime())) {
                return 'Некорректная дата';
            }
            
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Ошибка форматирования даты:', error);
            return 'Некорректная дата';
        }
    };

    /**
     * Обновляет прямой URL аватара пользователя
     * 
     * @param {string|null} avatarPath - Путь к файлу аватара или null
     */
    const updateDirectAvatarUrl = (avatarPath) => {
        if (!avatarPath) {
            // Если аватар не установлен или удален
            setDirectAvatarUrl(null);
            return;
        }
        
        // Добавляем временную метку для обхода кэша браузера
        const cacheParam = `?t=${new Date().getTime()}`;
        
        // Создаем полный URL на основе пути к аватару
        let fullUrl;
        
        if (avatarPath.startsWith('http')) {
            // Если URL уже полный
            if (avatarPath.includes('?')) {
                fullUrl = `${avatarPath}&_=${new Date().getTime()}`;
            } else {
                fullUrl = `${avatarPath}${cacheParam}`;
            }
        } else if (avatarPath.startsWith('/uploads')) {
            // Для путей, начинающихся с /uploads
            fullUrl = `${API_URL}${avatarPath}${cacheParam}`;
        } else if (!avatarPath.startsWith('/')) {
            // Для путей без начального слеша
            fullUrl = `${API_URL}/${avatarPath}${cacheParam}`;
        } else {
            // В остальных случаях
            fullUrl = `${API_URL}${avatarPath}${cacheParam}`;
        }
        
        // Обновляем состояние
        setDirectAvatarUrl(fullUrl);
        
        // Предзагрузка аватара для кэширования
        try {
            logDebugInfo('Предзагрузка аватара...');
            const img = new Image();
            img.onload = () => {
                logDebugInfo('Аватар успешно загружен и кэширован');
            };
            img.src = fullUrl;
        } catch (error) {
            console.error('Ошибка предзагрузки аватара:', error);
        }
    };

    return (
        <div className="space-y-6 w-full px-4">
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

            {/* Отладочная информация, если включена */}
            

            {/* Модальное окно загрузки аватара */}
            <AnimatePresence>
                {showAvatarModal && (
                    <AvatarUploadModal
                        isOpen={showAvatarModal}
                        onClose={() => setShowAvatarModal(false)}
                        onUpload={handleAvatarUpload}
                        currentAvatar={directAvatarUrl}
                        onDelete={handleAvatarDelete}
                        debugInfo={debugInfo}
                        logDebugInfo={logDebugInfo}
                    />
                )}
            </AnimatePresence>

            {/* User Profile Card */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
                className="w-full"
            >
                <Card>
                    <CardHeader className="p-6">
                        <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center text-xl">
                                <UserCircle className="w-7 h-7 mr-3 text-gray-600 dark:text-gray-300"/>
                                Профиль пользователя
                            </CardTitle>
                            <div className="flex space-x-3">
                                <motion.button
                                    onClick={() => {
                                        setIsEditing(!isEditing);
                                        setEditedUser(user);
                                    }}
                                    whileHover={{scale: 1.05}}
                                    whileTap={{scale: 0.95}}
                                    className={`
                                        px-4 py-2 rounded 
                                        flex items-center 
                                        space-x-2 
                                        transition-all duration-300 
                                        ${isEditing
                                        ? 'bg-gray-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                    aria-label={isEditing ? "Отменить редактирование" : "Редактировать профиль"}
                                >
                                    {isEditing ? (
                                        <>
                                            <X className="w-5 h-5 mr-1"/>
                                            <span>Отмена</span>
                                        </>
                                    ) : (
                                        <>
                                            <Edit2 className="w-5 h-5 mr-1"/>
                                            <span>Редактировать</span>
                                        </>
                                    )}
                                </motion.button>

                                {user.role === 'admin' && (
                                    <motion.button
                                        onClick={toggleAdminPanel}
                                        whileHover={{scale: 1.05}}
                                        whileTap={{scale: 0.95}}
                                        className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors flex items-center"
                                        aria-label={showAdminPanel ? "Скрыть панель администратора" : "Показать панель администратора"}
                                    >
                                        {showAdminPanel ? 'Скрыть панель' : 'Панель администратора'}
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6">
                        <AnimatePresence mode="wait">
                            {isEditing ? (
                                <motion.form
                                    key="editForm"
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    exit={{opacity: 0}}
                                    onSubmit={handleSubmit}
                                    className="space-y-4"
                                >
                                    {/* Поле ввода имени */}
                                    <div>
                                        <label 
                                            htmlFor="name" 
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Имя
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            value={editedUser.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            required
                                            minLength={VALIDATION_RULES.MIN_NAME_LENGTH}
                                            maxLength={VALIDATION_RULES.MAX_NAME_LENGTH}
                                        />
                                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                    </div>

                                    {/* Поле ввода email */}
                                    <div>
                                        <label 
                                            htmlFor="email" 
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={editedUser.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            required
                                            pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                                        />
                                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                    </div>

                                    {/* Поле ввода текущего пароля */}
                                    <div>
                                        <label 
                                            htmlFor="currentPassword" 
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Текущий пароль
                                        </label>
                                        <input
                                            id="currentPassword"
                                            type="password"
                                            onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        />
                                        {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>}
                                    </div>

                                    {/* Поле ввода нового пароля */}
                                    <div>
                                        <label 
                                            htmlFor="newPassword" 
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Новый пароль (необязательно)
                                        </label>
                                        <input
                                            id="newPassword"
                                            type="password"
                                            onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            minLength={VALIDATION_RULES.MIN_PASSWORD_LENGTH}
                                        />
                                        {errors.password &&
                                            <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                                    </div>

                                    {/* Ошибки отправки формы */}
                                    {errors.submit && (
                                        <div
                                            className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                                            role="alert"
                                        >
                                            {errors.submit}
                                        </div>
                                    )}

                                    {/* Кнопка отправки формы */}
                                    <div className="flex justify-end">
                                        <motion.button
                                            type="submit"
                                            whileHover={{scale: 1.05}}
                                            whileTap={{scale: 0.95}}
                                            className="
                                                px-5 py-2.5
                                                bg-gray-600 text-white
                                                rounded-lg
                                                text-sm font-medium
                                                flex items-center
                                                shadow-md hover:shadow-lg
                                                transition-all duration-300
                                            "
                                        >
                                            <Save className="w-4 h-4 mr-2"/>
                                            Сохранить изменения
                                        </motion.button>
                                    </div>
                                </motion.form>
                            ) : (
                                <motion.div
                                    key="profileView"
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    exit={{opacity: 0}}
                                    className="space-y-6"
                                >
                                    {/* Основная информация профиля */}
                                    <div className="flex items-center mb-6">
                                        <div className="avatar-container mr-6 relative">
                                            <div className="w-24 h-24 rounded-full overflow-hidden">
                                                {user.avatar ? (
                                                    <img 
                                                        src={getAvatarUrl(user.avatar)} 
                                                        alt="Аватар" 
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            console.error('Ошибка загрузки миниатюры аватара');
                                                            e.target.src = fallbackSrc;
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                                        <UserCircle2 size={60} className="text-gray-400 dark:text-gray-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <motion.button
                                                whileHover={{scale: 1.1}}
                                                whileTap={{scale: 0.9}}
                                                onClick={() => setShowAvatarModal(true)}
                                                className="absolute bottom-0 right-0 bg-gray-700 text-white p-2 rounded-full shadow-lg"
                                                title="Изменить аватар"
                                            >
                                                <Camera className="w-5 h-5"/>
                                            </motion.button>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">{user.name}</h3>
                                            <p className="text-lg text-gray-600 dark:text-gray-400">{user.email}</p>
                                            {user.role === 'admin' && (
                                                <span
                                                    className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded mt-2 inline-block dark:bg-gray-700 dark:text-gray-300"
                                                >
                                                    Администратор
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Статистика пользователя */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mt-6">
                                        <motion.div
                                            whileHover={{scale: 1.05}}
                                            className="p-6 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm"
                                        >
                                            <div className="text-3xl font-bold dark:text-white">{user.totalReviews || 0}</div>
                                            <div className="text-base text-gray-600 dark:text-gray-300 mt-1">Отзывов</div>
                                        </motion.div>

                                        <motion.div
                                            whileHover={{scale: 1.05}}
                                            className="p-6 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm"
                                        >
                                            <div className="text-3xl font-bold dark:text-white">{user.averageRating || 0}</div>
                                            <div className="text-base text-gray-600 dark:text-gray-300 mt-1">Средняя оценка</div>
                                        </motion.div>

                                        <motion.div
                                            whileHover={{scale: 1.05}}
                                            className="p-6 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm"
                                        >
                                            <div className="text-3xl font-bold dark:text-white">{user.totalLikes || 0}</div>
                                            <div className="text-base text-gray-600 dark:text-gray-300 mt-1">Лайков получено</div>
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
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5, delay: 0.2}}
                className="w-full"
            >
                <Card>
                    <CardHeader className="p-6">
                        <CardTitle className="flex items-center text-xl">
                            <Coffee className="w-7 h-7 mr-3 text-gray-600 dark:text-gray-300"/>
                            <span className="text-gray-800 dark:text-gray-200">Мои отзывы</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {isLoading ? (
                            <div className="flex justify-center items-center p-12">
                                <motion.div
                                    animate={{rotate: 360}}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1,
                                        ease: "linear"
                                    }}
                                    aria-label="Загрузка отзывов"
                                >
                                    <Coffee className="w-10 h-10 text-gray-400 dark:text-gray-300"/>
                                </motion.div>
                            </div>
                        ) : userReviews.length > 0 ? (
                            <div className="space-y-6">
                                {userReviews.map(review => (
                                    <motion.div
                                        key={review.id}
                                        initial={{opacity: 0, y: 10}}
                                        animate={{opacity: 1, y: 0}}
                                        exit={{opacity: 0, y: -10}}
                                        whileHover={{scale: 1.01}}
                                        className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600 relative transition-colors duration-300"
                                    >
                                        <div className="absolute top-4 right-4 flex space-x-2">
                                            <motion.button
                                                onClick={() => handleDeleteReview(review.id)}
                                                whileHover={{scale: 1.1}}
                                                whileTap={{scale: 0.9}}
                                                disabled={deleteReviewId === review.id}
                                                className={`text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ${deleteReviewId === review.id ? 'opacity-50' : ''}`}
                                                title="Удалить отзыв"
                                                aria-label="Удалить отзыв"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </motion.button>
                                        </div>

                                        <div className="flex items-center mb-4">
                                            <h4 className="font-medium text-gray-800 dark:text-gray-200 text-xl">{review.restaurantName}</h4>
                                            <div className="ml-auto flex items-center">
                                                {Array.from({length: 5}).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-5 h-5 ${i < Math.round(Number(review.rating))
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-gray-300 dark:text-gray-600'}`}
                                                        aria-hidden="true"
                                                    />
                                                ))}
                                                <span className="ml-2 text-base font-medium text-gray-700 dark:text-gray-300">
                                                    {Number(review.rating).toFixed(1)}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="mb-5 text-gray-600 dark:text-gray-300 text-base leading-relaxed">{review.comment}</p>

                                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-600 transition-colors duration-300">
                                            <span className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                {review.date ? formatDate(review.date) : 'Дата не указана'}
                                            </span>
                                            <span className="flex items-center">
                                                <ThumbsUp className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                                                {Number(review.likes) || 0}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <NoReviews/>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export {ProfilePage};