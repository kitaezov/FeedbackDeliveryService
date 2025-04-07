import { useRef, useEffect } from 'react';

/**
 * Хук для определения первого рендера компонента
 * 
 * @returns {boolean} - true, если это первый рендер компонента
 */
export const useIsFirstRender = () => {
    const isFirstRender = useRef(true);
    
    useEffect(() => {
        // После первого рендера и срабатывания эффекта
        // меняем значение на false
        isFirstRender.current = false;
    }, []);
    
    return isFirstRender.current;
}; 