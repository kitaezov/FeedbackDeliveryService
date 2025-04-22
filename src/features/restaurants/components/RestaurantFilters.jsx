import React, { useState, useEffect } from 'react';
import { 
    Card, 
    Button, 
    Select
} from '../../../common/components/ui';

/**
 * Custom RangeSlider component to replace the missing UI component
 */
const RangeSlider = ({ 
    min, 
    max, 
    step = 1, 
    value = [min, max], 
    onChange, 
    disabled, 
    marks, 
    valueLabelDisplay 
}) => {
    const [localValue, setLocalValue] = useState(value);
    
    const handleChange = (e, index) => {
        const newValue = [...localValue];
        newValue[index] = parseFloat(e.target.value);
        setLocalValue(newValue);
        onChange && onChange(newValue);
    };
    
    return (
        <div className="my-4 px-2">
            <div className="flex justify-between mb-2">
                {Object.entries(marks || {}).map(([key, label]) => (
                    <span key={key} className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                ))}
            </div>
            <div className="flex gap-4">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={localValue[0]}
                    onChange={(e) => handleChange(e, 0)}
                    disabled={disabled}
                    className="w-full accent-blue-500"
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={localValue[1]}
                    onChange={(e) => handleChange(e, 1)}
                    disabled={disabled}
                    className="w-full accent-blue-500"
                />
            </div>
            {valueLabelDisplay === "auto" && (
                <div className="flex justify-between mt-1">
                    <span className="text-xs font-medium">Мин: {localValue[0]}</span>
                    <span className="text-xs font-medium">Макс: {localValue[1]}</span>
                </div>
            )}
        </div>
    );
};

/**
 * Custom CheckboxGroup component to replace the missing UI component
 */
const CheckboxGroup = ({ options = [], value = [], onChange, disabled }) => {
    const handleChange = (optionValue) => {
        const newValue = value.includes(optionValue)
            ? value.filter(v => v !== optionValue)
            : [...value, optionValue];
        
        onChange && onChange(newValue);
    };
    
    return (
        <div className="space-y-2">
            {options.map((option) => (
                <div key={option.value} className="flex items-center">
                    <input
                        type="checkbox"
                        id={`checkbox-${option.value}`}
                        checked={value.includes(option.value)}
                        onChange={() => handleChange(option.value)}
                        disabled={disabled}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label 
                        htmlFor={`checkbox-${option.value}`}
                        className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                    >
                        {option.label}
                    </label>
                </div>
            ))}
        </div>
    );
};

/**
 * Компонент фильтров для списка ресторанов
 * 
 * @param {Object} props - Свойства компонента
 * @param {Object} props.filters - Текущие фильтры
 * @param {Function} props.onFiltersChange - Обработчик изменения фильтров
 * @param {Array} props.cuisines - Список доступных кухонь
 * @param {boolean} props.isLoading - Состояние загрузки
 * @returns {JSX.Element}
 */
export const RestaurantFilters = ({ 
    filters, 
    onFiltersChange, 
    cuisines = [], 
    isLoading = false 
}) => {
    const [localFilters, setLocalFilters] = useState(filters || {});
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    
    // При изменении внешних фильтров, обновляем локальные
    useEffect(() => {
        setLocalFilters(filters || {});
    }, [filters]);
    
    // Обработчик изменения фильтров
    const handleFilterChange = (name, value) => {
        setLocalFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    // Применение фильтров
    const applyFilters = () => {
        onFiltersChange(localFilters);
        setShowMobileFilters(false);
    };
    
    // Сброс фильтров
    const resetFilters = () => {
        const defaultFilters = {
            rating: [0, 5],
            cuisines: [],
            sortBy: 'rating:desc'
        };
        setLocalFilters(defaultFilters);
        onFiltersChange(defaultFilters);
    };
    
    // Опции сортировки
    const sortOptions = [
        { value: 'rating:desc', label: 'По рейтингу (высокий->низкий)' },
        { value: 'rating:asc', label: 'По рейтингу (низкий->высокий)' },
        { value: 'name:asc', label: 'По названию (А-Я)' },
        { value: 'name:desc', label: 'По названию (Я-А)' },
        { value: 'reviewCount:desc', label: 'По количеству отзывов' }
    ];
    
    // Опции кухонь для чекбоксов
    const cuisineOptions = cuisines.map(cuisine => ({
        value: cuisine,
        label: cuisine
    }));
    
    return (
        <>
            {/* Мобильная кнопка для показа фильтров */}
            <div className="lg:hidden mb-4">
                <Button 
                    variant="secondary" 
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    fullWidth
                >
                    {showMobileFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
                </Button>
            </div>
            
            {/* Фильтры для десктопа и развернутые мобильные фильтры */}
            <Card className={`p-6 sticky top-20 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Фильтры
                </h3>
                
                <div className="space-y-6">
                    {/* Сортировка */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Сортировка
                        </label>
                        <Select
                            options={sortOptions}
                            value={localFilters.sortBy || 'rating:desc'}
                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    
                    {/* Диапазон рейтинга */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Рейтинг
                        </label>
                        <RangeSlider
                            min={0}
                            max={5}
                            step={0.5}
                            value={localFilters.rating || [0, 5]}
                            onChange={(value) => handleFilterChange('rating', value)}
                            disabled={isLoading}
                            marks={{
                                0: '0',
                                1: '1',
                                2: '2',
                                3: '3',
                                4: '4',
                                5: '5'
                            }}
                            valueLabelDisplay="auto"
                        />
                    </div>
                    
                    {/* Кухни */}
                    {cuisineOptions.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Кухни
                            </label>
                            <CheckboxGroup
                                options={cuisineOptions}
                                value={localFilters.cuisines || []}
                                onChange={(values) => handleFilterChange('cuisines', values)}
                                disabled={isLoading}
                            />
                        </div>
                    )}
                    
                    {/* Кнопки применить/сбросить */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                            variant="primary"
                            onClick={applyFilters}
                            disabled={isLoading}
                            fullWidth
                        >
                            Применить
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={resetFilters}
                            disabled={isLoading}
                            fullWidth
                        >
                            Сбросить
                        </Button>
                    </div>
                </div>
            </Card>
        </>
    );
}; 