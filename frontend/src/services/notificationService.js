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
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении уведомлений:', error);
        throw error;
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
    try {
        const response = await api.delete(`/notifications/${notificationId}`);
        return response.data;
    } catch (error) {
        console.error('Ошибка при удалении уведомления:', error);
        throw error;
    }
};

export default {
    getUserNotifications,
    createNotification,
    markNotificationAsRead,
    deleteNotification,
    setAuthToken
}; 