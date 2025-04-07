import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../../common/components/ui';
import { StarRating } from './StarRating';

/**
 * Компонент карточки ресторана
 * 
 * @param {Object} props - Свойства компонента
 * @param {string} props.id - Идентификатор ресторана
 * @param {string} props.name - Название ресторана
 * @param {string} props.image - URL изображения ресторана
 * @param {string} props.cuisine - Тип кухни
 * @param {string} props.address - Адрес ресторана
 * @param {number} props.rating - Рейтинг ресторана
 * @param {number} props.reviewCount - Количество отзывов
 * @returns {JSX.Element}
 */
export const RestaurantCard = ({
    id,
    name,
    image,
    cuisine,
    address,
    rating,
    reviewCount
}) => {
    // Получаем путь к изображению или используем заглушку
    const imageUrl = image || '/assets/images/restaurant-placeholder.jpg';
    
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full w-full">
            <Link to={`/restaurants/${id}`} className="flex flex-col h-full">
                <div className="relative w-full">
                    {/* Изображение ресторана с широким соотношением сторон */}
                    <div className="aspect-[3/1] w-full relative">
                        <img 
                            src={imageUrl} 
                            alt={name} 
                            className="w-full h-full object-cover absolute inset-0"
                            onError={(e) => {
                                e.target.src = '/assets/images/restaurant-placeholder.jpg';
                            }}
                        />
                    </div>
                    
                    {/* Бейдж с типом кухни */}
                    {cuisine && (
                        <span className="absolute top-3 right-3 bg-primary-500 text-white text-xs font-semibold px-2 py-1 rounded">
                            {cuisine}
                        </span>
                    )}
                </div>
                
                {/* Информация о ресторане */}
                <div className="p-4 flex-grow flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">
                        {name}
                    </h3>
                    
                    {/* Рейтинг и отзывы */}
                    <div className="flex items-center mb-3">
                        <StarRating rating={rating} showValue />
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                            ({reviewCount || 0} {reviewCount === 1 ? 'отзыв' : reviewCount >= 2 && reviewCount <= 4 ? 'отзыва' : 'отзывов'})
                        </span>
                    </div>
                    
                    {/* Адрес */}
                    {address && (
                        <div className="flex items-start text-sm text-gray-600 dark:text-gray-400 mt-auto">
                            <svg 
                                className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1 mt-0.5 flex-shrink-0" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24" 
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                                />
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                                />
                            </svg>
                            <span className="truncate">{address}</span>
                        </div>
                    )}
                </div>
            </Link>
        </Card>
    );
}; 