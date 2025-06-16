/**
 * Утилита для работы с API
 * 
 * Предоставляет функции для взаимодействия с бэкендом приложения.
 * Включает обработку ошибок, работу с токенами и отслеживание состояния запросов.
 */

import axios from 'axios';
import { API_BASE } from '../constants/config';

// Создаем экземпляр axios с базовым URL и настройками
const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Перехватчик запросов
 * Добавляет авторизационный токен к запросам
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Перехватчик ответов
 * Обрабатывает общие ошибки и выполняет обновление токена при необходимости
 */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Если ошибка 401 (Unauthorized) и запрос не повторный
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Помечаем запрос как повторный
            originalRequest._retry = true;
            
            try {
                // Пытаемся обновить токен
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('refreshToken', data.refreshToken);
                    
                    // Обновляем заголовок авторизации и повторяем запрос
                    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                    originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Если обновление токена не удалось, выходим из системы
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                
                // Перенаправление на страницу входа может быть вызвано внешним обработчиком
                // Возвращаем специальный объект с кодом AUTH_ERROR
                return Promise.reject({ 
                    code: 'AUTH_ERROR', 
                    message: 'Сессия истекла. Пожалуйста, войдите снова.' 
                });
            }
        }
        
        // Преобразуем ошибку API в более дружественный формат
        const apiError = {
            code: error.response?.status || 'NETWORK_ERROR',
            message: error.response?.data?.message || 'Ошибка при выполнении запроса',
            details: error.response?.data?.details || error.message,
            originalError: error
        };
        
        return Promise.reject(apiError);
    }
);

export default api; 