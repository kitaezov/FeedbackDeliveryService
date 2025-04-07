import React from 'react';
import PropTypes from 'prop-types';

/**
 * Компонент индикатора загрузки
 * 
 * @param {Object} props
 * @param {string} props.size - Размер индикатора (sm, md, lg)
 * @param {string} props.color - Цвет индикатора (primary, secondary, white)
 * @param {string} props.className - Дополнительные CSS классы
 * @returns {JSX.Element}
 */
export const Spinner = ({ 
    size = 'md',
    color = 'primary',
    className = ''
}) => {
    // Определяем размеры для разных вариантов
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };
    
    // Определяем цвета для разных вариантов
    const colorClasses = {
        primary: 'text-primary-600 dark:text-primary-400',
        secondary: 'text-gray-600 dark:text-gray-400',
        white: 'text-white'
    };
    
    return (
        <div className={`inline-block ${className}`} role="status" aria-label="Loading">
            <svg 
                className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`} 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
            >
                <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                ></circle>
                <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
            </svg>
            <span className="sr-only">Loading...</span>
        </div>
    );
};

// Проверка типов props
Spinner.propTypes = {
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    color: PropTypes.oneOf(['primary', 'secondary', 'white']),
    className: PropTypes.string
}; 