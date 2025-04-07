import React from 'react';
import PropTypes from 'prop-types';

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
    // Базовые классы с улучшенной поддержкой темной темы и согласованными размерами
    const baseClasses = 'card-standard bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors duration-300 w-full';
    
    // Классы для тени
    const shadowClasses = shadow ? 'shadow-sm dark:shadow-lg dark:shadow-gray-900/30' : '';
    
    // Классы для эффекта при наведении
    const hoverClasses = hover ? 'hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-gray-900/40 transition-shadow duration-300' : '';
    
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
export const CardHeader = ({ children, className = '', ...rest }) => {
    return (
        <div className={`card-header border-b border-gray-100 dark:border-gray-700 transition-colors duration-300 ${className}`} {...rest}>
            {children}
        </div>
    );
};

/**
 * Компонент заголовка в карточке
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Текст заголовка
 * @param {string} props.className - Дополнительные CSS классы
 * @returns {JSX.Element}
 */
export const CardTitle = ({ children, className = '', ...rest }) => {
    return (
        <h3 className={`text-lg font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300 ${className}`} {...rest}>
            {children}
        </h3>
    );
};

/**
 * Компонент для содержимого карточки
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Содержимое карточки
 * @param {string} props.className - Дополнительные CSS классы
 * @returns {JSX.Element}
 */
export const CardContent = ({ children, className = '', ...rest }) => {
    return (
        <div className={`card-content text-gray-700 dark:text-gray-300 transition-colors duration-300 ${className}`} {...rest}>
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

CardHeader.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string
};

CardTitle.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string
};

CardContent.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string
};

// Экспорт по умолчанию для обратной совместимости
export default Card; 