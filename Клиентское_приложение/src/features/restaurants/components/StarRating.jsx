import React from 'react';
import PropTypes from 'prop-types';

/**
 * Размеры звездочек
 */
const SIZES = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl'
};

/**
 * Компонент для отображения рейтинга в виде звезд
 * 
 * @param {Object} props
 * @param {number} props.rating - Рейтинг от 0 до 5
 * @param {boolean} props.interactive - Можно ли менять рейтинг
 * @param {Function} props.onChange - Функция обратного вызова при изменении рейтинга (только для interactive=true)
 * @param {string} props.size - Размер звезд (sm, md, lg, xl)
 * @param {string} props.className - Дополнительные CSS классы
 * @returns {JSX.Element}
 */
export const StarRating = ({ 
    rating = 0,
    interactive = false,
    onChange,
    size = 'md',
    className = ''
}) => {
    // Округляем рейтинг до ближайшего 0.5
    const roundedRating = Math.round(rating * 2) / 2;
    
    // Обработчик нажатия на звезду
    const handleStarClick = (selectedRating) => {
        if (interactive && onChange) {
            onChange(selectedRating);
        }
    };
    
    // Обработчик наведения на звезду
    const handleStarHover = (event, selectedRating) => {
        if (!interactive) return;
        
        // Подсвечиваем все звезды до текущей
        const stars = event.currentTarget.parentNode.childNodes;
        for (let i = 0; i < stars.length; i++) {
            if (i < selectedRating) {
                stars[i].classList.add('text-yellow-500');
                stars[i].classList.remove('text-gray-300', 'dark:text-gray-600');
            } else {
                stars[i].classList.remove('text-yellow-500');
                stars[i].classList.add('text-gray-300', 'dark:text-gray-600');
            }
        }
    };
    
    // Обработчик ухода мыши со звезды
    const handleMouseLeave = (event) => {
        if (!interactive) return;
        
        // Возвращаем исходное состояние
        const stars = event.currentTarget.childNodes;
        for (let i = 0; i < stars.length; i++) {
            if (i < roundedRating) {
                stars[i].classList.add('text-yellow-500');
                stars[i].classList.remove('text-gray-300', 'dark:text-gray-600');
            } else {
                stars[i].classList.remove('text-yellow-500');
                stars[i].classList.add('text-gray-300', 'dark:text-gray-600');
            }
        }
    };
    
    // Создаем массив из 5 звезд
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        const isFilled = i <= roundedRating;
        const isHalfFilled = i - 0.5 === roundedRating;
        
        stars.push(
            <span
                key={i}
                onClick={() => handleStarClick(i)}
                onMouseEnter={interactive ? (e) => handleStarHover(e, i) : undefined}
                className={`${SIZES[size]} ${
                    isFilled 
                        ? 'text-yellow-500' 
                        : 'text-gray-300 dark:text-gray-600'
                } ${interactive ? 'cursor-pointer' : ''}`}
                role={interactive ? 'button' : 'presentation'}
                aria-label={interactive ? `Оценить на ${i} из 5` : `${roundedRating} из 5 звезд`}
            >
                ★
            </span>
        );
    }
    
    return (
        <div 
            className={`flex items-center ${className}`}
            onMouseLeave={interactive ? handleMouseLeave : undefined}
            aria-label={`Рейтинг: ${roundedRating} из 5`}
        >
            {stars}
        </div>
    );
};

StarRating.propTypes = {
    rating: PropTypes.number,
    interactive: PropTypes.bool,
    onChange: PropTypes.func,
    size: PropTypes.string,
    className: PropTypes.string
}; 