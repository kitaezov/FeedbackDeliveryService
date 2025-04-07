import React from 'react';

/**
 * Компонент для отображения бейджей
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Содержимое бейджа
 * @param {string} props.variant - Вариант отображения (primary, secondary, success, danger, warning, info, outline)
 * @param {string} props.size - Размер бейджа (sm, md, lg)
 * @param {string} props.className - Дополнительные CSS классы
 * @returns {JSX.Element}
 */
export const Badge = ({ 
    children, 
    variant = 'primary',
    size = 'md',
    className = '' 
}) => {
    // Классы для различных вариантов бейджа
    const variantClasses = {
        primary: 'bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-100',
        secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
        success: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
        danger: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
        warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
        info: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        outline: 'bg-transparent border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300'
    };
    
    // Классы для размеров бейджа
    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-0.5',
        lg: 'text-base px-3 py-1'
    };
    
    return (
        <span className={`inline-flex items-center font-medium rounded-full ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
            {children}
        </span>
    );
}; 