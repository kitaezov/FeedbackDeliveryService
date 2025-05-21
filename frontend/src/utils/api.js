import axios from 'axios';

// Создать экземпляр API с базовым URL-адресом из окружения или резервного варианта
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 15000, // 15 секунд timeout
    headers: {
        'Content-Type': 'application/json'
    }
});

// Функция для исправления URL-адресов, которые могут отсутствовать префикс /api
export const fixApiUrl = (url) => {
    // Если это уже полный URL-адрес, верните его
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    
    // Удалить ведущий слэш из всех путей, так как baseURL уже включает в себя слэш в конце
    return url.startsWith('/') ? url.substring(1) : url;
};

// Интерцептор запросов
api.interceptors.request.use(
    (config) => {
        // Получить токен из localStorage
        const token = localStorage.getItem('token');
        
        // Если токен существует, добавьте его в заголовки
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Исправить URL-адрес, чтобы он имел правильный префикс /api
        config.url = fixApiUrl(config.url);
        
        // Не устанавливайте Content-Type для FormData (multipart/form-data)
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        
        console.log('Отправка запроса:', {
            url: config.url,
            method: config.method,
            baseURL: config.baseURL,
            headers: config.headers
        });
        
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Интерцептор ответов
api.interceptors.response.use(
    (response) => {
        console.log('Ответ с сервера:', response);
        return response;
    },
    async (error) => {
        // Обработать ошибки
        if (error.response) {
            console.error('API Error Response:', error.response.data);
            
            // Обработать ошибки 401 Unauthorized
            if (error.response.status === 401) {
                // Очистить сохраненные учетные данные
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                // Выпустить событие, которое можно прослушивать для изменений состояния аутентификации
                const event = new CustomEvent('auth-error', { 
                    detail: { message: 'Сессия истекла. Пожалуйста, войдите снова.' } 
                });
                document.dispatchEvent(event);
                
                // Если это не запрос на вход или регистрацию, перенаправить на страницу входа
                if (!error.config.url.includes('auth/login') && !error.config.url.includes('auth/register')) {
                    window.location.href = '/auth/login';
                }
            }
            
            // Добавить более структурированную информацию об ошибке
            error.friendlyMessage = error.response.data?.message || 
                                   error.response.data?.error || 
                                   'Произошла ошибка при взаимодействии с сервером';
        }
        
        return Promise.reject(error);
    }
);

// Пользовательские методы для общих запросов
api.customGet = async (url, params = {}, options = {}) => {
    try {
        const response = await api.get(url, { params, ...options });
        return response.data;
    } catch (error) {
        console.error(`Error in customGet for ${url}:`, error);
        throw error;
    }
};

api.customPost = async (url, data = {}, options = {}) => {
    try {
        const response = await api.post(url, data, options);
        return response.data;
    } catch (error) {
        console.error(`Error in customPost for ${url}:`, error);
        throw error;
    }
};

export default api; 