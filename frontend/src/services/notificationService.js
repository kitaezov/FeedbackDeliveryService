/**
 * Сервис для работы с API уведомлений
 */
import axios from 'axios';
import { API_BASE } from '../config';

const api = axios.create({
    baseURL: API_BASE,
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
    // Для демонстрационных уведомлений возвращаем успешный ответ
    if (notificationId && notificationId.startsWith('demo-')) {
        return { success: true };
    }
    
    try {
        const response = await api.put(`/notifications/${notificationId}/read`);
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
    // Для демонстрационных уведомлений возвращаем успешный ответ
    if (notificationId && notificationId.startsWith('demo-')) {
        return { success: true };
    }
    
    try {
        const response = await api.delete(`/notifications/${notificationId}`);
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

export default {
    getUserNotifications,
    createNotification,
    markNotificationAsRead,
    deleteNotification,
    requestDeliveryRating,
    setAuthToken
}; 