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
    
    // Данные для критериев в ресторане - обеспечиваем числовой тип и точность до одного знака
    const inRestaurantCriteria = [
        { id: 'food', name: 'Качество еды', value: parseFloat(parseFloat(restaurantRatings.food || 0).toFixed(1)) },
        { id: 'service', name: 'Обслуживание', value: parseFloat(parseFloat(restaurantRatings.service || 0).toFixed(1)) },
        { id: 'interior', name: 'Интерьер', value: parseFloat(parseFloat(restaurantRatings.interior || 0).toFixed(1)) },
        { id: 'price', name: 'Соотношение цена/качество', value: parseFloat(parseFloat(restaurantRatings.price || 0).toFixed(1)) },
        { id: 'speed', name: 'Скорость обслуживания', value: parseFloat(parseFloat(restaurantRatings.speed || 0).toFixed(1)) }
    ];
    
    // Данные для критериев доставки - обеспечиваем числовой тип и точность до одного знака
    const deliveryCriteria = [
        { id: 'food', name: 'Качество еды', value: parseFloat(parseFloat(deliveryRatings.food || 0).toFixed(1)) },
        { id: 'packaging', name: 'Упаковка', value: parseFloat(parseFloat(deliveryRatings.packaging || 0).toFixed(1)) },
        { id: 'delivery', name: 'Скорость доставки', value: parseFloat(parseFloat(deliveryRatings.delivery || 0).toFixed(1)) },
        { id: 'price', name: 'Соотношение цена/качество', value: parseFloat(parseFloat(deliveryRatings.price || 0).toFixed(1)) }
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
                                style={{ width: `${Math.max(2, (criterion.value / 5) * 100)}%` }}
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