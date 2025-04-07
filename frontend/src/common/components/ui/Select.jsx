import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Компонент выпадающего списка
 * 
 * @param {Object} props
 * @param {string} props.id - ID селекта
 * @param {string} props.name - Имя селекта
 * @param {string} props.label - Текст лейбла
 * @param {string} props.placeholder - Плейсхолдер
 * @param {Array} props.options - Массив опций [{ value, label }]
 * @param {boolean} props.required - Обязательно ли поле для заполнения
 * @param {boolean} props.disabled - Заблокировано ли поле
 * @param {string} props.error - Текст ошибки
 * @param {string} props.className - Дополнительные CSS классы
 * @param {Function} props.onChange - Обработчик изменения значения
 * @param {string|number} props.value - Значение селекта
 * @param {boolean} props.fullWidth - Растянуть селект на всю ширину родителя
 * @returns {JSX.Element}
 */
export const Select = forwardRef(({ 
    id, 
    name, 
    label,
    placeholder = 'Выберите...',
    options = [],
    required = false,
    disabled = false,
    error,
    className = '',
    onChange,
    value,
    fullWidth = false,
    ...rest
}, ref) => {
    // Базовые классы для селекта
    const baseSelectClasses = 'block px-3 py-2 bg-white dark:bg-gray-900 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors appearance-none';
    
    // Классы для состояния ошибки
    const errorSelectClasses = error 
        ? 'border-red-500 dark:border-red-500 text-red-900 dark:text-red-300' 
        : 'border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100';
    
    // Классы для отключенного состояния
    const disabledSelectClasses = disabled 
        ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-75' 
        : '';
    
    // Классы для ширины селекта
    const widthClasses = fullWidth ? 'w-full' : '';
    
    return (
        <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
            {label && (
                <label 
                    htmlFor={id} 
                    className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    {label}
                    {required && <span className="ml-1 text-red-500">*</span>}
                </label>
            )}
            
            <div className="relative">
                <select
                    ref={ref}
                    id={id}
                    name={name}
                    required={required}
                    disabled={disabled}
                    className={`${baseSelectClasses} ${errorSelectClasses} ${disabledSelectClasses} ${widthClasses} pr-10`}
                    onChange={onChange}
                    value={value}
                    {...rest}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                
                {/* Иконка стрелки */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg 
                        className="w-5 h-5 text-gray-400 dark:text-gray-600" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            
            {/* Сообщение об ошибке */}
            {error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
});

// Устанавливаем отображаемое имя компонента
Select.displayName = 'Select';

// Проверка типов props
Select.propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number
            ]).isRequired,
            label: PropTypes.string.isRequired
        })
    ),
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    error: PropTypes.string,
    className: PropTypes.string,
    onChange: PropTypes.func,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    fullWidth: PropTypes.bool
}; 