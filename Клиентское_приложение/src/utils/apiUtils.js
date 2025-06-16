/**
 * Утилиты для работы с API запросами
 */

import { API_BASE } from '../config';

/**
 * Строит полный URL для API запроса
 * @param {string} endpoint - Конечная точка API (без префикса /api)
 * @returns {string} - Полный URL для запроса
 */
export const buildUrl = (endpoint) => {
    // Если это уже полный URL, возвращаем его как есть
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
        return endpoint;
    }

    // Удаляем начальный слэш, если он есть
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${API_BASE}/${cleanEndpoint}`;
};

/**
 * Получает заголовки авторизации для запроса
 * @returns {Object} - Объект с заголовками авторизации
 */
export const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}; 