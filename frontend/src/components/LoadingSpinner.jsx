import React from "react";
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Компонент отображения индикатора загрузки с анимацией Framer Motion
 * @component
 * @param {Object} props - Свойства компонента
 * @param {boolean} [props.fullscreen=true] - Отображать на весь экран
 * @param {string} [props.size='md'] - Размер спиннера (xs, sm, md, lg, xl)
 * @param {string} [props.variant='primary'] - Вариант дизайна (primary, secondary, accent, white, food, service)
 * @param {string} [props.className=''] - Дополнительные CSS классы
 * @param {number} [props.duration=1.2] - Длительность анимации в секундах
 * @param {string} [props.text=''] - Текст под спиннером
 * @param {boolean} [props.showLogo=false] - Показывать логотип внутри спиннера
 * @param {boolean} [props.isDarkMode=false] - Включена ли темная тема
 * @param {boolean} [props.inline=false] - Встроенный режим, не на весь экран
 */
const LoadingSpinner = ({
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
    // Определяем конкретные классы по размеру вместо динамических значений
    const sizeClasses = {
        'xs': 'h-4 w-4 border-2',
        'sm': 'h-8 w-8 border-3',
        'md': 'h-16 w-16 border-4',
        'lg': 'h-24 w-24 border-[6px]',
        'xl': 'h-32 w-32 border-[8px]'
    };

    // Получаем толщину границы из класса размера
    const getBorderWidth = () => {
        if (size === 'xs') return 'border-2';
        if (size === 'sm') return 'border-3';
        if (size === 'md') return 'border-4';
        if (size === 'lg') return 'border-[6px]';
        if (size === 'xl') return 'border-[8px]';
        return 'border-4';
    };

    // Определяем цвета для разных вариантов дизайна на основе темы
    const getColorClasses = (variant) => {
        const variantColors = {
            'primary': isDarkMode 
                ? 'border-blue-500 border-t-transparent shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                : 'border-blue-600 border-t-transparent shadow-[0_0_15px_rgba(37,99,235,0.3)]',
            'secondary': isDarkMode 
                ? 'border-indigo-500 border-t-transparent shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
                : 'border-indigo-600 border-t-transparent shadow-[0_0_15px_rgba(79,70,229,0.3)]',
            'accent': isDarkMode 
                ? 'border-cyan-500 border-t-transparent shadow-[0_0_15px_rgba(6,182,212,0.5)]' 
                : 'border-cyan-600 border-t-transparent shadow-[0_0_15px_rgba(8,145,178,0.3)]',
            'white': 'border-white border-t-transparent shadow-[0_0_15px_rgba(255,255,255,0.3)]',
            'food': isDarkMode 
                ? 'border-green-500 border-t-transparent shadow-[0_0_15px_rgba(34,197,94,0.5)]' 
                : 'border-green-600 border-t-transparent shadow-[0_0_15px_rgba(22,163,74,0.3)]',
            'service': isDarkMode 
                ? 'border-orange-500 border-t-transparent shadow-[0_0_15px_rgba(249,115,22,0.5)]' 
                : 'border-orange-600 border-t-transparent shadow-[0_0_15px_rgba(234,88,12,0.3)]',
            'rating': isDarkMode 
                ? 'border-yellow-500 border-t-transparent shadow-[0_0_15px_rgba(234,179,8,0.5)]' 
                : 'border-yellow-600 border-t-transparent shadow-[0_0_15px_rgba(202,138,4,0.3)]',
            'danger': isDarkMode 
                ? 'border-red-500 border-t-transparent shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                : 'border-red-600 border-t-transparent shadow-[0_0_15px_rgba(220,38,38,0.3)]',
            'gray': isDarkMode 
                ? 'border-gray-400 border-t-transparent shadow-[0_0_15px_rgba(156,163,175,0.5)]' 
                : 'border-gray-500 border-t-transparent shadow-[0_0_15px_rgba(107,114,128,0.3)]',
        };
        
        return variantColors[variant] || variantColors.primary;
    };

    // Получаем цвет текста лого на основе выбранного варианта
    const getLogoColor = (variant) => {
        const logoColors = {
            'primary': isDarkMode ? 'text-blue-300' : 'text-blue-700',
            'secondary': isDarkMode ? 'text-indigo-300' : 'text-indigo-700',
            'accent': isDarkMode ? 'text-cyan-300' : 'text-cyan-700',
            'white': 'text-white',
            'food': isDarkMode ? 'text-green-300' : 'text-green-700',
            'service': isDarkMode ? 'text-orange-300' : 'text-orange-700',
            'rating': isDarkMode ? 'text-yellow-300' : 'text-yellow-700',
            'danger': isDarkMode ? 'text-red-300' : 'text-red-700',
            'gray': isDarkMode ? 'text-gray-300' : 'text-gray-700',
        };
        
        return logoColors[variant] || logoColors.primary;
    };

    // Получаем цвет для текста под спиннером
    const getTextColor = () => {
        return isDarkMode ? 'text-gray-200' : 'text-gray-700';
    };

    // Используем классы для стилизации спиннера
    const spinnerClasses = [
        'rounded-full',
        sizeClasses[size] || sizeClasses.md,
        getColorClasses(variant),
        className
    ].filter(Boolean).join(' ');

    // Варианты анимации для спиннера
    const spinnerVariants = {
        initial: {
            opacity: 0,
            scale: 0.8,
            rotate: 0
        },
        animate: {
            opacity: 1,
            scale: 1,
            rotate: 360,
            transition: {
                opacity: { duration: 0.3 },
                scale: { type: 'spring', stiffness: 300, damping: 15 },
                rotate: {
                    duration: duration,
                    repeat: Infinity,
                    ease: 'linear'
                }
            }
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            transition: {
                duration: 0.2
            }
        }
    };

    // Варианты анимации для внешнего спиннера (обратное вращение)
    const outerSpinnerVariants = {
        initial: {
            opacity: 0,
            scale: 1.2,
            rotate: 0
        },
        animate: {
            opacity: 0.3,
            scale: 1.2,
            rotate: -360,
            transition: {
                opacity: { duration: 0.3 },
                scale: { type: 'spring', stiffness: 200, damping: 20 },
                rotate: {
                    duration: duration * 1.5,
                    repeat: Infinity,
                    ease: 'linear'
                }
            }
        }
    };

    // Варианты анимации для контейнера
    const containerVariants = {
        initial: { opacity: 0 },
        animate: {
            opacity: 1,
            transition: {
                duration: 0.3
            }
        },
        exit: {
            opacity: 0,
            transition: {
                duration: 0.3
            }
        }
    };

    // Варианты анимации для текста
    const textVariants = {
        initial: {
            opacity: 0,
            y: 10
        },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                delay: 0.2,
                type: 'spring',
                stiffness: 300,
                damping: 15
            }
        },
        exit: {
            opacity: 0,
            y: 10,
            transition: {
                duration: 0.2
            }
        }
    };

    // Определяем фон для полноэкранного оверлея
    const overlayClass = isDarkMode 
        ? 'bg-gray-900 bg-opacity-70 backdrop-blur-sm' 
        : 'bg-gray-800 bg-opacity-50 backdrop-blur-sm';

    // Если спиннер полноэкранный и не inline
    if (fullscreen && !inline) {
        return (
            <motion.div
                className="fixed inset-0 flex flex-col items-center justify-center z-50"
                role="progressbar"
                aria-label="Загрузка"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                {...props}
            >
                <motion.div
                    className={`absolute inset-0 ${overlayClass}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                />

                <div className="flex flex-col items-center z-10">
                    <div className="relative">
                        {/* Основной спиннер */}
                        <motion.div
                            className={spinnerClasses}
                            variants={spinnerVariants}
                        />
                        
                        {/* Внешний спиннер для эффекта (более прозрачный) */}
                        <motion.div
                            className={`absolute inset-0 rounded-full ${sizeClasses[size]} ${getBorderWidth()} border-t-transparent ${
                                variant === 'white' 
                                    ? 'border-white/20' 
                                    : isDarkMode 
                                        ? 'border-gray-500/20' 
                                        : 'border-gray-300/30'
                            }`}
                            variants={outerSpinnerVariants}
                            initial="initial"
                            animate="animate"
                        />

                        {/* Логотип внутри спиннера */}
                        {showLogo && (
                            <motion.div
                                className="absolute inset-0 flex items-center justify-center"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 15 }}
                            >
                                <span className={`font-bold ${getLogoColor(variant)} ${
                                    size === 'xs' ? 'text-[8px]' : 
                                    size === 'sm' ? 'text-xs' : 
                                    size === 'md' ? 'text-sm' : 
                                    size === 'lg' ? 'text-base' : 
                                    'text-lg'
                                }`}></span>
                            </motion.div>
                        )}
                    </div>

                    {/* Текст под спиннером */}
                    {text && (
                        <motion.p
                            className={`mt-4 font-medium ${getTextColor()}`}
                            variants={textVariants}
                        >
                            {text}
                        </motion.p>
                    )}
                </div>
            </motion.div>
        );
    }

    // Если спиннер встроенный (не на весь экран)
    return (
        <div className="relative inline-flex">
            {/* Основной спиннер */}
            <motion.div
                className={`relative ${spinnerClasses}`}
                role="progressbar"
                aria-label="Загрузка"
                variants={spinnerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                {...props}
            />
            
            {/* Внешний спиннер для эффекта (более прозрачный) */}
            <motion.div
                className={`absolute inset-0 rounded-full ${sizeClasses[size]} ${getBorderWidth()} border-t-transparent ${
                    variant === 'white' 
                        ? 'border-white/20' 
                        : isDarkMode 
                            ? 'border-gray-500/20' 
                            : 'border-gray-300/30'
                }`}
                variants={outerSpinnerVariants}
                initial="initial"
                animate="animate"
            />

            {/* Логотип внутри спиннера */}
            {showLogo && (
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 15 }}
                >
                    <span className={`font-bold ${getLogoColor(variant)} ${
                        size === 'xs' ? 'text-[8px]' : 
                        size === 'sm' ? 'text-xs' : 
                        size === 'md' ? 'text-sm' : 
                        size === 'lg' ? 'text-base' : 
                        'text-lg'
                    }`}></span>
                </motion.div>
            )}
        </div>
    );
};

LoadingSpinner.propTypes = {
    fullscreen: PropTypes.bool,
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
    variant: PropTypes.oneOf(['primary', 'secondary', 'accent', 'white', 'food', 'service', 'rating', 'danger', 'gray']),
    className: PropTypes.string,
    duration: PropTypes.number,
    text: PropTypes.string,
    showLogo: PropTypes.bool,
    isDarkMode: PropTypes.bool,
    inline: PropTypes.bool
};

// Экспорт по умолчанию для обратной совместимости
export default LoadingSpinner;