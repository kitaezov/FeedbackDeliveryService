import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { RestaurantCard } from './RestaurantCard';
import { LoadingSpinner, Pagination, Alert } from '../../../common/components/ui';
import { useDebounce } from '../../../common/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Coffee, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
            type: "spring", 
            stiffness: 400,
            damping: 25
        }
    }
};

const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2, type: "spring", stiffness: 400 }},
    tap: { scale: 0.95, transition: { duration: 0.1 }}
};

/**
 * Компонент пустого списка ресторанов
 */
const EmptyRestaurants = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="p-6 bg-gray-50 dark:bg-gray-700 text-center rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[200px] flex flex-col justify-center"
    >
        <motion.div 
            className="inline-block mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ 
                type: "spring",
                stiffness: 400,
                damping: 20
            }}
        >
            <Coffee className="w-12 h-12 text-gray-400 dark:text-gray-300 mx-auto" />
        </motion.div>
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Рестораны не найдены</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
            Попробуйте изменить параметры фильтрации или поиска
        </p>
    </motion.div>
);

/**
 * Компонент кастомной пагинации
 */
const CustomPagination = ({ currentPage, totalPages, onPageChange }) => (
    <div className="flex justify-center mt-6">
        <div className="flex items-center space-x-1 p-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-xs shadow-sm">
            <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded flex items-center transition-all ${
                    currentPage === 1 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span>Назад</span>
            </motion.button>
            
            <div className="text-xs px-3 py-1 font-medium">
                {currentPage} / {totalPages}
            </div>
            
            <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded flex items-center transition-all ${
                    currentPage === totalPages 
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
                <span>Вперед</span>
                <ChevronRight className="w-4 h-4 ml-1" />
            </motion.button>
        </div>
    </div>
);

/**
 * Компонент для отображения списка ресторанов с анимациями
 * 
 * @param {Object} props - Свойства компонента
 * @param {Array} props.restaurants - Массив ресторанов для отображения
 * @param {boolean} props.isLoading - Флаг загрузки данных
 * @param {string} props.error - Сообщение об ошибке
 * @param {Object} props.metadata - Метаданные для пагинации
 * @param {Function} props.onPageChange - Обработчик изменения страницы
 * @returns {JSX.Element}
 */
export const RestaurantList = ({ 
    restaurants = [], 
    isLoading = false, 
    error = null, 
    metadata = { totalCount: 0, totalPages: 1, currentPage: 1 }, 
    onPageChange 
}) => {
    // Если идет загрузка, показываем индикатор
    if (isLoading) {
        return (
            <motion.div 
                className="flex justify-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <LoadingSpinner size="large" />
            </motion.div>
        );
    }
    
    // Если есть ошибка, показываем сообщение об ошибке
    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Alert
                    type="error"
                    title="Ошибка загрузки ресторанов"
                    message={error}
                    icon={<AlertCircle className="w-5 h-5 text-red-500" />}
                />
            </motion.div>
        );
    }
    
    // Если нет ресторанов, показываем сообщение
    if (restaurants.length === 0) {
        return <EmptyRestaurants />;
    }
    
    return (
        <div className="restaurant-section w-full max-w-full">
            {/* Информация о количестве ресторанов */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 text-sm text-gray-600 dark:text-gray-400"
            >
                Найдено ресторанов: <span className="font-medium">{metadata.totalCount}</span>
            </motion.div>
            
            {/* Сетка ресторанов */}
            <motion.div 
                className="grid grid-cols-1 gap-6 md:gap-8 w-full"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <AnimatePresence initial={false}>
                    {restaurants.map((restaurant, index) => (
                        <motion.div
                            key={restaurant.id}
                            variants={itemVariants}
                            layout
                            className="h-full w-full"
                        >
                            <RestaurantCard
                                id={restaurant.id}
                                name={restaurant.name}
                                image={restaurant.image}
                                cuisine={restaurant.cuisine}
                                address={restaurant.address}
                                rating={restaurant.rating}
                                reviewCount={restaurant.reviewCount}
                                index={index}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
            
            {/* Пагинация */}
            {metadata.totalPages > 1 && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8"
                >
                    <CustomPagination
                        currentPage={metadata.currentPage}
                        totalPages={metadata.totalPages}
                        onPageChange={onPageChange}
                    />
                </motion.div>
            )}
        </div>
    );
};

RestaurantList.propTypes = {
    restaurants: PropTypes.array,
    isLoading: PropTypes.bool,
    error: PropTypes.string,
    metadata: PropTypes.object,
    onPageChange: PropTypes.func
}; 