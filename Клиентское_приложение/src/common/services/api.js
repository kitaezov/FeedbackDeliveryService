import axios from 'axios';
import { getAccessToken, removeAccessToken } from '../utils/authUtils';

// Константы для настройки API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API_TIMEOUT = 15000; // 15 секунд

/**
 * Конфигурация Axios с основными настройками
 */
export const api = axios.create({
    baseURL: API_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

/**
 * Интерцептор запросов для добавления токена авторизации
 */
api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Интерцептор ответов для обработки ошибок и refresh token
 */
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // Проверяем, что ошибка связана с авторизацией и это не повторный запрос
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Здесь можно добавить логику для обновления токена (refresh token)
                // const refreshToken = getRefreshToken();
                // const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
                // const newAccessToken = response.data.accessToken;
                // updateAccessToken(newAccessToken);
                
                // Если не удалось обновить токен, разлогиниваем пользователя
                removeAccessToken();
                window.location.href = '/login';
                
                return Promise.reject(error);
            } catch (refreshError) {
                // Если не удалось обновить токен, разлогиниваем пользователя
                removeAccessToken();
                window.location.href = '/login';
                
                return Promise.reject(refreshError);
            }
        }
        
        // Обработка других ошибок
        if (error.response) {
            // Серверная ошибка с ответом
            console.error('API Error Response:', error.response.data);
            
            // Преобразуем серверные ошибки в понятный формат
            const errorMessage = error.response.data.message || 
                error.response.data.error || 
                'Произошла ошибка на сервере';
                
            error.message = errorMessage;
        } else if (error.request) {
            // Ошибка сети (нет ответа от сервера)
            console.error('API Network Error:', error.request);
            error.message = 'Нет соединения с сервером. Проверьте подключение к интернету.';
        } else {
            // Ошибка при настройке запроса
            console.error('API Request Error:', error.message);
            error.message = 'Ошибка при выполнении запроса';
        }
        
        return Promise.reject(error);
    }
);

/**
 * Вспомогательная функция для загрузки файлов на сервер
 * 
 * @param {string} url - URL эндпоинта
 * @param {FormData} formData - Данные формы с файлами
 * @param {Function} onProgress - Функция обратного вызова для отслеживания прогресса загрузки
 * @returns {Promise} - Промис с результатом запроса
 */
export const uploadFile = async (url, formData, onProgress = null) => {
    const token = getAccessToken();
    
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
            if (onProgress) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        }
    };
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    try {
        const response = await axios.post(`${API_URL}${url}`, formData, config);
        return response.data;
    } catch (error) {
        console.error('Upload Error:', error);
        throw error;
    }
}; 