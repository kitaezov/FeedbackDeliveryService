import { useState, useCallback } from 'react';
import api from '../utils/api';

/**
 * Пользовательский хук для обработки запросов к бэкенду с состояниями загрузки и обработкой ошибок
 * @returns {Object} - Методы и состояние для работы с бэкендом
 */
export const useBackendApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Make a GET request to the backend API
   * @param {string} endpoint - API endpoint (without /api prefix)
   * @param {Object} params - Query parameters
   * @returns {Promise<any>} - Response data
   */
  const fetchData = useCallback(async (endpoint, params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
      const url = buildUrl(cleanEndpoint);
      
      // Логируем запрос на русском
      console.log(`Отправка GET запроса к API: ${cleanEndpoint}`, params);
      
      const response = await api.get(url, {
        params,
        headers: getAuthHeaders(),
        withCredentials: true
      });
      return response.data;
    } catch (err) {
      console.error(`API Error from ${endpoint}:`, err);
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Произошла ошибка при загрузке данных';
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Make a POST request to the backend API
   * @param {string} endpoint - API endpoint (without /api prefix)
   * @param {Object} data - Request body data
   * @returns {Promise<any>} - Response data
   */
  const postData = useCallback(async (endpoint, data = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
      const url = buildUrl(cleanEndpoint);
      
      // Логируем запрос на русском
      console.log(`Отправка POST запроса к API: ${cleanEndpoint}`, data);
      
      const response = await api.post(url, data, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      return response.data;
    } catch (err) {
      console.error(`API Error from ${endpoint}:`, err);
      
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