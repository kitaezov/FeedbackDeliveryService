import React from 'react';
import PropTypes from 'prop-types';

/**
 * Компонент аватара пользователя
 * 
 * @param {Object} props
 * @param {string} props.src - URL изображения
 * @param {string} props.alt - Альтернативный текст
 * @param {string} props.name - Имя пользователя (для аватара с инициалами)
 * @param {string} props.size - Размер аватара (xs, sm, md, lg, xl)
 * @param {boolean} props.bordered - Добавить рамку
 * @param {string} props.status - Статус пользователя (online, offline, away, busy)
 * @param {string} props.className - Дополнительные CSS классы
 * @returns {JSX.Element}
 */
export const Avatar = ({
    src,
    alt = 'Avatar',
    name,
    size = 'md',
    bordered = false,
    status,
    className = ''
}) => {
    // Определяем размеры для разных вариантов
    const sizeClasses = {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-xl'
    };
    
    // Классы для рамки
    const borderClasses = bordered 
        ? 'border-2 border-white dark:border-gray-800 shadow-sm' 
        : '';
    
    // Определяем цвета для разных статусов
    const statusColors = {
        online: 'bg-green-500',
        offline: 'bg-gray-400',
        away: 'bg-yellow-500',
        busy: 'bg-red-500'
    };
    
    // Получаем инициалы из имени
    const getInitials = () => {
        if (!name) return '';
        
        const nameParts = name.split(' ').filter(Boolean);
        
        if (nameParts.length === 0) return '';
        if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
        
        return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
    };
    
    // Определяем случайный цвет фона на основе имени
    const getBackgroundColor = () => {
        if (!name) return 'bg-gray-500 dark:bg-gray-600';
        
        const colors = [
            'bg-gray-700 dark:bg-gray-600',
            'bg-green-500 dark:bg-green-600',
            'bg-yellow-500 dark:bg-yellow-600',
            'bg-red-500 dark:bg-red-600',
            'bg-purple-500 dark:bg-purple-600',
            'bg-pink-500 dark:bg-pink-600',
            'bg-indigo-500 dark:bg-indigo-600',
            'bg-teal-500 dark:bg-teal-600'
        ];
        
        // Используем простой алгоритм для получения стабильного цвета на основе имени
        const hashCode = name.split('').reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);
        
        return colors[Math.abs(hashCode) % colors.length];
    };
    
    return (
        <div className={`relative inline-flex transition-all duration-300 ${className}`}>
            {src ? (
                // Аватар с изображением
                <img
                    src={src}
                    alt={alt}
                    className={`rounded-full object-cover ${sizeClasses[size]} ${borderClasses}`}
                />
            ) : (
                // Аватар с инициалами
                <div
                    className={`rounded-full flex items-center justify-center text-white font-medium ${sizeClasses[size]} ${borderClasses} ${getBackgroundColor()} transition-colors duration-300`}
                    aria-label={name || alt}
                >
                    {getInitials()}
                </div>
            )}
            
            {/* Индикатор статуса */}
            {status && (
                <span 
                    className={`absolute bottom-0 right-0 block rounded-full ${
                        size === 'xs' ? 'w-1.5 h-1.5' : 
                        size === 'sm' ? 'w-2 h-2' : 
                        size === 'md' ? 'w-2.5 h-2.5' : 
                        size === 'lg' ? 'w-3 h-3' : 
                        'w-3.5 h-3.5'
                    } ${statusColors[status]} ring-2 ring-white dark:ring-gray-800 transition-colors duration-300`}
                ></span>
            )}
        </div>
    );
};

// Проверка типов props
Avatar.propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string,
    name: PropTypes.string,
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
    bordered: PropTypes.bool,
    status: PropTypes.oneOf(['online', 'offline', 'away', 'busy']),
    className: PropTypes.string
}; 