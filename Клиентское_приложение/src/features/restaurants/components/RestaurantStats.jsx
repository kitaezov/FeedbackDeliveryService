import React from 'react';
import { Card } from '../../../common/components/ui';
import { StarRating } from './StarRating';

/**
 * Компонент для отображения статистики о ресторанах
 * 
 * @param {Object} props - Свойства компонента
 * @param {Object} props.stats - Статистика ресторанов
 * @param {number} props.stats.totalCount - Общее количество ресторанов
 * @param {number} props.stats.avgRating - Средний рейтинг ресторанов
 * @param {number} props.stats.totalReviews - Общее количество отзывов
 * @param {Array} props.stats.topCuisines - Популярные кухни
 * @param {boolean} props.isLoading - Флаг загрузки данных
 * @returns {JSX.Element}
 */
export const RestaurantStats = ({ stats = {}, isLoading = false }) => {
    const {
        totalCount = 0,
        avgRating = 0,
        totalReviews = 0,
        topCuisines = []
    } = stats;
    
    // Функция для склонения слова "ресторан" в зависимости от числа
    const getRestaurantWord = (count) => {
        const lastDigit = count % 10;
        const lastTwoDigits = count % 100;
        
        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
            return 'ресторанов';
        }
        
        if (lastDigit === 1) {
            return 'ресторан';
        }
        
        if (lastDigit >= 2 && lastDigit <= 4) {
            return 'ресторана';
        }
        
        return 'ресторанов';
    };
    
    // Функция для склонения слова "отзыв" в зависимости от числа
    const getReviewWord = (count) => {
        const lastDigit = count % 10;
        const lastTwoDigits = count % 100;
        
        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
            return 'отзывов';
        }
        
        if (lastDigit === 1) {
            return 'отзыв';
        }
        
        if (lastDigit >= 2 && lastDigit <= 4) {
            return 'отзыва';
        }
        
        return 'отзывов';
    };
    
    // Стили для скелетона при загрузке
    const skeletonClass = "bg-gray-200 dark:bg-gray-700 animate-pulse rounded";
    
    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Статистика ресторанов
            </h3>
            
            <div className="space-y-4">
                {/* Общее количество ресторанов */}
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Всего ресторанов:</span>
                    {isLoading ? (
                        <div className={`${skeletonClass} h-6 w-16`}></div>
                    ) : (
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {totalCount} {getRestaurantWord(totalCount)}
                        </span>
                    )}
                </div>
                
                {/* Средний рейтинг */}
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Средний рейтинг:</span>
                    {isLoading ? (
                        <div className={`${skeletonClass} h-6 w-24`}></div>
                    ) : (
                        <div className="flex items-center">
                            <StarRating rating={avgRating} showValue={true} />
                        </div>
                    )}
                </div>
                
                {/* Общее количество отзывов */}
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Всего отзывов:</span>
                    {isLoading ? (
                        <div className={`${skeletonClass} h-6 w-16`}></div>
                    ) : (
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {totalReviews} {getReviewWord(totalReviews)}
                        </span>
                    )}
                </div>
                
                {/* Популярные кухни */}
                <div className="py-2">
                    <h4 className="text-gray-600 dark:text-gray-400 mb-2">Популярные кухни:</h4>
                    {isLoading ? (
                        <div className="space-y-2">
                            <div className={`${skeletonClass} h-6 w-full`}></div>
                            <div className={`${skeletonClass} h-6 w-3/4`}></div>
                            <div className={`${skeletonClass} h-6 w-1/2`}></div>
                        </div>
                    ) : topCuisines.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {topCuisines.map((cuisine, index) => (
                                <span 
                                    key={index} 
                                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-sm"
                                >
                                    {cuisine.name} ({cuisine.count})
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                            Пока нет данных о кухнях
                        </span>
                    )}
                </div>
            </div>
        </Card>
    );
}; 