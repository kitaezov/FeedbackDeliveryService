import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { restaurantService } from '../services/restaurantService';
import { 
    Card, 
    Button, 
    Spinner 
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
        <section className="w-full max-w-full">
            <div className="flex justify-between items-center mb-8 w-full">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
                </div>
                
                <Link to="/restaurants">
                    <Button variant="outline" size="small">
                        Все рестораны
                    </Button>
                </Link>
            </div>
            
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Spinner size="large" />
                </div>
            ) : error ? (
                <Card className="p-6 text-center">
                    <p className="text-red-500">{error}</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
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
        </section>
    );
}; 