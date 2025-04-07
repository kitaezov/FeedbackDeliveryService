import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../../common/components/ui';
import { StarRating } from './StarRating';
import { MapPin } from 'lucide-react';

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
    return (
        <Link to={`/restaurants/${id}`}>
            <div 
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl 
                transition-all duration-300 overflow-hidden flex flex-col h-full w-full border 
                border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            >
                {/* Изображение ресторана */}
                <div className="relative overflow-hidden pt-[56.25%] w-full">
                    {image ? (
                        <img 
                            src={image} 
                            alt={name} 
                            className="absolute top-0 left-0 w-full h-full object-cover
                            group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                    ) : (
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                            <span className="text-gray-400 dark:text-gray-500">Нет изображения</span>
                        </div>
                    )}
                    
                    {/* Указатель кухни */}
                    {cuisine && (
                        <div className="absolute top-3 left-3 bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm">
                            {cuisine}
                        </div>
                    )}
                </div>
                
                {/* Информация о ресторане */}
                <div className="p-5 flex-grow flex flex-col w-full">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                            <MapPin size={16} className="flex-shrink-0 mr-1 mt-0.5 group-hover:text-blue-500 transition-colors" />
                            <span className="line-clamp-2">{address}</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}; 