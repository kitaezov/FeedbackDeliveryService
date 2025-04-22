import React, { useState, useEffect } from 'react';

/**
 * Компонент для выбора диапазона значений
 * 
 * @param {Object} props - Свойства компонента
 * @param {number} props.min - Минимальное значение
 * @param {number} props.max - Максимальное значение
 * @param {number} props.step - Шаг изменения значения
 * @param {Array} props.value - Текущее значение [min, max]
 * @param {Function} props.onChange - Обработчик изменения значения
 * @param {boolean} props.disabled - Флаг отключения компонента
 * @param {Object} props.marks - Метки для отображения (ключ - значение, значение - текст)
 * @param {string} props.valueLabelDisplay - Режим отображения значений ('auto', 'on', 'off')
 * @returns {JSX.Element}
 */
export const RangeSlider = ({
    min = 0,
    max = 100,
    step = 1,
    value = [min, max],
    onChange,
    disabled = false,
    marks = {},
    valueLabelDisplay = 'off',
    className = ''
}) => {
    const [localValue, setLocalValue] = useState(value);
    const [isDragging, setIsDragging] = useState(false);
    
    // Синхронизация с внешним значением
    useEffect(() => {
        setLocalValue(value);
    }, [value]);
    
    // Обработчик изменения минимального значения
    const handleMinChange = (e) => {
        const newMin = Math.min(Number(e.target.value), localValue[1] - step);
        const newValues = [newMin, localValue[1]];
        setLocalValue(newValues);
        if (!isDragging) onChange(newValues);
    };
    
    // Обработчик изменения максимального значения
    const handleMaxChange = (e) => {
        const newMax = Math.max(Number(e.target.value), localValue[0] + step);
        const newValues = [localValue[0], newMax];
        setLocalValue(newValues);
        if (!isDragging) onChange(newValues);
    };
    
    // Обработчик завершения перетаскивания
    const handleDragEnd = () => {
        setIsDragging(false);
        onChange(localValue);
    };
    
    // Генерация меток
    const renderMarks = () => {
        return Object.entries(marks).map(([value, label]) => (
            <div 
                key={value}
                className="absolute text-xs text-gray-500"
                style={{
                    left: `${((Number(value) - min) / (max - min)) * 100}%`,
                    transform: 'translateX(-50%)',
                    top: '20px'
                }}
            >
                {label}
            </div>
        ));
    };
    
    // Расчет процентов для позиционирования
    const minPercent = ((localValue[0] - min) / (max - min)) * 100;
    const maxPercent = ((localValue[1] - min) / (max - min)) * 100;
    
    return (
        <div className={`relative pt-1 ${className}`}>
            <div className="relative h-2 mt-8 mb-6">
                {/* Основная линия */}
                <div className="h-1 bg-gray-200 rounded-full"></div>
                
                {/* Активная часть линии */}
                <div 
                    className="absolute h-1 bg-blue-500 rounded-full"
                    style={{
                        left: `${minPercent}%`,
                        width: `${maxPercent - minPercent}%`
                    }}
                ></div>
                
                {/* Ползунок минимума */}
                <div 
                    className={`absolute w-5 h-5 rounded-full bg-white border-2 border-blue-500 shadow cursor-pointer
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{ left: `${minPercent}%`, top: '-8px', transform: 'translateX(-50%)' }}
                    onMouseDown={() => !disabled && setIsDragging(true)}
                    onMouseUp={handleDragEnd}
                    onMouseLeave={handleDragEnd}
                ></div>
                
                {/* Ползунок максимума */}
                <div 
                    className={`absolute w-5 h-5 rounded-full bg-white border-2 border-blue-500 shadow
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{ left: `${maxPercent}%`, top: '-8px', transform: 'translateX(-50%)' }}
                    onMouseDown={() => !disabled && setIsDragging(true)}
                    onMouseUp={handleDragEnd}
                    onMouseLeave={handleDragEnd}
                ></div>
                
                {/* Отображение меток */}
                {renderMarks()}
            </div>
            
            {/* Отображение текущих значений */}
            {valueLabelDisplay !== 'off' && (
                <div className="flex justify-between mt-2">
                    <span className="text-sm font-medium text-gray-700">{localValue[0]}</span>
                    <span className="text-sm font-medium text-gray-700">{localValue[1]}</span>
                </div>
            )}
            
            {/* Скрытые инпуты для доступности */}
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={localValue[0]}
                onChange={handleMinChange}
                disabled={disabled}
                className="sr-only"
                aria-label="Минимальное значение"
            />
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={localValue[1]}
                onChange={handleMaxChange}
                disabled={disabled}
                className="sr-only"
                aria-label="Максимальное значение"
            />
        </div>
    );
}; 