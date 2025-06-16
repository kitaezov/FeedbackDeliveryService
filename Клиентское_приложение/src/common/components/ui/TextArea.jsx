import React, { forwardRef } from 'react';

/**
 * Компонент многострочного текстового поля
 * 
 * @param {Object} props
 * @param {string} props.id - Идентификатор поля
 * @param {string} props.name - Имя поля
 * @param {string} props.placeholder - Текст-подсказка
 * @param {string} props.value - Значение поля
 * @param {Function} props.onChange - Обработчик изменения значения
 * @param {string} props.className - Дополнительные CSS классы
 * @param {number} props.rows - Количество строк
 * @param {boolean} props.disabled - Флаг отключения поля
 * @param {boolean} props.required - Флаг обязательности поля
 * @param {string} props.error - Сообщение об ошибке
 * @returns {JSX.Element}
 */
export const TextArea = forwardRef(({
    id,
    name,
    placeholder,
    value,
    onChange,
    className = '',
    rows = 3,
    disabled = false,
    required = false,
    error,
    ...rest
}, ref) => {
    // Базовые классы
    const baseClasses = 'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm';
    
    // Классы в зависимости от состояния
    const stateClasses = error
        ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:focus:border-red-500 dark:bg-gray-800 dark:text-red-400'
        : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500 dark:border-gray-700 dark:focus:border-primary-500 dark:bg-gray-800 dark:text-white';
    
    // Классы при отключенном состоянии
    const disabledClasses = disabled 
        ? 'bg-gray-100 cursor-not-allowed opacity-75 dark:bg-gray-900'
        : 'bg-white dark:bg-gray-800';
    
    return (
        <div className={`w-full ${className}`}>
            <textarea
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                disabled={disabled}
                required={required}
                ref={ref}
                className={`${baseClasses} ${stateClasses} ${disabledClasses}`}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? `${id}-error` : undefined}
                {...rest}
            />
            
            {error && (
                <p id={`${id}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}); 