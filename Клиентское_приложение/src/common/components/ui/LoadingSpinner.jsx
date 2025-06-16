import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Компонент индикатора загрузки
 * 
 * @component
 * @param {Object} props - Свойства компонента
 * @param {boolean} [props.fullscreen=true] - Отображать на весь экран
 * @param {string} [props.size='md'] - Размер спиннера
 * @param {string} [props.variant='primary'] - Цветовой вариант
 * @param {string} [props.className=''] - Дополнительные CSS классы
 * @param {number} [props.duration=1.2] - Длительность анимации в секундах
 * @param {string} [props.text=''] - Текст под спиннером
 * @param {boolean} [props.showLogo=false] - Показывать логотип в центре
 * @param {boolean} [props.isDarkMode=false] - Тёмная тема
 * @param {boolean} [props.inline=false] - Встроенный режим (без центрирования)
 * @returns {JSX.Element} React-компонент
 */
export const LoadingSpinner = ({
    fullscreen = true,
    size = 'md',
    variant = 'primary',
    className = '',
    duration = 1.2,
    text = '',
    showLogo = false,
    isDarkMode = false,
    inline = false,
    ...props
}) => {
    // Получаем размер на основе параметра size
    const getSize = () => {
        const sizes = {
            'xs': 'w-5 h-5',
            'sm': 'w-8 h-8',
            'md': 'w-12 h-12',
            'lg': 'w-16 h-16',
            'xl': 'w-24 h-24'
        };
        return sizes[size] || sizes.md;
    };
    
    // Получаем толщину бордюра на основе размера
    const getBorderWidth = () => {
        const widths = {
            'xs': 'border-2',
            'sm': 'border-2',
            'md': 'border-3',
            'lg': 'border-4',
            'xl': 'border-4'
        };
        return widths[size] || 'border-3';
    };
    
    // Получаем цветовые классы на основе варианта
    const getColorClasses = (variant) => {
        const variants = {
            'primary': isDarkMode 
                ? 'border-gray-500 border-t-transparent' 
                : 'border-gray-600 border-t-transparent',
            'secondary': isDarkMode 
                ? 'border-gray-400 border-t-transparent' 
                : 'border-gray-600 border-t-transparent',
            'success': isDarkMode 
                ? 'border-green-500 border-t-transparent' 
                : 'border-green-600 border-t-transparent',
            'warning': isDarkMode 
                ? 'border-yellow-400 border-t-transparent' 
                : 'border-yellow-500 border-t-transparent',
            'danger': isDarkMode 
                ? 'border-red-500 border-t-transparent' 
                : 'border-red-600 border-t-transparent',
            'light': 'border-white/80 border-t-transparent',
            'dark': 'border-gray-800 border-t-transparent',
            'gray': isDarkMode 
                ? 'border-gray-400 border-t-transparent' 
                : 'border-gray-500 border-t-transparent',
        };
        
        return variants[variant] || variants.primary;
    };
    
    // Получаем цвет логотипа на основе варианта
    const getLogoColor = (variant) => {
        const colors = {
            'primary': isDarkMode ? '#6B7280' : '#4B5563',
            'secondary': isDarkMode ? '#9CA3AF' : '#4B5563',
            'success': isDarkMode ? '#10B981' : '#059669',
            'warning': isDarkMode ? '#FBBF24' : '#F59E0B',
            'danger': isDarkMode ? '#EF4444' : '#DC2626',
            'light': '#F9FAFB',
            'dark': '#1F2937',
            'gray': isDarkMode ? '#9CA3AF' : '#6B7280',
        };
        
        return colors[variant] || colors.primary;
    };
    
    // Получаем цвет текста на основе варианта
    const getTextColor = () => {
        return isDarkMode ? 'text-gray-300' : 'text-gray-700';
    };
    
    // Если fullscreen, отображаем на весь экран
    if (fullscreen && !inline) {
        return (
            <div className={`fixed inset-0 flex flex-col items-center justify-center z-50 ${isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'} ${className}`} {...props}>
                <div className="relative">
                    <motion.div
                        className={`rounded-full ${getSize()} ${getBorderWidth()} ${getColorClasses(variant)}`}
                        animate={{ rotate: 360 }}
                        transition={{ 
                            duration: duration, 
                            ease: "linear", 
                            repeat: Infinity 
                        }}
                    />
                    
                    {/* Логотип в центре спиннера (при необходимости) */}
                    {showLogo && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg width="50%" height="50%" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill={getLogoColor(variant)} />
                                <path d="M2 17L12 22L22 17" stroke={getLogoColor(variant)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 12L12 17L22 12" stroke={getLogoColor(variant)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    )}
                </div>
                
                {/* Текст под спиннером */}
                {text && <p className={`mt-4 ${getTextColor()} text-sm font-medium`}>{text}</p>}
            </div>
        );
    }
    
    // Встроенный режим или обычный режим
    return (
        <div className={`${inline ? 'inline-flex' : 'flex flex-col items-center justify-center'} ${className}`} {...props}>
            <div className="relative">
                <motion.div
                    className={`rounded-full ${getSize()} ${getBorderWidth()} ${getColorClasses(variant)}`}
                    animate={{ rotate: 360 }}
                    transition={{ 
                        duration: duration, 
                        ease: "linear", 
                        repeat: Infinity 
                    }}
                />
                
                {/* Логотип в центре спиннера (при необходимости) */}
                {showLogo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg width="50%" height="50%" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill={getLogoColor(variant)} />
                            <path d="M2 17L12 22L22 17" stroke={getLogoColor(variant)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 12L12 17L22 12" stroke={getLogoColor(variant)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                )}
            </div>
            
            {/* Текст под спиннером */}
            {text && <p className={`mt-2 ${getTextColor()} text-sm font-medium`}>{text}</p>}
        </div>
    );
};

// Проверка типов props
LoadingSpinner.propTypes = {
    fullscreen: PropTypes.bool,
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
    variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'danger', 'light', 'dark', 'gray']),
    className: PropTypes.string,
    duration: PropTypes.number,
    text: PropTypes.string,
    showLogo: PropTypes.bool,
    isDarkMode: PropTypes.bool,
    inline: PropTypes.bool
}; 

// Экспорт по умолчанию для обратной совместимости
export default LoadingSpinner; 