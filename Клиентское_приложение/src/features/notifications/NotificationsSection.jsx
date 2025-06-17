import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { Bell, RefreshCw, CheckCircle, Trash2, Trash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserNotifications, markNotificationAsRead, deleteNotification, clearAllNotifications } from '../../services/notificationService';
import { useNotification } from '../../components/NotificationContext';

const NotificationItem = ({ notification, onMarkAsRead, onDelete, isDarkMode }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'success':
                return isDarkMode ? 'text-green-400' : 'text-green-600';
            case 'error':
                return isDarkMode ? 'text-red-400' : 'text-red-600';
            case 'info':
            default:
                return isDarkMode ? 'text-blue-400' : 'text-blue-600';
        }
    };

    const themeClasses = {
        card: isDarkMode
            ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
            : 'bg-white border-gray-200 hover:bg-gray-50',
        text: isDarkMode
            ? 'text-gray-200'
            : 'text-gray-700',
        subtext: isDarkMode
            ? 'text-gray-400'
            : 'text-gray-500',
        button: isDarkMode
            ? 'text-gray-400 hover:text-gray-200'
            : 'text-gray-500 hover:text-gray-700'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`rounded-lg border p-3 mb-3 transition-colors ${themeClasses.card} ${notification.is_read ? 'opacity-70' : ''}`}
        >
            <div className="flex items-start">
                <div className={`flex-1 ${themeClasses.text}`}>
                    <div className="flex items-center">
                        <span className={`mr-2 ${getTypeColor(notification.type)}`}>
                            {notification.type === 'success' ? '✓' : notification.type === 'error' ? '✗' : 'ℹ'}
                        </span>
                        <p className="font-medium">{notification.message}</p>
                    </div>
                    <p className={`text-sm mt-1 ${themeClasses.subtext}`}>
                        {formatDate(notification.created_at)}
                    </p>
                </div>
                <div className="flex space-x-1">
                    {!notification.is_read && (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onMarkAsRead(notification.id)}
                            className={`p-1 rounded-full ${themeClasses.button}`}
                            title="Отметить как прочитанное"
                        >
                            <CheckCircle className="w-5 h-5" />
                        </motion.button>
                    )}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onDelete(notification.id)}
                        className={`p-1 rounded-full ${themeClasses.button}`}
                        title="Удалить уведомление"
                    >
                        <Trash2 className="w-5 h-5" />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

const NotificationsSection = ({ user, isDarkMode }) => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all', 'unread'
    const notifyContext = useNotification();

    const loadNotifications = async () => {
        if (!user || !user.token) return;
        
        setIsLoading(true);
        try {
            const data = await getUserNotifications();
            setNotifications(data);
            
            // Автоматически отмечаем все непрочитанные уведомления как прочитанные при просмотре
            const unreadNotifications = data.filter(notification => !notification.is_read);
            for (const notification of unreadNotifications) {
                await markNotificationAsRead(notification.id);
            }
            
            // Обновляем локальное состояние, чтобы отразить все уведомления как прочитанные
            setNotifications(prevNotifications => 
                prevNotifications.map(notification => ({ ...notification, is_read: true }))
            );
        } catch (error) {
            if (notifyContext) {
                notifyContext.notifyError('Не удалось загрузить уведомления');
            } else {
                console.error('Ошибка при загрузке уведомлений', error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.token) {
            loadNotifications();
        }
    }, [user]);

    const handleRefresh = () => {
        setIsRotating(true);
        loadNotifications().finally(() => {
            setTimeout(() => setIsRotating(false), 1000);
        });
    };

    const handleMarkAsRead = async (id) => {
        try {
            await markNotificationAsRead(id);
            setNotifications(prevNotifications => 
                prevNotifications.map(notification => 
                    notification.id === id 
                        ? { ...notification, is_read: true } 
                        : notification
                )
            );
            if (notifyContext) {
                notifyContext.notifySuccess('Уведомление отмечено как прочитанное');
            }
        } catch (error) {
            if (notifyContext) {
                notifyContext.notifyError('Не удалось обновить статус уведомления');
            }
            console.error('Ошибка при обновлении статуса уведомления', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteNotification(id);
            setNotifications(prevNotifications => 
                prevNotifications.filter(notification => notification.id !== id)
            );
            if (notifyContext) {
                notifyContext.notifySuccess('Уведомление удалено');
            }
        } catch (error) {
            if (notifyContext) {
                notifyContext.notifyError('Не удалось удалить уведомление');
            }
            console.error('Ошибка при удалении уведомления', error);
        }
    };

    const handleClearAll = async () => {
        try {
            await clearAllNotifications();
            setNotifications([]);
            if (notifyContext) {
                notifyContext.notifySuccess('Все уведомления удалены');
            }
        } catch (error) {
            if (notifyContext) {
                notifyContext.notifyError('Не удалось удалить уведомления');
            }
            console.error('Ошибка при удалении уведомлений', error);
        }
    };

    const filteredNotifications = filter === 'all' 
        ? notifications 
        : notifications.filter(notification => !notification.is_read);
    
    const unreadCount = notifications.filter(notification => !notification.is_read).length;

    // Конфигурация стилей
    const themeClasses = {
        card: isDarkMode
            ? 'bg-gray-900 border-gray-700 text-gray-100'
            : 'bg-white border-gray-200 text-gray-800',
        button: isDarkMode
            ? 'hover:bg-gray-700'
            : 'hover:bg-gray-100',
        activeButton: isDarkMode
            ? 'bg-gray-700 text-white'
            : 'bg-gray-200 text-gray-700',
        emptyState: isDarkMode
            ? 'bg-gray-800 text-gray-300'
            : 'bg-gray-50 text-gray-600'
    };

    return (
        <Card className={`border rounded-lg shadow-md ${themeClasses.card}`}>
            <CardHeader className="border-b p-4">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-semibold flex items-center">
                        <Bell className="w-5 h-5 mr-2" />
                        Уведомления
                        {unreadCount > 0 && (
                            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-700 text-white">
                                {unreadCount}
                            </span>
                        )}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                filter === 'all'
                                    ? themeClasses.activeButton
                                    : themeClasses.button
                            }`}
                        >
                            Все
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                filter === 'unread'
                                    ? themeClasses.activeButton
                                    : themeClasses.button
                            }`}
                        >
                            Непрочитанные
                        </motion.button>
                        {notifications.length > 0 && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleClearAll}
                                className="px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors flex items-center"
                            >
                                <Trash className="w-4 h-4 mr-1" />
                                Очистить все
                            </motion.button>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4">
                {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-400 rounded-full"
                        />
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className={`text-center py-8 ${themeClasses.emptyState}`}>
                        <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Нет уведомлений</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {filteredNotifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={handleMarkAsRead}
                                onDelete={handleDelete}
                                isDarkMode={isDarkMode}
                            />
                        ))}
                    </AnimatePresence>
                )}
            </CardContent>
        </Card>
    );
};

export default NotificationsSection; 