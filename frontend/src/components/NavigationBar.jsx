import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Moon, Sun, Bell, UserCircle2, Search, LogOut, LogIn, Menu, X, Clock, Utensils, ShieldCheck, Star, LayoutDashboard, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';
import api from '../utils/api';
import notificationService from '../services/notificationService';
import { useNotification } from './NotificationContext';

/**
 * Получает полный URL аватара пользователя
 * 
 * @param {string} avatarPath - Путь к файлу аватара
 * @returns {string|null} - Полный URL или null при отсутствии аватара
 */
const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    
    // Добавляем временную метку для обхода кэша браузера
    const cacheParam = `?t=${new Date().getTime()}`;
    
    // If the avatar path is already a full URL, return it
    if (avatarPath.startsWith('http')) {
        // Если URL уже содержит параметры запроса, добавляем к ним временную метку
        if (avatarPath.includes('?')) {
            return `${avatarPath}&_=${new Date().getTime()}`;
        }
        // Иначе добавляем параметр с новой временной меткой
        return `${avatarPath}${cacheParam}`;
    }
    
    // For paths starting with /uploads, add the server base URL
    if (avatarPath.startsWith('/uploads')) {
        return `${API_URL}${avatarPath}${cacheParam}`;
    }
    
    // For paths without leading slash
    if (!avatarPath.startsWith('/')) {
        return `${API_URL}/${avatarPath}${cacheParam}`;
    }
    
    // Otherwise, prepend the server base URL
    return `${API_URL}${avatarPath}${cacheParam}`;
};

// Анимация для логотипа
const logoVariants = {
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

// Анимация для выпадающих меню
const dropdownVariants = {
    hidden: { 
        opacity: 0, 
        y: -10,
        scale: 0.95 
    },
    visible: { 
        opacity: 1, 
        y: 0,
        scale: 1,
        transition: { 
            type: "spring", 
            stiffness: 400,
            damping: 20
        }
    },
    exit: { 
        opacity: 0, 
        y: -10,
        scale: 0.95,
        transition: { 
            duration: 0.2 
        }
    }
};

// Анимация для элементов в меню
const menuItemVariants = {
    hover: {
        x: 5,
        transition: { 
            duration: 0.2 
        }
    },
    tap: {
        scale: 0.98,
        transition: { 
            duration: 0.1 
        }
    }
};

/**
 * Компонент навигационной панели с адаптивным дизайном и анимациями
 */
const NavigationBar = ({ user, onLogout, onLogin, onThemeToggle, onProfileClick, onProfileUpdate }) => {
    // Состояния компонента
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [hasScrolled, setHasScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
    
    const navigate = useNavigate();
    const notifyContext = useNotification();

    // Ссылки на DOM-элементы для обработки кликов вне компонентов
    const notificationsRef = useRef(null);
    const profileMenuRef = useRef(null);
    const searchInputRef = useRef(null);
    const mobileMenuRef = useRef(null);

    // Функция для загрузки уведомлений
    const fetchNotifications = useCallback(async () => {
        if (!user || !user.token) return;
        
        setIsLoadingNotifications(true);
        try {
            const response = await api.get('/notifications');
            
            if (response.status === 200) {
                setNotifications(response.data.notifications || []);
                setUnreadCount(response.data.unreadCount || 0);
                
                // If notifications dropdown is open, mark all as read
                if (showNotifications) {
                    const unreadNotifications = response.data.notifications.filter(n => !n.is_read);
                    for (const notification of unreadNotifications) {
                        await notificationService.markNotificationAsRead(notification.id);
                    }
                    setUnreadCount(0);
                }
            }
        } catch (error) {
            console.error('Ошибка при загрузке уведомлений:', error);
        } finally {
            setIsLoadingNotifications(false);
        }
    }, [user, showNotifications]);

    // Загружаем уведомления при изменении пользователя
    useEffect(() => {
        if (user && user.token) {
            fetchNotifications();
            
            // Настраиваем интервал для периодического обновления
            const intervalId = setInterval(fetchNotifications, 30000); // каждые 30 секунд
            
            return () => clearInterval(intervalId);
        }
    }, [fetchNotifications, user]);

    // Обработчик для отметки уведомления как прочитанного
    const markAsRead = async (notificationId) => {
        if (!user || !user.token) return;
        
        try {
            await notificationService.markNotificationAsRead(notificationId);
            
            // Обновляем локальное состояние
            setNotifications(prev => 
                prev.map(notification => 
                    notification.id === notificationId 
                        ? { ...notification, is_read: true } 
                        : notification
                )
            );
            
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Ошибка при отметке уведомления:', error);
        }
    };

    // Обработчик для удаления уведомления
    const deleteNotification = async (notificationId) => {
        if (!user || !user.token) return;
        
        try {
            // Вызываем API для удаления уведомления из базы данных
            const response = await notificationService.deleteNotification(notificationId);
            
            // Только если удаление в БД прошло успешно, обновляем UI
            if (response && response.message) {
                // Обновляем локальное состояние
                setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
                
                // Обновляем счетчик непрочитанных, если удалено непрочитанное уведомление
                const deletedNotification = notifications.find(n => n.id === notificationId);
                if (deletedNotification && !deletedNotification.is_read) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
                
                // Показываем уведомление об успешном удалении
                if (notifyContext) {
                    notifyContext.notifySuccess('Уведомление успешно удалено');
                }
            }
        } catch (error) {
            console.error('Ошибка при удалении уведомления:', error);
            // Показываем уведомление об ошибке
            if (notifyContext) {
                notifyContext.notifyError('Не удалось удалить уведомление');
            }
        }
    };

    // Переключение темы
    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        onThemeToggle(!isDarkMode);
    };

    // Обработчик выхода из системы
    const handleLogout = () => {
        // Удаляем токен из localStorage и sessionStorage
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        
        // Диспатчим пользовательское событие для обновления статуса авторизации
        const authEvent = new CustomEvent('auth-changed', { 
            detail: { 
                isAuthenticated: false
            } 
        });
        document.dispatchEvent(authEvent);
        
        // Вызываем оригинальный обработчик
        onLogout();
    };

    // Обработка кликов вне элементов
    const handleClickOutside = (event) => {
        if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
            setShowNotifications(false);
        }

        if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
            setShowProfileMenu(false);
        }
        
        if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && 
            !event.target.closest('[data-mobile-menu-toggle]')) {
            setMobileMenuOpen(false);
        }
    };

    // Установка слушателей событий
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [searchQuery]);

    // Эффект прокрутки для добавления тени
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            if (scrollPosition > 10) {
                setHasScrolled(true);
            } else {
                setHasScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Обработка изменения размера экрана
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Получаем уведомления из загруженных данных
    const displayedNotifications = notifications.length > 0 
        ? notifications 
        : [];

    // Проверка авторизации пользователя
    const isLoggedIn = !!user;

    // Обработчик для поиска
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
            setMobileMenuOpen(false);
        }
    };

    // Переключение мобильного меню
    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
        setShowNotifications(false);
        setShowProfileMenu(false);
    };

    // Обработка событий обновления аватара
    useEffect(() => {
        const handleAvatarUpdate = (event) => {
            if (user && event.detail.userId === user.id) {
                // Обновляем аватар пользователя локально
                const updatedUser = { ...user, avatar: event.detail.avatarUrl };
                
                // Когда обновляется аватар из другого компонента
                if (onProfileUpdate) {
                    onProfileUpdate(updatedUser);
                }
            }
        };

        // Подписываемся на событие обновления аватара
        document.addEventListener('avatar-updated', handleAvatarUpdate);
        
        return () => {
            document.removeEventListener('avatar-updated', handleAvatarUpdate);
        };
    }, [user, onProfileUpdate]);

    return (
        <motion.nav 
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
            ${hasScrolled ? 'bg-white dark:bg-gray-900 shadow-md' : 'bg-white dark:bg-gray-900'}
            `}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 20 
            }}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Логотип и название */}
                    <div className="flex items-center">
                        <motion.div 
                            variants={logoVariants}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <Link to="/" className="flex items-center">
                                <Utensils size={24} className="text-blue-500 dark:text-blue-400 mr-2" />
                                <span className="text-gray-900 dark:text-white font-bold text-xl">FeedbackDelivery</span>
                            </Link>
                        </motion.div>
                    </div>
                    
                    {/* Правая часть навбара */}
                    <div className="flex items-center space-x-3">
                        
                        {/* Кнопка рейтингов ресторанов */}
                        <motion.div
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <Link 
                                to="/restaurant-ratings" 
                                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-full flex items-center"
                                aria-label="Рейтинги ресторанов"
                            >
                                <Star size={20} className="text-yellow-500" />
                            </Link>
                        </motion.div>

                    
                        
                        {/* Уведомления */}
                        {user && (
                            <div className="relative" ref={notificationsRef}>
                                <motion.button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-full relative"
                                    aria-label="Уведомления"
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    <Bell size={20} />
                                    {unreadCount > 0 && (
                                        <motion.span 
                                            className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-xs font-bold text-white"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 500,
                                                damping: 15
                                            }}
                                        >
                                            {unreadCount}
                                        </motion.span>
                                    )}
                                </motion.button>
                                
                                {/* Dropdown меню уведомлений */}
                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div
                                            variants={dropdownVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200 dark:border-gray-700"
                                        >
                                            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Уведомления</h3>
                                            </div>
                                            
                                            <div className="max-h-64 overflow-y-auto scrollbar-hide">
                                                {isLoadingNotifications ? (
                                                    <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                                                        <motion.div 
                                                            animate={{ rotate: 360 }}
                                                            transition={{ 
                                                                duration: 1,
                                                                repeat: Infinity,
                                                                ease: "linear"
                                                            }}
                                                            className="inline-block w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-400 rounded-full"
                                                        />
                                                        <span className="ml-2">Загрузка...</span>
                                                    </div>
                                                ) : displayedNotifications.length > 0 ? (
                                                    displayedNotifications.map((notification, index) => (
                                                        <motion.div 
                                                            key={notification.id} 
                                                            className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 ${!notification.is_read ? 'bg-gray-100 dark:bg-gray-700/50' : ''}`}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ 
                                                                delay: index * 0.05,
                                                                duration: 0.2
                                                            }}
                                                            variants={menuItemVariants}
                                                            whileHover="hover"
                                                            whileTap="tap"
                                                        >
                                                            <div className="flex justify-between">
                                                                <div className="flex-1" onClick={() => markAsRead(notification.id)}>
                                                                    <p className="text-sm text-gray-700 dark:text-gray-300">{notification.message}</p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                                        {notification.time || (notification.createdAt && new Date(notification.createdAt).toLocaleString())}
                                                                    </p>
                                                                </div>
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        deleteNotification(notification.id);
                                                                    }}
                                                                    className="ml-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                    aria-label="Удалить уведомление"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    ))
                                                ) : (
                                                    <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                                                        Нет новых уведомлений
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                        
                        {/* Переключатель темы */}
                        <motion.button 
                            onClick={toggleTheme}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-full"
                            aria-label={isDarkMode ? 'Включить светлую тему' : 'Включить темную тему'}
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <motion.div
                                initial={false}
                                animate={{ rotate: isDarkMode ? 180 : 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </motion.div>
                        </motion.button>
                        
                        {/* Профиль пользователя */}
                        {user ? (
                            <div className="relative" ref={profileMenuRef}>
                                <motion.button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"
                                    aria-label="Профиль пользователя"
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    <UserCircle2 size={24} className="text-gray-600 dark:text-gray-300" />
                                </motion.button>
                                
                                {/* Dropdown меню профиля */}
                                <AnimatePresence>
                                    {showProfileMenu && (
                                        <motion.div
                                            variants={dropdownVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200 dark:border-gray-700"
                                        >
                                            {/* Информация о пользователе */}
                                            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mr-3 flex items-center justify-center">
                                                        <UserCircle2 size={24} className="text-gray-600 dark:text-gray-300" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-sm text-gray-900 dark:text-white">
                                                            {user.name || 'Пользователь'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center">
                                                            {user.role && (
                                                                <span className={`
                                                                    px-1.5 py-0.5 rounded-full text-xs font-medium
                                                                    ${user.role === 'admin' 
                                                                        ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300' 
                                                                        : user.role === 'moderator' || user.role === 'модератор'
                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                                        : user.role === 'head_admin' || user.role === 'глав_админ' || user.role === 'head_admin'
                                                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                                                        : user.role === 'manager' || user.role === 'менеджер'
                                                                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                                    }
                                                                `}>
                                                                    {user.role === 'admin' 
                                                                        ? 'Администратор' 
                                                                        : user.role === 'moderator' || user.role === 'модератор'
                                                                        ? 'Модератор'
                                                                        : user.role === 'head_admin' || user.role === 'глав_админ' || user.role === 'head_admin'
                                                                        ? 'Главный админ'
                                                                        : user.role === 'manager' || user.role === 'менеджер'
                                                                        ? 'Менеджер'
                                                                        : user.role}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="py-1">
                                                <motion.button 
                                                    onClick={() => {
                                                        setShowProfileMenu(false);
                                                        onProfileClick();
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                                    variants={menuItemVariants}
                                                    whileHover="hover"
                                                    whileTap="tap"
                                                >
                                                    <UserCircle2 size={16} className="mr-2" />
                                                    Мой профиль
                                                </motion.button>
                                                
                                                {/* Manager Dashboard Link */}
                                                {(user.role === 'manager' || user.role === 'менеджер') && (
                                                    <motion.div
                                                        variants={menuItemVariants}
                                                        whileHover="hover"
                                                        whileTap="tap"
                                                    >
                                                        <button 
                                                            onClick={() => {
                                                                navigate('/manager');
                                                                setShowProfileMenu(false);
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                                        >
                                                            <LayoutDashboard size={16} className="mr-2 text-blue-500" />
                                                            Панель менеджера
                                                        </button>
                                                    </motion.div>
                                                )}
                                                
                                                {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'moderator' || 
                                                user.role === 'глав_админ' || user.role === 'head_admin' || 
                                                user.role === 'manager' || user.role === 'менеджер') && (
                                                    <motion.div
                                                        variants={menuItemVariants}
                                                        whileHover="hover"
                                                        whileTap="tap"
                                                    >
                                                        <button 
                                                            onClick={() => {
                                                                navigate('/admin');
                                                                setShowProfileMenu(false);
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                                        >
                                                            <ShieldCheck size={16} className="mr-2 text-gray-700 dark:text-gray-400" />
                                                            Админ панель
                                                        </button>
                                                    </motion.div>
                                                )}
                                                
                                                <motion.button 
                                                    onClick={() => {
                                                        setShowProfileMenu(false);
                                                        handleLogout();
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                                    variants={menuItemVariants}
                                                    whileHover="hover"
                                                    whileTap="tap"
                                                >
                                                    <LogOut size={16} className="mr-2" />
                                                    Выйти
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : null}
                        
                        {/* Мобильное меню */}
                        <motion.button
                            data-mobile-menu-toggle
                            onClick={toggleMobileMenu}
                            className="p-2 rounded-md text-gray-500 dark:text-gray-400 md:hidden"
                            aria-expanded={mobileMenuOpen}
                            aria-label="Меню навигации"
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <AnimatePresence initial={false} mode="wait">
                                {mobileMenuOpen ? (
                                    <motion.div
                                        key="close"
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <X size={24} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="menu"
                                        initial={{ rotate: 90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: -90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Menu size={24} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </div>
                </div>
            </div>
            
            {/* Мобильное меню */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        ref={mobileMenuRef}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ 
                            duration: 0.3,
                            type: "spring",
                            stiffness: 300,
                            damping: 20
                        }}
                        className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
                    >
                        <div className="px-4 py-3">
                            {/* Мобильный поиск */}
                            <motion.form 
                                onSubmit={handleSearchSubmit} 
                                className="mb-3"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ 
                                    delay: 0.1,
                                    duration: 0.3
                                }}
                            >
                                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full w-full">
                                    <div className="pl-4 pr-2">
                                        <Search size={20} className="text-gray-500 dark:text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Найти в ресторане" 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="py-2 pr-4 w-full bg-transparent focus:outline-none text-gray-900 dark:text-white"
                                    />
                                </div>
                            </motion.form>
                            
                            {/* Мобильные кнопки */}
                            <div className="flex flex-col space-y-2 mt-3">
                                {user && (
                                <motion.button
                                    onClick={() => {
                                        if (user) {
                                            onProfileClick();
                                            setMobileMenuOpen(false);
                                        } else if (onLogin) {
                                            onLogin();
                                            setMobileMenuOpen(false);
                                        }
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm flex items-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ 
                                        delay: 0.2,
                                        duration: 0.3
                                    }}
                                    variants={menuItemVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    <UserCircle2 size={18} className="mr-2" />
                                    Мой профиль
                                </motion.button>
                                )}
                                
                                <motion.div
                                    className="w-full"
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ 
                                        delay: 0.22,
                                        duration: 0.3
                                    }}
                                    variants={menuItemVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    <Link 
                                        to="/restaurant-ratings" 
                                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md flex items-center"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Star size={18} className="mr-2 text-yellow-500" />
                                        Рейтинги ресторанов
                                    </Link>
                                </motion.div>
                                
                                {/* Mobile Manager Dashboard Link */}
                                {user && (user.role === 'manager' || user.role === 'менеджер') && (
                                    <motion.div
                                        className="w-full"
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ 
                                            delay: 0.24,
                                            duration: 0.3
                                        }}
                                        variants={menuItemVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                    >
                                        <Link 
                                            to="/manager" 
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md flex items-center"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <LayoutDashboard size={18} className="mr-2 text-blue-500" />
                                            Панель менеджера
                                        </Link>
                                    </motion.div>
                                )}
                                
                                {user && (user.role === 'admin' || user.role === 'super_admin' || user.role === 'moderator' || 
                                user.role === 'глав_админ' || user.role === 'head_admin' || 
                                user.role === 'manager' || user.role === 'менеджер') && (
                                    <motion.div
                                        className="w-full"
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ 
                                            delay: 0.25,
                                            duration: 0.3
                                        }}
                                        variants={menuItemVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                    >
                                        <button 
                                            onClick={() => {
                                                navigate('/admin');
                                                setMobileMenuOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                        >
                                            <ShieldCheck size={18} className="mr-2 text-gray-700 dark:text-gray-400" />
                                            Админ панель
                                        </button>
                                    </motion.div>
                                )}
                                
                                <motion.button
                                    onClick={toggleTheme}
                                    className="w-full text-left px-4 py-2 text-sm flex items-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ 
                                        delay: 0.3,
                                        duration: 0.3
                                    }}
                                    variants={menuItemVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    {isDarkMode ? <Sun size={18} className="mr-2" /> : <Moon size={18} className="mr-2" />}
                                    {isDarkMode ? 'Светлая тема' : 'Темная тема'}
                                </motion.button>
                                
                                {user ? (
                                    <motion.button
                                        onClick={() => {
                                            handleLogout();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm flex items-center text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ 
                                            delay: 0.4,
                                            duration: 0.3
                                        }}
                                        variants={menuItemVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                    >
                                        <LogOut size={18} className="mr-2" />
                                        Выйти
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        onClick={() => {
                                            onLogin();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm flex items-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ 
                                            delay: 0.4,
                                            duration: 0.3
                                        }}
                                        variants={menuItemVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                    >
                                        <LogIn size={18} className="mr-2" />
                                        Войти
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default NavigationBar;