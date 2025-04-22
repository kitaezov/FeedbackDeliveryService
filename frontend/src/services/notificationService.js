/**
 * Сервис для работы с API уведомлений
 */
import axios from 'axios';
import { API_BASE } from '../config';

const api = axios.create({
    baseURL: API_BASE,
});

// Интерцептор для добавления токена в заголовки запросов
api.interceptors.request.use(config => {
    // Получаем токен из localStorage или sessionStorage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    // Если токен существует, добавляем его в заголовки
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, error => {
    console.error('Ошибка запроса:', error);
    return Promise.reject(error);
});

/**
 * Устанавливает токен авторизации для запросов
 */
export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

/**
 * Получить все уведомления пользователя
 */
export const getUserNotifications = async () => {
    try {
        const response = await api.get('/notifications');
        
        // Если у пользователя нет уведомлений, добавляем демонстрационные
        if (!response.data.notifications || response.data.notifications.length === 0) {
            return {
                notifications: [
                    { 
                        id: 'demo-1', 
                        message: 'Новый отзыв', 
                        time: '5 минут назад', 
                        is_read: false,
                        type: 'info' 
                    },
                    { 
                        id: 'demo-2', 
                        message: 'Обновление профиля', 
                        time: '1 час назад', 
                        is_read: true,
                        type: 'success' 
                    },
                    { 
                        id: 'demo-3', 
                        message: 'Оцените доставку ресторана', 
                        time: '1 секунду назад', 
                        is_read: false,
                        type: 'info' 
                    }
                ],
                unreadCount: 2
            };
        }

        return response.data;
    } catch (error) {
        console.error('Ошибка при получении уведомлений:', error);
        
        // В случае ошибки также возвращаем демонстрационные уведомления
        return {
            notifications: [
                { 
                    id: 'demo-1', 
                    message: 'Новый отзыв', 
                    time: '5 минут назад', 
                    is_read: false,
                    type: 'info' 
                },
                { 
                    id: 'demo-2', 
                    message: 'Обновление профиля', 
                    time: '1 час назад', 
                    is_read: true,
                    type: 'success' 
                },
                { 
                    id: 'demo-3', 
                    message: 'Оцените доставку ресторана', 
                    time: '1 секунду назад', 
                    is_read: false,
                    type: 'info' 
                }
            ],
            unreadCount: 2
        };
    }
};

/**
 * Создать новое уведомление
 */
export const createNotification = async (data) => {
    try {
        const response = await api.post('/notifications', data);
        return response.data;
    } catch (error) {
        console.error('Ошибка при создании уведомления:', error);
        throw error;
    }
};

/**
 * Пометить уведомление как прочитанное
 */
export const markNotificationAsRead = async (notificationId) => {
    try {
        // Проверяем, что notificationId существует и является строкой
        if (!notificationId) {
            throw new Error('Notification ID is required');
        }

        const notificationIdStr = String(notificationId);
        
        // Для демонстрационных уведомлений возвращаем успешный ответ
        if (notificationIdStr.startsWith('demo-')) {
            return { success: true };
        }
        
        const response = await api.put(`/notifications/${notificationIdStr}/read`);
        return response.data;
    } catch (error) {
        console.error('Ошибка при обновлении уведомления:', error);
        throw error;
    }
};

/**
 * Удалить уведомление
 */
export const deleteNotification = async (notificationId) => {
    try {
        // Проверяем, что notificationId существует
        if (!notificationId) {
            throw new Error('Notification ID is required');
        }
        
        // Преобразуем notificationId в строку
        const notificationIdStr = String(notificationId);
        
        // Для демонстрационных уведомлений возвращаем успешный ответ
        if (notificationIdStr.startsWith('demo-')) {
            return { success: true };
        }
        
        const response = await api.delete(`/notifications/${notificationIdStr}`);
        return response.data;
    } catch (error) {
        console.error('Ошибка при удалении уведомления:', error);
        throw error;
    }
};

/**
 * Отправить запрос на оценку доставки
 */
export const requestDeliveryRating = async (restaurantName) => {
    try {
        const response = await api.post('/notifications/delivery-rating', { restaurantName });
        return response.data;
    } catch (error) {
        console.error('Ошибка при запросе оценки доставки:', error);
        throw error;
    }
};

/**
 * Удалить все уведомления пользователя
 */
export const clearAllNotifications = async () => {
    try {
        const response = await api.delete('/notifications');
        return response.data;
    } catch (error) {
        console.error('Ошибка при удалении уведомлений:', error);
        throw error;
    }
};

export default {
    getUserNotifications,
    createNotification,
    markNotificationAsRead,
    deleteNotification,
    requestDeliveryRating,
    clearAllNotifications,
    setAuthToken
}; 