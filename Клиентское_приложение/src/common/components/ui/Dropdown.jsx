import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Компонент выпадающего меню
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.trigger - Элемент, при клике на который открывается выпадающее меню
 * @param {Array} props.items - Массив элементов меню [{ label, onClick, icon, disabled }]
 * @param {string} props.align - Выравнивание меню (left, right)
 * @param {string} props.width - Ширина меню (auto, sm, md, lg)
 * @param {string} props.className - Дополнительные CSS классы
 * @returns {JSX.Element}
 */
export const Dropdown = ({
    trigger,
    items = [],
    align = 'left',
    width = 'auto',
    className = ''
}) => {
    // Состояние открытия выпадающего меню
    const [isOpen, setIsOpen] = useState(false);
    
    // Ссылка на DOM-элемент выпадающего меню
    const dropdownRef = useRef(null);
    
    // Определяем классы для выравнивания
    const alignClasses = {
        left: 'left-0',
        right: 'right-0'
    };
    
    // Определяем классы для ширины
    const widthClasses = {
        auto: 'w-auto',
        sm: 'w-40',
        md: 'w-48',
        lg: 'w-56'
    };
    
    // Обработчик переключения состояния меню
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };
    
    // Обработчик выбора пункта меню
    const handleItemClick = (onClick) => {
        if (onClick) {
            onClick();
        }
        setIsOpen(false);
    };
    
    // Обработчик клика вне компонента для закрытия меню
    const handleOutsideClick = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setIsOpen(false);
        }
    };
    
    // Устанавливаем обработчик клика при монтировании компонента
    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick);
        
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);
    
    return (
        <div ref={dropdownRef} className={`relative inline-block ${className}`}>
            {/* Триггер для открытия меню */}
            <div onClick={toggleDropdown} className="cursor-pointer">
                {trigger}
            </div>
            
            {/* Выпадающее меню */}
            {isOpen && (
                <div 
                    className={`absolute z-10 mt-2 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${alignClasses[align]} ${widthClasses[width]}`}
                >
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        {items.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => handleItemClick(item.onClick)}
                                disabled={item.disabled}
                                className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                                    item.disabled 
                                        ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                                role="menuitem"
                            >
                                {item.icon && (
                                    <span className="mr-2">{item.icon}</span>
                                )}
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Проверка типов props
Dropdown.propTypes = {
    trigger: PropTypes.node.isRequired,
    items: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            onClick: PropTypes.func,
            icon: PropTypes.node,
            disabled: PropTypes.bool
        })
    ),
    align: PropTypes.oneOf(['left', 'right']),
    width: PropTypes.oneOf(['auto', 'sm', 'md', 'lg']),
    className: PropTypes.string
}; 