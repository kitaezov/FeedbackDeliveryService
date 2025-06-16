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
    // Классы для разных размеров контейнера - все размеры настроены на максимальную ширину
    const sizeClasses = {
        sm: 'max-w-full sm:max-w-full md:max-w-full lg:max-w-full xl:max-w-full 2xl:max-w-full',
        md: 'max-w-full sm:max-w-full md:max-w-full lg:max-w-full xl:max-w-full 2xl:max-w-full',
        lg: 'max-w-full sm:max-w-full md:max-w-full lg:max-w-full xl:max-w-full 2xl:max-w-full',
        xl: 'max-w-full sm:max-w-full md:max-w-full lg:max-w-full xl:max-w-full 2xl:max-w-full',
        '2xl': 'max-w-full w-full',
        'full': 'max-w-full w-full'
    };
    
    // Улучшенные отступы для десктопов - увеличены для лучшего использования пространства
    const paddingClasses = padding ? 'px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16' : '';
    
    return (
        <div className={`w-full mx-auto ${sizeClasses[size]} ${paddingClasses} ${className}`}>
            {children}
        </div>
    );
}; 