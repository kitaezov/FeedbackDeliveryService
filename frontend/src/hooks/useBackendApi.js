import { useState, useCallback } from 'react';
import api from '../utils/api';

/**
 * Custom hook for handling backend API requests with loading states and error handling
 * @returns {Object} - Methods and state for working with backend API
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
      // Remove leading slash if present to avoid path issues
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
      console.log(`Sending API request to: ${cleanEndpoint}`, params);
      
      const response = await api.get(cleanEndpoint, { params });
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
      // Remove leading slash if present to avoid path issues
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
      console.log(`Sending API POST request to: ${cleanEndpoint}`, data);
      
      const response = await api.post(cleanEndpoint, data);
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
      // Remove leading slash if present to avoid path issues
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
      console.log(`Sending API PUT request to: ${cleanEndpoint}`, data);
      
      const response = await api.put(cleanEndpoint, data);
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
      // Remove leading slash if present to avoid path issues
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
      console.log(`Sending API DELETE request to: ${cleanEndpoint}`);
      
      const response = await api.delete(cleanEndpoint);
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