import React from "react";
import PropTypes from 'prop-types';

/**
 * Компонент отображения индикатора загрузки
 * @component
 * @param {Object} props - Свойства компонента
 * @param {boolean} [props.fullscreen=true] - Отображать на весь экран
 * @param {string} [props.size='16'] - Размер спиннера (в пикселях)
 * @param {string} [props.borderColor='cyan-500'] - Цвет границы спиннера
 * @param {string} [props.className=''] - Дополнительные CSS классы
 */
const LoadingSpinner = ({
                            fullscreen = true,
                            size = '16',
                            borderColor = 'white',
                            className = '',
                            ...props
                        }) => {
    try {
        // Базовые классы для спиннера
        const spinnerClasses = [
            'animate-spin',
            'rounded-full',
            `h-${size}`,
            `w-${size}`,
            'border-4',
            `border-${borderColor}`,
            'border-t-transparent',
            className
        ].filter(Boolean).join(' ');

        // Если спиннер полноэкранный
        if (fullscreen) {
            return (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    role="progressbar"
                    aria-label="Загрузка"
                    {...props}
                >
                    <div className={spinnerClasses}></div>
                </div>
            );
        }

        // Если спиннер встроенный
        return (
            <div
                className={spinnerClasses}
                role="progressbar"
                aria-label="Загрузка"
                {...props}
            />
        );
    } catch (error) {
        console.error('Ошибка при рендеринге LoadingSpinner:', error);
        return null;
    }
};

LoadingSpinner.propTypes = {
    fullscreen: PropTypes.bool,
    size: PropTypes.string,
    borderColor: PropTypes.string,
    className: PropTypes.string
};


export { LoadingSpinner };