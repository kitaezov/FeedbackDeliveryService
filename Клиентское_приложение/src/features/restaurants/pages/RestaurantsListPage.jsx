import React, { useState, useEffect } from 'react';
import { 
    RestaurantList, 
    RestaurantFilters, 
    RestaurantStats 
} from '../components';
import { useRestaurants } from '../hooks';
import { Container, Breadcrumb, Heading } from '../../../common/components/ui';
import { motion } from 'framer-motion';
import { Coffee, Search } from 'lucide-react';

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

/**
 * Страница списка ресторанов с фильтрацией и анимациями
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
        <Container size="full" className="py-6 px-4 sm:px-6 lg:px-8 w-full">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Breadcrumb 
                    items={[{ label: 'Главная', href: '/' }, { label: 'Рестораны' }]} 
                    className="mb-4" 
                />
                
                <motion.div 
                    className="flex items-center mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Coffee className="w-6 h-6 text-gray-700 dark:text-gray-300 mr-2" />
                    <Heading level={1} className="text-2xl font-bold text-gray-900 dark:text-white">
                        Рестораны
                    </Heading>
                </motion.div>
            </motion.div>
            
            <motion.div 
                className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Фильтры */}
                <motion.div 
                    className="lg:col-span-1"
                    variants={itemVariants}
                >
                    <motion.div 
                        className="sticky top-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-xl border border-gray-200 dark:border-gray-700"
                        whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex items-center mb-4">
                            <Search className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                            <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Фильтры</h2>
                        </div>
                        <RestaurantFilters 
                            filters={filters} 
                            onFiltersChange={handleFiltersChange}
                            cuisines={cuisines}
                        />
                    </motion.div>
                </motion.div>
                
                {/* Список ресторанов */}
                <motion.div 
                    className="lg:col-span-3"
                    variants={itemVariants}
                >
                    <motion.div 
                        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-200 dark:border-gray-700 mb-6"
                        whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                        transition={{ duration: 0.3 }}
                    >
                        <RestaurantStats 
                            totalRestaurants={stats.totalRestaurants} 
                            totalReviews={stats.totalReviews} 
                            topCuisines={stats.topCuisines}
                            averageRating={stats.averageRating}
                            isLoading={isLoading}
                        />
                    </motion.div>
                    
                    <motion.div 
                        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-200 dark:border-gray-700"
                        transition={{ duration: 0.3 }}
                    >
                        <RestaurantList 
                            restaurants={restaurants}
                            isLoading={isLoading}
                            error={error}
                            metadata={metadata}
                            onPageChange={goToPage}
                        />
                    </motion.div>
                </motion.div>
            </motion.div>
        </Container>
    );
}; 