import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Tab } from '../../../common/components/ui';
import { Star } from 'lucide-react';

/**
 * Компонент для отображения критериев оценивания ресторана
 * с разделением на доставку и посещение ресторана
 */
export const RatingCriteria = ({ 
    restaurantRatings = {}, 
    deliveryRatings = {},
    reviewCount = 0,
    showHeading = false
}) => {
    const [activeTab, setActiveTab] = useState('restaurant');
    
    // Данные для критериев в ресторане
    const inRestaurantCriteria = [
        { id: 'food', name: 'Качество еды', value: restaurantRatings.food || 0 },
        { id: 'service', name: 'Обслуживание', value: restaurantRatings.service || 0 },
        { id: 'interior', name: 'Интерьер', value: restaurantRatings.interior || 0 },
        { id: 'price', name: 'Соотношение цена/качество', value: restaurantRatings.price || 0 },
        { id: 'speed', name: 'Скорость обслуживания', value: restaurantRatings.speed || 0 }
    ];
    
    // Данные для критериев доставки
    const deliveryCriteria = [
        { id: 'food', name: 'Качество еды', value: deliveryRatings.food || 0 },
        { id: 'packaging', name: 'Упаковка', value: deliveryRatings.packaging || 0 },
        { id: 'delivery', name: 'Скорость доставки', value: deliveryRatings.delivery || 0 },
        { id: 'price', name: 'Соотношение цена/качество', value: deliveryRatings.price || 0 }
    ];
    
    const activeCriteria = activeTab === 'restaurant' ? inRestaurantCriteria : deliveryCriteria;
    
    // Функция для правильного склонения слова "отзыв"
    const getReviewWord = (count) => {
        const lastDigit = count % 10;
        const lastTwoDigits = count % 100;
        
        if (lastDigit === 1 && lastTwoDigits !== 11) {
            return 'отзыв';
        } else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
            return 'отзыва';
        } else {
            return 'отзывов';
        }
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm overflow-hidden h-full">
            {showHeading && (
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Критерии оценивания
                </h2>
            )}
            
            <div className="mb-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    По количеству отзывов: <span className="font-medium text-gray-700 dark:text-gray-300">{reviewCount} {getReviewWord(reviewCount)}</span>
                </p>
            </div>
            
            <div className="mb-3">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('restaurant')}
                        className={`py-1.5 px-3 text-sm font-medium ${
                            activeTab === 'restaurant'
                                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        В ресторане
                    </button>
                    <button
                        onClick={() => setActiveTab('delivery')}
                        className={`py-1.5 px-3 text-sm font-medium ${
                            activeTab === 'delivery'
                                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Доставка
                    </button>
                </div>
            </div>
            
            <div className="space-y-2.5 mt-2">
                {activeCriteria.map((criterion) => (
                    <div key={criterion.id} className="flex items-center">
                        <div className="text-sm min-w-[150px] truncate text-gray-700 dark:text-gray-300">
                            {criterion.name}:
                        </div>
                        <div className="flex-grow h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-2">
                            <div 
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${(criterion.value / 5) * 100}%` }}
                            ></div>
                        </div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8 text-right">
                            {criterion.value.toFixed(1)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

RatingCriteria.propTypes = {
    restaurantRatings: PropTypes.object,
    deliveryRatings: PropTypes.object,
    reviewCount: PropTypes.number,
    showHeading: PropTypes.bool
}; 