import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Компонент всплывающей подсказки
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Элемент, для которого отображается подсказка
 * @param {string} props.content - Содержимое подсказки
 * @param {string} props.position - Позиция подсказки (top, right, bottom, left)
 * @param {string} props.className - Дополнительные CSS классы
 * @returns {JSX.Element}
 */
export const Tooltip = ({
    children,
    content,
    position = 'top',
    className = ''
}) => {
    // Состояние отображения подсказки
    const [isVisible, setIsVisible] = useState(false);
    
    // Ссылка на родительский элемент
    const tooltipRef = useRef(null);
    
    // Определяем классы для разных позиций
    const positionClasses = {
        top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
        right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
        bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 transform -translate-y-1/2 mr-2'
    };
    
    // Определяем классы для стрелки
    const arrowClasses = {
        top: 'bottom-[-5px] left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
        right: 'left-[-5px] top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
        bottom: 'top-[-5px] left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
        left: 'right-[-5px] top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent'
    };
    
    // Показать подсказку
    const showTooltip = () => {
        setIsVisible(true);
    };
    
    // Скрыть подсказку
    const hideTooltip = () => {
        setIsVisible(false);
    };
    
    return (
        <div 
            ref={tooltipRef}
            className={`relative inline-block ${className}`}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
        >
            {children}
            
            {isVisible && content && (
                <div 
                    className={`absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-gray-700 rounded shadow-sm max-w-xs ${positionClasses[position]}`}
                    role="tooltip"
                >
                    {content}
                    <div 
                        className={`absolute w-0 h-0 border-4 border-solid border-gray-900 dark:border-gray-700 ${arrowClasses[position]}`}
                    ></div>
                </div>
            )}
        </div>
    );
};

// Проверка типов props
Tooltip.propTypes = {
    children: PropTypes.node.isRequired,
    content: PropTypes.string.isRequired,
    position: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
    className: PropTypes.string
}; 