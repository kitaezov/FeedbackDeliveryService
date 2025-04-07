/**
 * Глобальная конфигурация приложения FeedbackDeliveryService
 * 
 * Этот файл содержит основные константы и параметры настройки,
 * используемые во всем приложении. Централизованное хранение
 * конфигурации упрощает поддержку и изменение параметров.
 */

// Конфигурация URL для API серверной части
export const API_URL = 'http://localhost:5000';
export const API_BASE = `${API_URL}/api`;

// Конфигурация временных интервалов (в миллисекундах)
export const NOTIFICATION_TIMEOUT = 5000; // Время отображения уведомлений (5 секунд)
export const TOKEN_REFRESH_INTERVAL = 1000 * 60 * 10; // Интервал обновления токена (10 минут)

// Конфигурация пагинации
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_NUMBER = 1;

// Ключи для локального хранилища
export const STORAGE_KEYS = {
    TOKEN: 'token',
    REFRESH_TOKEN: 'refreshToken',
    USER: 'user',
    THEME: 'theme'
};

// Роли пользователей
export const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin',
    HEAD_ADMIN: 'head_admin'
};

// Состояния загрузки
export const FETCH_STATUS = {
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error'
}; 