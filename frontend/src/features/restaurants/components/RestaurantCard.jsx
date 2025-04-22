import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../../common/components/ui';
import { StarRating } from './StarRating';
import { MapPin, Star, ArrowUpRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

// Animation variants
const cardVariants = {
    hidden: { 
        opacity: 0, 
        y: 20 
    },
    visible: (i) => ({ 
        opacity: 1, 
        y: 0,
        transition: { 
            delay: i * 0.05,
            type: "spring", 
            stiffness: 400,
            damping: 25
        }
    }),
    hover: {
        y: -7,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.06)",
        transition: { 
            duration: 0.3 
        }
    }
};

const imageVariants = {
    hover: {
        scale: 1.07,
        transition: { duration: 0.5 }
    }
};

const buttonVariants = {
    hover: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        color: '#3b82f6',
        transition: { duration: 0.2 }
    }
};

/**
 * Компонент карточки ресторана с анимацией
 * 
 * @param {Object} props - Свойства компонента
 * @param {string} props.id - Идентификатор ресторана
 * @param {string} props.name - Название ресторана
 * @param {string} props.image - URL изображения ресторана
 * @param {string} props.cuisine - Тип кухни
 * @param {string} props.address - Адрес ресторана
 * @param {number} props.rating - Рейтинг ресторана
 * @param {number} props.reviewCount - Количество отзывов
 * @param {number} props.index - Индекс для анимации
 * @returns {JSX.Element}
 */
export const RestaurantCard = ({
    id,
    name,
    image,
    cuisine,
    address,
    rating,
    reviewCount,
    index
}) => {
    return (
        <motion.div
            variants={cardVariants}
            custom={index}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            layout
        >
            <Link to={`/restaurants/${id}`} className="block h-full">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row h-full w-full border border-gray-200 dark:border-gray-700">
                    {/* Изображение ресторана */}
                    <div className="relative overflow-hidden md:w-2/5 pt-[56.25%] md:pt-0">
                        <motion.div className="absolute inset-0" variants={imageVariants}>
                            {image ? (
                                <img 
                                    src={image.startsWith('http') ? image : `${process.env.REACT_APP_API_URL || ''}${image}`} 
                                    alt={name} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.parentNode.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700"><span class="text-gray-400 dark:text-gray-500">Нет изображения</span></div>';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                                    <span className="text-gray-400 dark:text-gray-500">Нет изображения</span>
                                </div>
                            )}
                        </motion.div>
                        
                        {/* Указатель кухни */}
                        {cuisine && (
                            <div className="absolute top-3 left-3 bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm">
                                {cuisine}
                            </div>
                        )}
                    </div>
                    
                    {/* Информация о ресторане */}
                    <div className="p-5 flex-grow flex flex-col w-full md:w-3/5 justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {name}
                            </h3>
                            
                            {/* Рейтинг и отзывы */}
                            <div className="flex items-center mb-3">
                                <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star
                                            key={star}
                                            size={16}
                                            fill={star <= Math.round(rating) ? "#FFB800" : "none"}
                                            stroke={star <= Math.round(rating) ? "#FFB800" : "#94a3b8"}
                                            className="mr-1"
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                                    <span className="font-medium text-yellow-600 dark:text-yellow-500">{Number(rating).toFixed(1)}</span> ({reviewCount || 0} {reviewCount === 1 ? 'отзыв' : reviewCount >= 2 && reviewCount <= 4 ? 'отзыва' : 'отзывов'})
                                </span>
                            </div>
                            
                            {/* Адрес */}
                            {address && (
                                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-start mb-3">
                                    <MapPin size={16} className="flex-shrink-0 mr-1 mt-0.5" />
                                    <span className="line-clamp-2">{address}</span>
                                </div>
                            )}
                        </div>
                        
                        <motion.div
                            className="inline-flex items-center mt-4 self-end px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
                            variants={buttonVariants}
                            whileHover="hover"
                        >
                            <span>Подробнее</span>
                            <ArrowUpRight size={14} className="ml-1" />
                        </motion.div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}; 