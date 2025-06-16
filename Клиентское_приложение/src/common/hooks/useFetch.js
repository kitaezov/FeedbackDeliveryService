/**
 * Хук для упрощенной загрузки данных с API
 * 
 * Упрощает работу с асинхронными запросами, предоставляя состояния
 * загрузки, ошибок и данных в удобной форме.
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { FETCH_STATUS } from '../constants/config';

/**
 * Хук для загрузки данных с API
 * 
 * @param {string} url - URL для загрузки данных
 * @param {Object} [options={}] - Дополнительные опции
 * @param {boolean} [options.autoFetch=true] - Автоматически загружать данные при монтировании
 * @param {Object} [options.params={}] - Параметры запроса
 * @param {Object} [options.initialData=null] - Начальные данные
 * @param {Object} [options.headers={}] - Дополнительные заголовки
 * @param {Function} [options.onSuccess] - Функция, вызываемая при успешной загрузке
 * @param {Function} [options.onError] - Функция, вызываемая при ошибке загрузки
 * @param {Array} [options.dependencies=[]] - Зависимости для повторной загрузки
 * @returns {Object} Объект с данными, состоянием и методами
 */
export const useFetch = (url, options = {}) => {
    const {
        autoFetch = true,
        params = {},
        initialData = null,
        headers = {},
        onSuccess,
        onError,
        dependencies = []
    } = options;
    
    // Состояния
    const [data, setData] = useState(initialData);
    const [status, setStatus] = useState(FETCH_STATUS.IDLE);
    const [error, setError] = useState(null);
    
    // Получаем данные
    const fetchData = useCallback(async (overrideParams = {}) => {
        try {
            // Устанавливаем статус загрузки
            setStatus(FETCH_STATUS.LOADING);
            
            // Объединяем параметры
            const requestParams = { ...params, ...overrideParams };
            
            // Выполняем запрос
            const response = await api.get(url, {
                params: requestParams,
                headers
            });
            
            // Устанавливаем данные и статус успеха
            setData(response.data);
            setStatus(FETCH_STATUS.SUCCESS);
            setError(null);
            
            // Вызываем callback при успехе
            if (onSuccess) {
                onSuccess(response.data);
            }
            
            return response.data;
        } catch (err) {
            // Устанавливаем ошибку и статус ошибки
            setError(err);
            setStatus(FETCH_STATUS.ERROR);
            
            // Вызываем callback при ошибке
            if (onError) {
                onError(err);
            }
            
            return null;
        }
    }, [url, JSON.stringify(params), JSON.stringify(headers), onSuccess, onError]);
    
    // Функция для перезагрузки данных
    const refetch = useCallback((overrideParams = {}) => {
        return fetchData(overrideParams);
    }, [fetchData]);
    
    // Функция для сброса данных
    const reset = useCallback(() => {
        setData(initialData);
        setStatus(FETCH_STATUS.IDLE);
        setError(null);
    }, [initialData]);
    
    // Загружаем данные при монтировании компонента, если autoFetch = true
    useEffect(() => {
        if (autoFetch) {
            fetchData();
        }
    }, [autoFetch, fetchData, ...dependencies]);
    
    // Геттеры состояния
    const isLoading = status === FETCH_STATUS.LOADING;
    const isSuccess = status === FETCH_STATUS.SUCCESS;
    const isError = status === FETCH_STATUS.ERROR;
    const isIdle = status === FETCH_STATUS.IDLE;
    
    return {
        data,
        setData,
        status,
        error,
        isLoading,
        isSuccess,
        isError,
        isIdle,
        refetch,
        reset
    };
}; 