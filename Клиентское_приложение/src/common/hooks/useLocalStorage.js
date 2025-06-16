/**
 * Хук для работы с localStorage
 * 
 * Предоставляет удобный интерфейс для хранения, получения и удаления данных
 * в локальном хранилище браузера с возможностью устанавливать срок действия
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Хук для работы с localStorage
 * 
 * @param {string} key - Ключ для хранения данных
 * @param {*} initialValue - Начальное значение, если данных нет в хранилище
 * @param {Object} [options={}] - Дополнительные настройки
 * @param {number} [options.expirationHours] - Срок действия в часах
 * @param {boolean} [options.listenToChange=false] - Слушать изменения из других вкладок
 * @returns {Array} Массив [storedValue, setValue, clearValue]
 */
export const useLocalStorage = (key, initialValue, options = {}) => {
    const { expirationHours, listenToChange = false } = options;
    
    // Функция для получения значения из localStorage
    const getStoredValue = useCallback(() => {
        try {
            const item = window.localStorage.getItem(key);
            
            // Если в хранилище ничего нет, возвращаем начальное значение
            if (item === null) {
                return initialValue;
            }
            
            // Пытаемся распарсить JSON
            const parsedItem = JSON.parse(item);
            
            // Проверяем срок действия, если он был установлен
            if (parsedItem.expiration && new Date(parsedItem.expiration) < new Date()) {
                window.localStorage.removeItem(key);
                return initialValue;
            }
            
            return parsedItem.value;
        } catch (error) {
            console.error('Ошибка при чтении из localStorage:', error);
            return initialValue;
        }
    }, [key, initialValue]);
    
    // Состояние для хранения текущего значения
    const [storedValue, setStoredValue] = useState(getStoredValue);
    
    // Функция для установки нового значения в localStorage
    const setValue = useCallback((value) => {
        try {
            // Разрешаем использовать функцию для установки значения
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            
            // Подготавливаем объект для хранения
            const itemToStore = {
                value: valueToStore
            };
            
            // Добавляем срок действия, если он указан
            if (expirationHours) {
                const expiration = new Date();
                expiration.setHours(expiration.getHours() + expirationHours);
                itemToStore.expiration = expiration.toISOString();
            }
            
            // Обновляем состояние
            setStoredValue(valueToStore);
            
            // Записываем в localStorage
            window.localStorage.setItem(key, JSON.stringify(itemToStore));
            
            // Уведомляем другие вкладки об изменении
            window.dispatchEvent(
                new StorageEvent('storage', {
                    key,
                    newValue: JSON.stringify(itemToStore)
                })
            );
        } catch (error) {
            console.error('Ошибка при записи в localStorage:', error);
        }
    }, [key, storedValue, expirationHours]);
    
    // Функция для удаления значения из localStorage
    const clearValue = useCallback(() => {
        try {
            // Удаляем из localStorage
            window.localStorage.removeItem(key);
            
            // Сбрасываем состояние
            setStoredValue(initialValue);
            
            // Уведомляем другие вкладки об удалении
            window.dispatchEvent(
                new StorageEvent('storage', {
                    key,
                    newValue: null
                })
            );
        } catch (error) {
            console.error('Ошибка при удалении из localStorage:', error);
        }
    }, [key, initialValue]);
    
    // Эффект для обновления значения при изменении ключа
    useEffect(() => {
        setStoredValue(getStoredValue());
    }, [key, getStoredValue]);
    
    // Эффект для слушателя изменений из других вкладок
    useEffect(() => {
        if (!listenToChange) return;
        
        // Обработчик события storage
        const handleStorageChange = (event) => {
            if (event.key === key) {
                try {
                    // Если значение удалено
                    if (event.newValue === null) {
                        setStoredValue(initialValue);
                        return;
                    }
                    
                    // Обновляем состояние из полученного значения
                    const parsedItem = JSON.parse(event.newValue);
                    
                    // Проверяем срок действия
                    if (parsedItem.expiration && new Date(parsedItem.expiration) < new Date()) {
                        setStoredValue(initialValue);
                    } else {
                        setStoredValue(parsedItem.value);
                    }
                } catch (error) {
                    console.error('Ошибка при обработке изменения localStorage:', error);
                }
            }
        };
        
        // Добавляем слушатель
        window.addEventListener('storage', handleStorageChange);
        
        // Очищаем слушатель
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [key, initialValue, listenToChange]);
    
    return [storedValue, setValue, clearValue];
}; 