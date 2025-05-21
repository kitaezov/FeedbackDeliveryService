import { useState, useCallback } from 'react';
import api from '../utils/api';

/**
 * Хук для работы с бэкендом API
 * Предоставляет методы для отправки запросов и обработки ответов
 */
const useBackendApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Получить заголовки авторизации
     * @returns {Object} - Заголовки с токеном авторизации
     */
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    /**
     * Построить URL для API запроса
     * @param {string} endpoint - Конечная точка API
     * @returns {string} - Полный URL для запроса
     */
    const buildUrl = (endpoint) => {
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        return `${baseUrl}/${endpoint}`;
    };

    /**
     * Отправить GET запрос к бэкенду API
     * @param {string} endpoint - Конечная точка API (без префикса /api)
     * @returns {Promise<any>} - Данные ответа
     */
    const fetchData = useCallback(async (endpoint) => {
        setLoading(true);
        setError(null);
        
        try {
            const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
            const url = buildUrl(cleanEndpoint);
            
            console.log(`Отправка GET запроса к API: ${cleanEndpoint}`);
            
            const response = await api.get(url, {
                headers: getAuthHeaders(),
                withCredentials: true
            });
            return response.data;
        } catch (err) {
            console.error(`Ошибка API при запросе к ${endpoint}:`, err);
            
            const errorMessage = err.response?.data?.message || 
                               err.response?.data?.error || 
                               err.message || 
                               'Произошла ошибка при получении данных';
            
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Отправить POST запрос к бэкенду API
     * @param {string} endpoint - Конечная точка API (без префикса /api)
     * @param {Object} data - Данные для отправки
     * @returns {Promise<any>} - Данные ответа
     */
    const postData = useCallback(async (endpoint, data = {}) => {
        setLoading(true);
        setError(null);
        
        try {
            const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
            const url = buildUrl(cleanEndpoint);
            
            console.log(`Отправка POST запроса к API: ${cleanEndpoint}`, data);
            
            const response = await api.post(url, data, {
                headers: getAuthHeaders(),
                withCredentials: true
            });
            return response.data;
        } catch (err) {
            console.error(`Ошибка API при запросе к ${endpoint}:`, err);
            
            const errorMessage = err.response?.data?.message || 
                               err.response?.data?.error || 
                               err.message || 
                               'Произошла ошибка при отправке данных';
            
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Make a PUT request to the backend API
     * @param {string} endpoint - API endpoint (without /api prefix)
     * @param {Object} data - Request body data
     * @returns {Promise<any>} - Response data
     */
    const updateData = useCallback(async (endpoint, data = {}) => {
        setLoading(true);
        setError(null);
        
        try {
            const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
            const url = buildUrl(cleanEndpoint);
            
            // Логируем запрос на русском
            console.log(`Отправка PUT запроса к API: ${cleanEndpoint}`, data);
            
            const response = await api.put(url, data, {
                headers: getAuthHeaders(),
                withCredentials: true
            });
            return response.data;
        } catch (err) {
            console.error(`API Error from ${endpoint}:`, err);
            
            const errorMessage = err.response?.data?.message || 
                                err.response?.data?.error || 
                                err.message || 
                                'Произошла ошибка при обновлении данных';
            
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Make a DELETE request to the backend API
     * @param {string} endpoint - API endpoint (without /api prefix)
     * @returns {Promise<any>} - Response data
     */
    const deleteData = useCallback(async (endpoint) => {
        setLoading(true);
        setError(null);
        
        try {
            const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
            const url = buildUrl(cleanEndpoint);
            
            // Логируем запрос на русском
            console.log(`Отправка DELETE запроса к API: ${cleanEndpoint}`);
            
            const response = await api.delete(url, {
                headers: getAuthHeaders(),
                withCredentials: true
            });
            return response.data;
        } catch (err) {
            console.error(`API Error from ${endpoint}:`, err);
            
            const errorMessage = err.response?.data?.message || 
                                err.response?.data?.error || 
                                err.message || 
                                'Произошла ошибка при удалении данных';
            
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        fetchData,
        postData,
        updateData,
        deleteData
    };
};

export default useBackendApi; 