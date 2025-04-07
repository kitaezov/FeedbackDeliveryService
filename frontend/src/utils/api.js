import axios from 'axios';
import { API_BASE } from '../config';

// Создание экземпляра axios с базовым URL
const api = axios.create({
    baseURL: API_BASE
});

// Интерцептор для добавления токена в заголовки запросов
api.interceptors.request.use(config => {
    // Получаем токен из localStorage или sessionStorage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    // Если токен существует, добавляем его в заголовки
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('Отправка запроса:', {
        url: config.url,
        method: config.method,
        baseURL: config.baseURL,
        headers: config.headers
    });
    
    return config;
}, error => {
    console.error('Ошибка запроса:', error);
    return Promise.reject(error);
});

// Интерцептор для обработки ошибок ответов
api.interceptors.response.use(
    response => {
        console.log('Ответ с сервера:', {
            status: response.status,
            url: response.config.url,
            data: response.data
        });
        return response;
    },
    error => {
        // Подробный вывод информации об ошибке
        console.error('Ошибка ответа:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            data: error.response?.data
            
        });
        
        // Обработка ошибок авторизации
        if (error.response && error.response.status === 401) {
            // Удаляем токен при ошибке авторизации
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            
            // Диспатчим событие изменения авторизации
            const authEvent = new CustomEvent('auth-changed', { 
                detail: { 
                    isAuthenticated: false
                } 
            });
            document.dispatchEvent(authEvent);
        }
        
        return Promise.reject(error);
    }
);

export default api; 