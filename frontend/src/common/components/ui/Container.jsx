import React from 'react';

/**
 * Компонент контейнера для ограничения ширины содержимого страницы
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Содержимое контейнера
 * @param {string} props.className - Дополнительные CSS классы
 * @param {string} props.size - Размер контейнера (sm, md, lg, xl, 2xl, full)
 * @param {boolean} props.padding - Добавить отступы по бокам
 * @returns {JSX.Element}
 */
export const Container = ({ 
    children, 
    className = '', 
    size = 'full', 
    padding = true 
}) => {
    // Классы для разных размеров контейнера с улучшенной поддержкой десктопов и увеличенной шириной
    const sizeClasses = {
        sm: 'max-w-full sm:max-w-full md:max-w-full lg:max-w-screen-lg xl:max-w-screen-xl',
        md: 'max-w-full sm:max-w-full md:max-w-full lg:max-w-full xl:max-w-full',
        lg: 'max-w-full sm:max-w-full md:max-w-full lg:max-w-full xl:max-w-full',
        xl: 'max-w-full sm:max-w-full md:max-w-full lg:max-w-full xl:max-w-full',
        '2xl': 'max-w-full w-full',
        'full': 'max-w-full w-full'
    };
    
    // Улучшенные отступы для десктопов
    const paddingClasses = padding ? 'px-2 sm:px-3 md:px-4 lg:px-5' : '';
    
    return (
        <div className={`w-full mx-auto ${sizeClasses[size]} ${paddingClasses} ${className}`}>
            {children}
        </div>
    );
}; 