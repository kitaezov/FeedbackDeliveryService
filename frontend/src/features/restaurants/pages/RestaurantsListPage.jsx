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
        <Container size="full" className="py-6">
            {/* Хлебные крошки */}
            <Breadcrumbs className="py-4">
                <Breadcrumbs.Item href="/">Главная</Breadcrumbs.Item>
                <Breadcrumbs.Item isCurrentPage>Рестораны</Breadcrumbs.Item>
            </Breadcrumbs>
            
            {/* Заголовок страницы */}
            <div className="mb-8">
                <Heading level={1} className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Рестораны
                </Heading>
                <p className="text-gray-600 dark:text-gray-400">
                    Найдите лучшие рестораны по отзывам и рейтингам реальных посетителей
                </p>
            </div>
            
            {/* Основной контент */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 lg:gap-8">
                {/* Список ресторанов */}
                <div className="lg:col-span-1">
                    {/* Информация о результатах поиска */}
                    {!isLoading && !error && (
                        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                            {metadata.totalCount > 0 ? (
                                <span>Найдено: {metadata.totalCount} ресторанов</span>
                            ) : (
                                <span>Нет ресторанов, соответствующих выбранным фильтрам</span>
                            )}
                        </div>
                    )}
                    
                    <RestaurantList 
                        restaurants={restaurants}
                        isLoading={isLoading}
                        error={error}
                        metadata={metadata}
                        onPageChange={goToPage}
                    />
                </div>
            </div>
        </Container>
    );
}; 