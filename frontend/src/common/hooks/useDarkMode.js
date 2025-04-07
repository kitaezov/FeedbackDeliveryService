/**
 * Хук для управления темной темой
 * 
 * Управляет состоянием и сохранением настроек темной темы
 */

import { useState, useEffect } from 'react';

// Ключ для локального хранилища
const THEME_STORAGE_KEY = 'theme';

/**
 * Хук для управления темной темой
 * 
 * @returns {Object} Объект с методами и состоянием темы
 */
export const useDarkMode = () => {
    // Проверяем, поддерживает ли браузер предпочтения темной темы
    const systemPrefersDark = window.matchMedia && 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Инициализируем из localStorage или системных предпочтений
    const getInitialDarkMode = () => {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        
        return systemPrefersDark;
    };
    
    const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);
    
    // Применение темной темы к документу
    useEffect(() => {
        const root = window.document.documentElement;
        
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem(THEME_STORAGE_KEY, 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem(THEME_STORAGE_KEY, 'light');
        }
    }, [isDarkMode]);
    
    // Слушатель изменения системных предпочтений
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = (e) => {
            // Обновляем тему только если пользователь не установил
            // свои предпочтения вручную
            const userPreference = localStorage.getItem(THEME_STORAGE_KEY);
            
            if (!userPreference) {
                setIsDarkMode(e.matches);
            }
        };
        
        // Добавляем слушателя в современных браузерах
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        } else {
            // Совместимость со старыми браузерами
            mediaQuery.addListener(handleChange);
            return () => mediaQuery.removeListener(handleChange);
        }
    }, []);
    
    /**
     * Переключение темной темы
     */
    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode);
    };
    
    /**
     * Установка темной темы
     * @param {boolean} value - Включить/выключить темную тему
     */
    const setDarkMode = (value) => {
        setIsDarkMode(value);
    };
    
    /**
     * Сброс к системным предпочтениям
     */
    const resetToSystemPreference = () => {
        localStorage.removeItem(THEME_STORAGE_KEY);
        setIsDarkMode(systemPrefersDark);
    };
    
    return {
        isDarkMode,
        toggleDarkMode,
        setDarkMode,
        resetToSystemPreference
    };
}; 