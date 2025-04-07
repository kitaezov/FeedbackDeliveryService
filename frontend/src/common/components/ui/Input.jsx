import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Компонент текстового поля ввода
 * 
 * @param {Object} props
 * @param {string} props.id - ID поля ввода
 * @param {string} props.name - Имя поля ввода
 * @param {string} props.type - Тип поля ввода (text, password, email, number и т.д.)
 * @param {string} props.label - Текст лейбла
 * @param {string} props.placeholder - Плейсхолдер
 * @param {boolean} props.required - Обязательно ли поле для заполнения
 * @param {boolean} props.disabled - Заблокировано ли поле
 * @param {string} props.error - Текст ошибки
 * @param {string} props.className - Дополнительные CSS классы
 * @param {Function} props.onChange - Обработчик изменения значения
 * @param {string} props.value - Значение поля
 * @param {string} props.defaultValue - Значение по умолчанию
 * @param {React.ReactNode} props.startIcon - Иконка в начале поля
 * @param {React.ReactNode} props.endIcon - Иконка в конце поля
 * @param {boolean} props.fullWidth - Растянуть поле на всю ширину родителя
 * @returns {JSX.Element}
 */
export const Input = forwardRef(({ 
    id, 
    name, 
    type = 'text', 
    label,
    placeholder,
    required = false,
    disabled = false,
    error,
    className = '',
    onChange,
    value,
    defaultValue,
    startIcon,
    endIcon,
    fullWidth = false,
    ...rest
}, ref) => {
    // Базовые классы для поля ввода
    const baseInputClasses = 'block px-3 py-2 bg-white dark:bg-gray-900 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors';
    
    // Классы для состояния ошибки
    const errorInputClasses = error 
        ? 'border-red-500 dark:border-red-500 text-red-900 dark:text-red-300 placeholder-red-300 dark:placeholder-red-500' 
        : 'border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600';
    
    // Классы для отключенного состояния
    const disabledInputClasses = disabled 
        ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-75' 
        : '';
    
    // Классы для ширины поля
    const widthClasses = fullWidth ? 'w-full' : '';
    
    // Классы для поля с иконками
    const withStartIconClasses = startIcon ? 'pl-10' : '';
    const withEndIconClasses = endIcon ? 'pr-10' : '';
    
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
                {/* Иконка в начале поля */}
                {startIcon && (
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 dark:text-gray-600">
                        {startIcon}
                    </div>
                )}
                
                <input
                    ref={ref}
                    id={id}
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={`${baseInputClasses} ${errorInputClasses} ${disabledInputClasses} ${widthClasses} ${withStartIconClasses} ${withEndIconClasses}`}
                    onChange={onChange}
                    value={value}
                    defaultValue={defaultValue}
                    {...rest}
                />
                
                {/* Иконка в конце поля */}
                {endIcon && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-600">
                        {endIcon}
                    </div>
                )}
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
Input.displayName = 'Input';

// Проверка типов props
Input.propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    type: PropTypes.string,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    error: PropTypes.string,
    className: PropTypes.string,
    onChange: PropTypes.func,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    defaultValue: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    startIcon: PropTypes.node,
    endIcon: PropTypes.node,
    fullWidth: PropTypes.bool
}; 