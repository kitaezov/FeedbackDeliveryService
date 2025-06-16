import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Компонент карточки для группировки контента
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Содержимое карточки
 * @param {string} props.className - Дополнительные CSS классы
 * @param {boolean} props.hover - Добавить эффект при наведении
 * @param {boolean} props.shadow - Добавить тень
 * @param {string} props.as - HTML элемент для рендеринга (div, article, section и т.д.)
 * @returns {JSX.Element}
 */
export const Card = ({ 
    children, 
    className = '', 
    hover = false,
    shadow = true,
    as: Component = 'div',
    ...rest
}) => {
    // Базовые классы
    const baseClasses = 'rounded-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
    
    // Классы для тени
    const shadowClasses = shadow ? 'shadow-sm' : '';
    
    // Классы для эффекта при наведении
    const hoverClasses = hover ? 'hover:shadow-md transition-shadow duration-300' : '';
    
    return (
        <Component 
            className={`${baseClasses} ${shadowClasses} ${hoverClasses} ${className}`} 
            {...rest}
        >
            {children}
        </Component>
    );
};

/**
 * Компонент заголовка карточки
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Содержимое заголовка
 * @param {string} props.className - Дополнительные CSS классы
 * @returns {JSX.Element}
 */
export const CardHeader = ({ 
    children, 
    className = '', 
    ...rest 
}) => {
    return (
        <div 
            className={`px-4 py-3 border-b border-gray-200 dark:border-gray-700 ${className}`} 
            {...rest}
        >
            {children}
        </div>
    );
};

/**
 * Компонент заголовка карточки
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Содержимое заголовка
 * @param {string} props.className - Дополнительные CSS классы
 * @returns {JSX.Element}
 */
export const CardTitle = ({ 
    children, 
    className = '', 
    ...rest 
}) => {
    return (
        <h3 
            className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`} 
            {...rest}
        >
            {children}
        </h3>
    );
};

/**
 * Компонент содержимого карточки
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Содержимое
 * @param {string} props.className - Дополнительные CSS классы
 * @returns {JSX.Element}
 */
export const CardContent = ({ 
    children, 
    className = '', 
    ...rest 
}) => {
    return (
        <div 
            className={`p-4 ${className}`} 
            {...rest}
        >
            {children}
        </div>
    );
};

// Проверка типов props
Card.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    hover: PropTypes.bool,
    shadow: PropTypes.bool,
    as: PropTypes.string
}; 