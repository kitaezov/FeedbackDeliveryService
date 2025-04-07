import React from "react";
import PropTypes from 'prop-types';

/**
 * Компонент анимированной кнопки с эффектами наведения и нажатия
 * @component
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние элементы кнопки
 * @param {string} [props.className=''] - Дополнительные CSS классы
 * @param {string} [props.type='button'] - Тип кнопки (button, submit, reset)
 * @param {Function} [props.onClick] - Обработчик клика
 * @returns {React.Element} Анимированная кнопка
 */
const AnimatedButton = ({
    children,
    className = '',
    type = 'button',
    onClick,
    disabled = false,
    ...props
}) => {
    /**
     * Обработчик клика по кнопке с проверкой состояния
     * @param {Event} e - Событие клика
     */
    const handleClick = (e) => {
        try {
            if (!disabled && onClick) {
                onClick(e);
            }
        } catch (error) {
            console.error('Ошибка при обработке клика:', error);
        }
    };

    return (
        <button
            type={type}
            disabled={disabled}
            className={`
                px-6 py-2 
                rounded-lg 
                transition duration-300 ease-in-out 
                transform hover:scale-105 active:scale-95 
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''} 
                ${className}
            `}
            onClick={handleClick}
            {...props}
        >
            {children}
        </button>
    );
};

// Проверка типов props
AnimatedButton.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
    onClick: PropTypes.func,
    disabled: PropTypes.bool
};

// Значения по умолчанию
AnimatedButton.defaultProps = {
    className: '',
    type: 'button',
    disabled: false
};

export { AnimatedButton };
export default AnimatedButton;