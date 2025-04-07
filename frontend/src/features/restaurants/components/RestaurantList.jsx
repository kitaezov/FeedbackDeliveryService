import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { RestaurantCard } from './RestaurantCard';
import { LoadingSpinner, Pagination, Alert } from '../../../common/components/ui';
import { useDebounce } from '../../../common/hooks';

/**
 * Компонент для отображения списка ресторанов
 * 
 * @param {Object} props - Свойства компонента
 * @param {Array} props.restaurants - Массив ресторанов для отображения
 * @param {boolean} props.isLoading - Флаг загрузки данных
 * @param {string} props.error - Сообщение об ошибке
 * @param {Object} props.metadata - Метаданные для пагинации
 * @param {Function} props.onPageChange - Обработчик изменения страницы
 * @returns {JSX.Element}
 */
export const RestaurantList = ({ 
    restaurants = [], 
    isLoading = false, 
    error = null, 
    metadata = { totalCount: 0, totalPages: 1, currentPage: 1 }, 
    onPageChange 
}) => {
    // Если идет загрузка, показываем индикатор
    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <LoadingSpinner size="large" />
            </div>
        );
    }
    
    // Если есть ошибка, показываем сообщение об ошибке
    if (error) {
        return (
            <Alert
                type="error"
                title="Ошибка загрузки ресторанов"
                message={error}
            />
        );
    }
    
    // Если нет ресторанов, показываем сообщение
    if (restaurants.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Рестораны не найдены
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Попробуйте изменить параметры фильтрации или поиска
                </p>
            </div>
        );
    }
    
    return (
        <div className="restaurant-section w-full">
            {/* Сетка ресторанов */}
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6 md:gap-8">
                {restaurants.map(restaurant => (
                    <div key={restaurant.id} className="h-full">
                        <RestaurantCard
                            id={restaurant.id}
                            name={restaurant.name}
                            image={restaurant.image}
                            cuisine={restaurant.cuisine}
                            address={restaurant.address}
                            rating={restaurant.rating}
                            reviewCount={restaurant.reviewCount}
                        />
                    </div>
                ))}
            </div>
            
            {/* Пагинация */}
            {metadata.totalPages > 1 && (
                <div className="mt-10">
                    <Pagination
                        currentPage={metadata.currentPage}
                        totalPages={metadata.totalPages}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </div>
    );
};

RestaurantList.propTypes = {
    restaurants: PropTypes.array,
    isLoading: PropTypes.bool,
    error: PropTypes.string,
    metadata: PropTypes.object,
    onPageChange: PropTypes.func
}; 