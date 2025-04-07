import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Компонент кнопки с поддержкой различных вариантов отображения
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Содержимое кнопки
 * @param {string} props.variant - Вариант отображения (primary, secondary, danger, success, warning, info, ghost)
 * @param {string} props.size - Размер кнопки (xs, sm, md, lg, xl)
 * @param {string} props.className - Дополнительные CSS классы
 * @param {boolean} props.disabled - Флаг отключения кнопки
 * @param {boolean} props.isLoading - Флаг загрузки
 * @param {string} props.href - URL для ссылки (превращает кнопку в ссылку)
 * @param {boolean} props.fullWidth - Растянуть кнопку на всю ширину контейнера
 * @param {string} props.type - Тип кнопки (button, submit, reset)
 * @returns {JSX.Element}
 */
export const Button = ({ 
    children, 
    variant = 'primary', 
    size = 'md',
    className = '',
    disabled = false,
    isLoading = false,
    href,
    fullWidth = false,
    type = 'button',
    ...rest
}) => {
    // Классы для различных вариантов кнопки
    const variantClasses = {
        primary: 'bg-primary-600 hover:bg-primary-700 text-white border-transparent focus:ring-primary-500',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 border-transparent focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100',
        danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent focus:ring-red-500',
        success: 'bg-green-600 hover:bg-green-700 text-white border-transparent focus:ring-green-500',
        warning: 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent focus:ring-yellow-500',
        info: 'bg-gray-700 hover:bg-gray-800 text-white border-transparent focus:ring-gray-500',
        ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 hover:text-gray-900 border-gray-300 focus:ring-gray-500 dark:hover:bg-gray-800 dark:text-gray-300 dark:hover:text-white'
    };
    
    // Классы для размеров кнопки
    const sizeClasses = {
        xs: 'px-2 py-1 text-xs',
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-2.5 text-base',
        xl: 'px-6 py-3 text-base'
    };
    
    // Базовые классы кнопки
    const baseClasses = 'inline-flex justify-center items-center font-medium border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
    
    // Классы для полной ширины
    const widthClasses = fullWidth ? 'w-full' : '';
    
    // Классы для отключенного состояния
    const disabledClasses = (disabled || isLoading) ? 'opacity-60 cursor-not-allowed' : '';
    
    // Собираем все классы
    const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${disabledClasses} ${className}`;
    
    // Если есть href и кнопка не отключена, используем Link
    if (href && !disabled) {
        return (
            <Link 
                to={href} 
                className={buttonClasses}
                {...rest}
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {children}
                    </>
                ) : (
                    children
                )}
            </Link>
        );
    }
    
    // В остальных случаях используем обычную кнопку
    return (
        <button 
            type={type}
            className={buttonClasses}
            disabled={disabled || isLoading}
            {...rest}
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {children}
                </>
            ) : (
                children
            )}
        </button>
    );
};

// Проверка типов props
Button.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success', 'warning', 'info', 'ghost']),
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
    disabled: PropTypes.bool,
    isLoading: PropTypes.bool,
    href: PropTypes.string,
    fullWidth: PropTypes.bool,
    type: PropTypes.oneOf(['button', 'submit', 'reset'])
}; 