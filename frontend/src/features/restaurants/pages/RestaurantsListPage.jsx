import React, { useState, useEffect } from 'react';
import { 
    RestaurantList, 
    RestaurantFilters, 
    RestaurantStats 
} from '../components';
import { useRestaurants } from '../hooks';
import { Container, Breadcrumbs, Heading } from '../../../common/components/ui';

/**
 * Страница списка ресторанов с фильтрацией
 */
export const RestaurantsListPage = () => {
    const [cuisines, setCuisines] = useState([]);
    
    const {
        restaurants,
        isLoading,
        error,
        metadata,
        stats,
        filters,
        updateFilters,
        goToPage
    } = useRestaurants();
    
    // Получение списка доступных кухонь
    useEffect(() => {
        if (stats.topCuisines) {
            const cuisineNames = stats.topCuisines.map(cuisine => cuisine.name);
            setCuisines(cuisineNames);
        }
    }, [stats.topCuisines]);
    
    // Обработчик изменения фильтров
    const handleFiltersChange = (newFilters) => {
        updateFilters(newFilters);
    };
    
    return (
        <Container size="full" className="py-6 px-4 sm:px-6 lg:px-8 w-full">
            <Breadcrumbs 
                items={[{ label: 'Главная', href: '/' }, { label: 'Рестораны' }]} 
                className="mb-4" 
            />
            
            <Heading level={1} className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Рестораны
            </Heading>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full">
                {/* Фильтры */}
                <div className="lg:col-span-1">
                    <div className="sticky top-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-xl border border-gray-200 dark:border-gray-700">
                        <RestaurantFilters 
                            filters={filters} 
                            onFiltersChange={handleFiltersChange}
                            cuisines={cuisines}
                        />
                    </div>
                </div>
                
                {/* Список ресторанов */}
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-200 dark:border-gray-700 mb-6">
                        <RestaurantStats 
                            totalRestaurants={stats.totalRestaurants} 
                            totalReviews={stats.totalReviews} 
                            topCuisines={stats.topCuisines}
                            averageRating={stats.averageRating}
                            isLoading={isLoading}
                        />
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-200 dark:border-gray-700">
                        <RestaurantList 
                            restaurants={restaurants}
                            isLoading={isLoading}
                            error={error}
                            metadata={metadata}
                            onPageChange={goToPage}
                        />
                    </div>
                </div>
            </div>
        </Container>
    );
}; 