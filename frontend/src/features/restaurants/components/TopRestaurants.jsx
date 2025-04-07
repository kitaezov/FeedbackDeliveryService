import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { restaurantService } from '../services/restaurantService';
import { 
    Card, 
    Heading, 
    Button, 
    LoadingSpinner 
} from '../../../common/components/ui';
import { RestaurantCard } from './RestaurantCard';

/**
 * Компонент для отображения топ-ресторанов
 * 
 * @param {Object} props - Свойства компонента
 * @param {number} props.limit - Количество ресторанов для отображения
 * @param {string} props.title - Заголовок секции
 * @param {string} props.subtitle - Подзаголовок секции
 * @returns {JSX.Element}
 */
export const TopRestaurants = ({ limit = 6, title = 'Популярные рестораны', subtitle = 'Лучшие рестораны по оценкам наших пользователей' }) => {
    const [restaurants, setRestaurants] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchTopRestaurants = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                const data = await restaurantService.getTopRatedRestaurants(limit);
                setRestaurants(data);
            } catch (err) {
                setError('Не удалось загрузить топ ресторанов');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchTopRestaurants();
    }, [limit]);
    
    return (
        <section className="py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm w-full">
            {/* Заголовок секции */}
            <div className="mb-8 text-center">
                <Heading level={2} className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {title}
                </Heading>
                <p className="text-gray-600 dark:text-gray-400">
                    {subtitle}
                </p>
            </div>
            
            {/* Индикатор загрузки */}
            {isLoading && (
                <div className="flex justify-center py-10">
                    <LoadingSpinner size="large" />
                </div>
            )}
            
            {/* Сообщение об ошибке */}
            {error && !isLoading && (
                <div className="text-center text-red-500 mb-6">
                    {error}
                </div>
            )}
            
            {/* Сообщение, если рестораны не найдены */}
            {!isLoading && !error && restaurants.length === 0 && (
                <div className="text-center text-gray-600 dark:text-gray-400 py-8">
                    Пока нет данных о ресторанах
                </div>
            )}
            
            {/* Список ресторанов */}
            {!isLoading && !error && restaurants.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6 md:gap-8">
                    {restaurants.map(restaurant => (
                        <div key={restaurant.id} className="h-full w-full">
                            <RestaurantCard 
                                id={restaurant.id}
                                name={restaurant.name}
                                image={restaurant.image}
                                cuisine={restaurant.cuisine}
                                address={restaurant.address}
                                rating={restaurant.rating}
                                reviewCount={restaurant.reviewCount}
                            />
                        </div>
                    ))}
                </div>
            )}
            
            {/* Кнопка для просмотра всех ресторанов */}
            {!isLoading && restaurants.length > 0 && (
                <div className="text-center mt-10">
                    <Link to="/restaurants">
                        <Button variant="primary">
                            Смотреть все рестораны
                        </Button>
                    </Link>
                </div>
            )}
        </section>
    );
}; 