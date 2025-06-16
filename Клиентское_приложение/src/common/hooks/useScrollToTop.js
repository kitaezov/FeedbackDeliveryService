import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Хук для автоматической прокрутки страницы наверх
 * 
 * Используется для прокрутки страницы наверх при навигации между страницами
 * или при монтировании компонента
 * 
 * @param {Object} options - Параметры хука
 * @param {boolean} options.onMount - Прокручивать при монтировании компонента
 * @param {boolean} options.onPathChange - Прокручивать при изменении пути
 * @param {number} options.topOffset - Отступ от верха, к которому прокручивать
 */
export const useScrollToTop = ({
    onMount = true,
    onPathChange = true,
    topOffset = 0
} = {}) => {
    const { pathname, search } = useLocation();
    
    // Функция прокрутки страницы наверх
    const scrollToTop = () => {
        window.scrollTo({
            top: topOffset,
            behavior: 'smooth'
        });
    };
    
    // Прокрутка при монтировании компонента
    useEffect(() => {
        if (onMount) {
            scrollToTop();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    
    // Прокрутка при изменении пути
    useEffect(() => {
        if (onPathChange) {
            scrollToTop();
        }
    }, [pathname, search]); // eslint-disable-line react-hooks/exhaustive-deps
    
    // Возвращаем функцию для ручной прокрутки
    return scrollToTop;
}; 