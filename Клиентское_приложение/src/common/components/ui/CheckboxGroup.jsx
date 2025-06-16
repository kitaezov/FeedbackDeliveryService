import React, { useState, useEffect } from 'react';

/**
 * Компонент группы чекбоксов
 * 
 * @param {Object} props - Свойства компонента
 * @param {Array} props.options - Массив опций в формате [{value: string, label: string}]
 * @param {Array} props.value - Массив выбранных значений
 * @param {Function} props.onChange - Обработчик изменения выбранных значений
 * @param {boolean} props.disabled - Флаг отключения компонента
 * @param {string} props.className - Дополнительные CSS классы
 * @returns {JSX.Element}
 */
export const CheckboxGroup = ({
    options = [],
    value = [],
    onChange,
    disabled = false,
    className = ''
}) => {
    const [checkedValues, setCheckedValues] = useState(value);
    
    // Синхронизация с внешним значением
    useEffect(() => {
        setCheckedValues(value);
    }, [value]);
    
    // Обработчик изменения состояния отдельного чекбокса
    const handleChange = (optionValue) => {
        let newValues;
        
        if (checkedValues.includes(optionValue)) {
            // Удаляем значение, если оно уже выбрано
            newValues = checkedValues.filter(val => val !== optionValue);
        } else {
            // Добавляем значение, если оно еще не выбрано
            newValues = [...checkedValues, optionValue];
        }
        
        setCheckedValues(newValues);
        onChange(newValues);
    };
    
    // Проверка, выбрана ли опция
    const isChecked = (optionValue) => {
        return checkedValues.includes(optionValue);
    };
    
    // Если нет опций, не рендерим ничего
    if (options.length === 0) {
        return null;
    }
    
    return (
        <div className={`space-y-2 ${className}`}>
            {options.map((option) => (
                <div key={option.value} className="flex items-center">
                    <input
                        type="checkbox"
                        id={`checkbox-${option.value}`}
                        checked={isChecked(option.value)}
                        onChange={() => !disabled && handleChange(option.value)}
                        disabled={disabled}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <label
                        htmlFor={`checkbox-${option.value}`}
                        className={`ml-2 block text-sm ${
                            disabled 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-gray-700 dark:text-gray-300 cursor-pointer'
                        }`}
                    >
                        {option.label}
                    </label>
                </div>
            ))}
        </div>
    );
}; 