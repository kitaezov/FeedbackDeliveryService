/**
 * Хук для отслеживания размеров окна
 * 
 * Предоставляет актуальную информацию о размерах окна браузера
 * с обработкой ресайза и поддержкой SSR.
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Хук для отслеживания размеров окна
 * 
 * @returns {Object} Объект с шириной и высотой окна, а также информацией о брейкпоинтах
 */
export const useWindowSize = () => {
    // Функция для получения размеров окна с учетом SSR
    const getWindowSize = useCallback(() => {
        // Проверяем, доступен ли объект window
        const isClient = typeof window === 'object';
        
        return {
            width: isClient ? window.innerWidth : undefined,
            height: isClient ? window.innerHeight : undefined,
        };
    }, []);
    
    // Состояние для хранения размеров окна
    const [windowSize, setWindowSize] = useState(getWindowSize);
    
    // Функция обработки изменения размеров
    const handleResize = useCallback(() => {
        setWindowSize(getWindowSize());
    }, [getWindowSize]);
    
    // Эффект для установки и очистки слушателя
    useEffect(() => {
        if (typeof window !== 'object') return;
        
        // Обновляем размер в эффекте для правильной работы SSR
        handleResize();
        
        // Добавляем слушатель
        window.addEventListener('resize', handleResize);
        
        // Очищаем слушатель
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);
    
    // Определяем текущий брейкпоинт на основе ширины
    const getBreakpoint = useCallback(() => {
        const { width } = windowSize;
        
        if (width === undefined) return 'unknown';
        if (width < 640) return 'xs';
        if (width < 768) return 'sm';
        if (width < 1024) return 'md';
        if (width < 1280) return 'lg';
        return 'xl';
    }, [windowSize]);
    
    // Проверяем, соответствует ли текущая ширина брейкпоинту
    const isBreakpoint = useCallback((breakpoint) => {
        const currentBreakpoint = getBreakpoint();
        return currentBreakpoint === breakpoint;
    }, [getBreakpoint]);
    
    // Проверяем, является ли экран мобильным
    const isMobile = useCallback(() => {
        const bp = getBreakpoint();
        return bp === 'xs' || bp === 'sm';
    }, [getBreakpoint]);
    
    // Проверяем, является ли экран десктопным
    const isDesktop = useCallback(() => {
        const bp = getBreakpoint();
        return bp === 'lg' || bp === 'xl';
    }, [getBreakpoint]);
    
    // Проверяем, меньше ли экран заданного брейкпоинта
    const lessThan = useCallback((breakpoint) => {
        const { width } = windowSize;
        if (width === undefined) return false;
        
        const breakpoints = {
            sm: 640,
            md: 768,
            lg: 1024,
            xl: 1280
        };
        
        return width < (breakpoints[breakpoint] || 0);
    }, [windowSize]);
    
    // Проверяем, больше ли экран заданного брейкпоинта
    const moreThan = useCallback((breakpoint) => {
        const { width } = windowSize;
        if (width === undefined) return false;
        
        const breakpoints = {
            xs: 640,
            sm: 768,
            md: 1024,
            lg: 1280
        };
        
        return width >= (breakpoints[breakpoint] || 0);
    }, [windowSize]);
    
    return {
        ...windowSize,
        breakpoint: getBreakpoint(),
        isBreakpoint,
        isMobile,
        isDesktop,
        lessThan,
        moreThan
    };
}; 