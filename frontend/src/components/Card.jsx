<<<<<<< HEAD
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
=======
import React, { forwardRef } from "react";
import PropTypes from 'prop-types';

/**
 * Основной компонент карточки
 * @component
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Содержимое карточки
 * @param {string} [props.className=''] - Дополнительные CSS классы
 * @param {string} [props.variant='default'] - Вариант стиля карточки
 * @param {boolean} [props.hoverable=false] - Эффект при наведении
 * @param {boolean} [props.loading=false] - Состояние загрузки
 */
const Card = forwardRef(({
                             children,
                             className = '',
                             variant = 'default',
                             hoverable = false,
                             loading = false,
                             ...props
                         }, ref) => {
    // Обработка ошибок рендеринга
    try {
        // Варианты стилей карточки
        const variantStyles = {
            default: 'bg-white dark:bg-gray-800',
            primary: 'bg-blue-50 dark:bg-blue-900',
            secondary: 'bg-gray-50 dark:bg-gray-900',
            error: 'bg-red-50 dark:bg-red-900'
        };

        // Формирование классов
        const cardClasses = [
            // Базовые стили
            'rounded-lg shadow-lg',
            'transition-all duration-200',
            // Вариант стиля
            variantStyles[variant],
            // Эффект при наведении
            hoverable && 'hover:shadow-xl hover:transform hover:scale-[1.02]',
            // Дополнительные классы
            className
        ].filter(Boolean).join(' ');

        // Если карточка в состоянии загрузки
        if (loading) {
            return (
                <div
                    ref={ref}
                    className={cardClasses}
                    role="progressbar"
                    aria-busy="true"
                    {...props}
                >
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                </div>
            );
        }

        return (
            <div
                ref={ref}
                className={cardClasses}
                role="article"
                {...props}
            >
                {children}
            </div>
        );
    } catch (error) {
        console.error('Error rendering Card:', error);
        return (
            <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg">
                Произошла ошибка при отображении карточки
            </div>
        );
    }
});

/**
 * Компонент заголовка карточки
 * @component
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Содержимое заголовка
 * @param {boolean} [props.withBorder=true] - Отображать нижнюю границу
 */
const CardHeader = forwardRef(({
                                   children,
                                   withBorder = true,
                                   ...props
                               }, ref) => {
    try {
        const headerClasses = [
            'px-6 py-4',
            withBorder && 'border-b border-gray-200 dark:border-gray-700'
        ].filter(Boolean).join(' ');

        return (
            <header
                ref={ref}
                className={headerClasses}
                {...props}
            >
                {children}
            </header>
        );
    } catch (error) {
        console.error('Error rendering CardHeader:', error);
        return null;
    }
});

/**
 * Компонент заголовка внутри карточки
 * @component
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Текст заголовка
 * @param {string} [props.level='h2'] - Уровень заголовка
 */
const CardTitle = forwardRef(({
                                  children,
                                  level = 'h2',
                                  ...props
                              }, ref) => {
    try {
        const Component = level;
        return (
            <Component
                ref={ref}
                className="text-xl font-semibold text-gray-800 dark:text-white"
                {...props}
            >
                {children}
            </Component>
        );
    } catch (error) {
        console.error('Error rendering CardTitle:', error);
        return null;
    }
});

/**
 * Компонент содержимого карточки
 * @component
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Содержимое
 * @param {string} [props.className=''] - Дополнительные CSS классы
 */
const CardContent = forwardRef(({
                                    children,
                                    className = '',
                                    ...props
                                }, ref) => {
    try {
        return (
            <div
                ref={ref}
                className={`p-6 ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    } catch (error) {
        console.error('Error rendering CardContent:', error);
        return null;
    }
});

// PropTypes для всех компонентов
Card.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'error']),
    hoverable: PropTypes.bool,
    loading: PropTypes.bool
>>>>>>> c0de413dc1865264c2ef241c20aa63fec52080b1
};

CardHeader.propTypes = {
    children: PropTypes.node.isRequired,
<<<<<<< HEAD
    className: PropTypes.string
=======
    withBorder: PropTypes.bool
>>>>>>> c0de413dc1865264c2ef241c20aa63fec52080b1
};

CardTitle.propTypes = {
    children: PropTypes.node.isRequired,
<<<<<<< HEAD
    className: PropTypes.string
=======
    level: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
>>>>>>> c0de413dc1865264c2ef241c20aa63fec52080b1
};

CardContent.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string
};

<<<<<<< HEAD
// Экспорт по умолчанию для обратной совместимости
export default Card; 
=======

// Именованный экспорт компонентов
export {
    Card,
    CardHeader,
    CardTitle,
    CardContent,

};
>>>>>>> c0de413dc1865264c2ef241c20aa63fec52080b1
