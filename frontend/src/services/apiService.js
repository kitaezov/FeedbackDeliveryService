/**
 * Базовый сервис для работы с API
 */
import axios from 'axios';

// Базовый URL API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Создаем экземпляр axios с базовыми настройками
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Добавляем перехватчик запросов для добавления токена авторизации
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Добавляем перехватчик ответов для обработки ошибок
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // Обработка ошибки авторизации
        if (error.response && error.response.status === 401) {
            // Удаляем токен и перенаправляем на страницу входа
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        
        // Формируем объект ошибки
        const errorObj = {
            status: error.response ? error.response.status : null,
            message: error.response && error.response.data.message 
                ? error.response.data.message 
                : error.message || 'Неизвестная ошибка',
            data: error.response ? error.response.data : null,
        };
        
        // Возвращаем отклоненный промис с данными ошибки
        return Promise.reject(errorObj);
    }
);

/**
 * API-сервис для выполнения HTTP-запросов
 */
export const apiService = {
    /**
     * Выполняет GET-запрос
     * @param {string} url - URL-адрес
     * @param {Object} params - Параметры запроса
     * @returns {Promise<any>} Данные ответа
     */
    get: (url, params) => api.get(url, { params }),
    
    /**
     * Выполняет POST-запрос
     * @param {string} url - URL-адрес
     * @param {Object} data - Данные для отправки
     * @returns {Promise<any>} Данные ответа
     */
    post: (url, data) => api.post(url, data),
    
    /**
     * Выполняет PUT-запрос
     * @param {string} url - URL-адрес
     * @param {Object} data - Данные для отправки
     * @returns {Promise<any>} Данные ответа
     */
    put: (url, data) => api.put(url, data),
    
    /**
     * Выполняет PATCH-запрос
     * @param {string} url - URL-адрес
     * @param {Object} data - Данные для отправки
     * @returns {Promise<any>} Данные ответа
     */
    patch: (url, data) => api.patch(url, data),
    
    /**
     * Выполняет DELETE-запрос
     * @param {string} url - URL-адрес
     * @returns {Promise<any>} Данные ответа
     */
    delete: (url) => api.delete(url),
    
    /**
     * Выполняет загрузку файлов
     * @param {string} url - URL-адрес
     * @param {FormData} formData - Данные формы с файлами
     * @param {Function} onProgress - Функция обратного вызова для отслеживания прогресса
     * @returns {Promise<any>} Данные ответа
     */
    upload: (url, formData, onProgress) => {
        return api.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: onProgress
                ? (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onProgress(percentCompleted);
                }
                : undefined,
        });
    },
}; 