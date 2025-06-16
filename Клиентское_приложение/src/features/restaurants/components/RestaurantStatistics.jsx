import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '../../../common/components/ui/Card';
import { StarRating } from './StarRating';
import { LoadingSpinner } from '../../../common/components/ui/LoadingSpinner';

/**
 * Компонент статистики рейтингов ресторанов
 * 
 * @param {Object} props - Свойства компонента
 * @param {Array} props.restaurants - Массив ресторанов
 * @param {boolean} [props.isLoading=false] - Индикатор загрузки
 * @param {string} [props.error] - Сообщение об ошибке
 * @returns {JSX.Element} React-компонент
 */
export const RestaurantStatistics = ({ restaurants = [], isLoading = false, error }) => {
    if (isLoading) {
        return (
            <Card className="p-4">
                <div className="flex justify-center py-10">
                    <LoadingSpinner size="large" />
                </div>
            </Card>
        );
    }
    
    if (error) {
        return (
            <Card className="p-4">
                <div className="text-center py-10 text-red-500">
                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium">Ошибка при загрузке статистики</h3>
                    <p className="mt-1">{error}</p>
                </div>
            </Card>
        );
    }
    
    if (restaurants.length === 0) {
        return (
            <Card className="p-4">
                <div className="text-center py-10">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Нет данных</h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                        В настоящее время данных о ресторанах нет.
                    </p>
                </div>
            </Card>
        );
    }
    
    // Рассчитываем общую статистику
    const totalRestaurants = restaurants.length;
    const totalReviews = restaurants.reduce((sum, r) => sum + (r.reviewCount || 0), 0);
    const restaurantsWithRating = restaurants.filter(r => r.rating > 0).length;
    
    // Средний рейтинг по всем ресторанам
    const avgRating = restaurantsWithRating > 0
        ? (restaurants.reduce((sum, r) => sum + (r.rating || 0), 0) / restaurantsWithRating).toFixed(1)
        : 0;
    
    // Рассчитываем рейтинговую статистику
    const ratingDistribution = restaurants.reduce((dist, r) => {
        if (r.rating) {
            const ratingInt = Math.floor(r.rating);
            dist[ratingInt] = (dist[ratingInt] || 0) + 1;
        }
        return dist;
    }, {});
    
    // Находим топ рестораны по рейтингу
    const topRatedRestaurants = [...restaurants]
        .filter(r => r.rating > 0 && r.reviewCount >= 3) // Минимум 3 отзыва для надежности
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);
    
    // Находим топ рестораны по количеству отзывов
    const mostReviewedRestaurants = [...restaurants]
        .filter(r => r.reviewCount > 0)
        .sort((a, b) => b.reviewCount - a.reviewCount)
        .slice(0, 5);
    
    // Распределение по кухням
    const cuisineDistribution = restaurants.reduce((dist, r) => {
        if (r.cuisine) {
            dist[r.cuisine] = (dist[r.cuisine] || 0) + 1;
        }
        return dist;
    }, {});
    
    // Сортируем кухни по популярности
    const sortedCuisines = Object.entries(cuisineDistribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Общая статистика */}
            <Card className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Общая статистика
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                            {totalRestaurants}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Ресторанов
                        </div>
                    </div>
                    
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                            {totalReviews}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Отзывов
                        </div>
                    </div>
                    
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-3xl font-bold text-yellow-500">
                            {avgRating}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Средний рейтинг
                        </div>
                    </div>
                    
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                            {Object.keys(cuisineDistribution).length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Типов кухни
                        </div>
                    </div>
                </div>
            </Card>
            
            {/* Распределение рейтингов */}
            <Card className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Распределение рейтингов
                </h3>
                
                <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map(rating => {
                        const count = ratingDistribution[rating] || 0;
                        const percent = restaurantsWithRating > 0 
                            ? (count / restaurantsWithRating) * 100 
                            : 0;
                            
                        return (
                            <div key={rating} className="flex items-center">
                                <div className="flex items-center w-16">
                                    <span className="text-sm mr-1">{rating}</span>
                                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                </div>
                                
                                <div className="flex-grow h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-yellow-500 rounded-full" 
                                        style={{ width: `${percent}%` }}
                                    ></div>
                                </div>
                                
                                <div className="w-20 text-right text-sm text-gray-600 dark:text-gray-400">
                                    {count} ({percent.toFixed(1)}%)
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
            
            {/* Топ рестораны по рейтингу */}
            <Card className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Лучшие рестораны
                </h3>
                
                {topRatedRestaurants.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        Недостаточно данных для рейтинга
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {topRatedRestaurants.map(restaurant => (
                            <li key={restaurant.id} className="flex items-center justify-between">
                                <div className="flex-1 truncate">
                                    <span className="font-medium text-gray-800 dark:text-gray-200">
                                        {restaurant.name}
                                    </span>
                                    {restaurant.cuisine && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                            {restaurant.cuisine}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center">
                                    <StarRating 
                                        rating={restaurant.rating}
                                        size="small"
                                        className="text-yellow-500 mr-1"
                                    />
             
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
            
            {/* Популярные кухни */}
            <Card className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Популярные кухни
                </h3>
                
                {sortedCuisines.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        Нет данных о кухнях
                    </p>
                ) : (
                    <div className="space-y-3">
                        {sortedCuisines.map(([cuisine, count]) => {
                            const percent = (count / totalRestaurants) * 100;
                            
                            return (
                                <div key={cuisine} className="flex items-center">
                                    <div className="w-1/3 truncate text-gray-800 dark:text-gray-200">
                                        {cuisine}
                                    </div>
                                    
                                    <div className="flex-grow h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary-500 rounded-full" 
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                    
                                    <div className="w-16 text-right text-sm text-gray-600 dark:text-gray-400 ml-2">
                                        {count}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
};

RestaurantStatistics.propTypes = {
    restaurants: PropTypes.array,
    isLoading: PropTypes.bool,
    error: PropTypes.string
}; 