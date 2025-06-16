/**
 * Хук для дебаунсинга значений
 * 
 * Откладывает обновление значения на заданное время.
 * Полезно для оптимизации обработки часто меняющихся значений (например, ввод пользователя).
 */

import { useState, useEffect } from 'react';

/**
 * Хук для дебаунсинга значений
 * 
 * @param {*} value - Значение, которое должно быть отложено
 * @param {number} delay - Задержка в миллисекундах
 * @returns {*} Отложенное значение
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 * 
 * // При изменении debouncedSearchTerm выполняем поиск
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     searchAPI(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 */
export const useDebounce = (value, delay) => {
    // Состояние для хранения отложенного значения
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
        // Устанавливаем таймер для обновления значения
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        
        // Очищаем таймер при изменении значения или задержки
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);
    
    return debouncedValue;
}; 