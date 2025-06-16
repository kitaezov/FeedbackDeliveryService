import React, { useState, useEffect } from 'react';
import { 
    Card, 
    Button, 
    Select, 
    CheckboxGroup, 
    RangeSlider 
} from '../../../common/components/ui';

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