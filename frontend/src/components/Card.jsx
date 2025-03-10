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
};

CardHeader.propTypes = {
    children: PropTypes.node.isRequired,
    withBorder: PropTypes.bool
};

CardTitle.propTypes = {
    children: PropTypes.node.isRequired,
    level: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
};

CardContent.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string
};


// Именованный экспорт компонентов
export {
    Card,
    CardHeader,
    CardTitle,
    CardContent,

};