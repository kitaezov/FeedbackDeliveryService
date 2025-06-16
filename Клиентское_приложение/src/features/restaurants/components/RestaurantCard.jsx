import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../../common/components/ui';
import { StarRating } from './StarRating';
import { MapPin, Star, ArrowUpRight, Clock, Coffee } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCategoryName } from '../constants/categories';
import { RESTAURANT_CATEGORIES } from '../constants/categories';
import { restaurantPlaceholder } from '../../../utils/placeholders';
import PropTypes from 'prop-types';

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
 * @param {string} props.category - Категория ресторана
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
    index,
    category
}) => {
    // Используем функцию getCategoryName для отображения категории
    const displayCategory = category ? getCategoryName(category) : cuisine;

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            custom={index}
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700"
        >
            <Link to={`/restaurant/${id}`} className="block">
                <motion.div 
                    className="relative h-48 overflow-hidden"
                    variants={imageVariants}
                >
                    <img
                        src={image || restaurantPlaceholder}
                        alt={name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = restaurantPlaceholder;
                        }}
                    />
                </motion.div>

                <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {name}
                    </h3>

                    <div className="flex items-center mb-2 text-sm text-gray-600 dark:text-gray-300">
                        <Coffee className="w-4 h-4 mr-1" />
                        <span>{displayCategory}</span>
                    </div>

                    {address && (
                        <div className="flex items-center mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{address}</span>
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center">
                            <Star className={`w-5 h-5 ${rating >= 4.5 ? 'text-yellow-400' : 'text-gray-400'}`} />
                            <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                {rating?.toFixed(1) || 'Нет оценок'}
                            </span>
                            {reviewCount > 0 && (
                                <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                                    ({reviewCount})
                                </span>
                            )}
                        </div>
                        <motion.div
                            variants={buttonVariants}
                            className="text-blue-600 dark:text-blue-400 flex items-center text-sm"
                        >
                            Подробнее
                            <ArrowUpRight className="w-4 h-4 ml-1" />
                        </motion.div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

RestaurantCard.propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string,
    cuisine: PropTypes.string,
    address: PropTypes.string,
    rating: PropTypes.number,
    reviewCount: PropTypes.number,
    index: PropTypes.number,
    category: PropTypes.string
}; 