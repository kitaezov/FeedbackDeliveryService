import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
    Star, TrendingUp, Users, Clock, DollarSign, 
    Filter, Search, ChevronDown, Award, Smile,
    MapPin, ThumbsUp, ThumbsDown, Calendar, MessageSquare,
    BarChart2, PieChart as PieChartIcon, LineChart as LineChartIcon, AlertCircle
} from 'lucide-react';
import api from '../../../utils/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ManagerPanel = () => {
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('week');
    const [stats, setStats] = useState({
        totalReviews: 0,
        averageRating: 0,
        totalRestaurants: 0,
        reviewsByType: { inRestaurant: 0, delivery: 0 },
        activeUsers: 0,
        responseRate: 0
    });
    const [chartData, setChartData] = useState({
        ratings: [],
        reviews: [],
        responses: []
    });
    const [restaurants, setRestaurants] = useState([]);
    const [categoryRatings, setCategoryRatings] = useState({
        restaurant: [],
        delivery: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch manager statistics
                const statsResponse = await api.get('/manager/analytics/stats');
                if (statsResponse.data) {
                    setStats(statsResponse.data.stats || {
                        totalReviews: 0,
                        averageRating: 0,
                        totalRestaurants: 0,
                        reviewsByType: { inRestaurant: 0, delivery: 0 },
                        activeUsers: 0,
                        responseRate: 0
                    });
                    setChartData(statsResponse.data.charts || {
                        ratings: [],
                        reviews: [],
                        responses: []
                    });
                }
                
                // Fetch restaurants data
                const restaurantsResponse = await api.get('/manager/restaurants');
                const restaurantsData = restaurantsResponse.data || [];
                
                // Fetch reviews directly from the reviews endpoint
                const reviewsResponse = await api.get('/reviews');
                console.log('Reviews API response:', reviewsResponse.data);
                
                let reviewsData = [];
                
                // Handle different response formats
                if (Array.isArray(reviewsResponse.data)) {
                    reviewsData = reviewsResponse.data;
                } else if (reviewsResponse.data && Array.isArray(reviewsResponse.data.reviews)) {
                    reviewsData = reviewsResponse.data.reviews;
                } else if (reviewsResponse.data && reviewsResponse.data.reviews && Array.isArray(reviewsResponse.data.reviews.reviews)) {
                    reviewsData = reviewsResponse.data.reviews.reviews;
                }
                
                console.log(`Found ${reviewsData.length} reviews for processing`);
                
                // Process restaurants with review data
                const processedRestaurants = restaurantsData.map(restaurant => {
                    // Find all reviews for this restaurant
                    const restaurantReviews = reviewsData.filter(review => {
                        return (review.restaurantId === restaurant.id) || 
                               (review.restaurant_id === restaurant.id) ||
                               (review.restaurantName === restaurant.name) || 
                               (review.restaurant_name === restaurant.name);
                    });
                    
                    // Calculate average rating
                    let avgRating = 0;
                    if (restaurantReviews.length > 0) {
                        const ratingsSum = restaurantReviews.reduce((sum, review) => 
                            sum + (Number(review.rating) || 0), 0);
                        avgRating = ratingsSum / restaurantReviews.length;
                    }
                    
                    return {
                        ...restaurant,
                        rating: avgRating || restaurant.rating || 0,
                        reviews: restaurantReviews.length,
                        reviewCount: restaurantReviews.length
                    };
                });
                
                setRestaurants(processedRestaurants);
                
                // Calculate category ratings
                calculateCategoryRatings(reviewsData);
                
            } catch (error) {
                console.error('Error loading manager data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [timeRange]);
    
    // Функция для расчета рейтингов по категориям
    const calculateCategoryRatings = (reviewsData) => {
        // Разделяем отзывы по типам
        const restaurantReviews = reviewsData.filter(review => 
            review.type === 'inRestaurant' || 
            (!review.type && !review.isDelivery && !review.delivery)
        );
        
        const deliveryReviews = reviewsData.filter(review => 
            review.type === 'delivery' || 
            review.isDelivery === true || 
            review.delivery === true
        );
        
        console.log(`Разделение отзывов: В ресторане - ${restaurantReviews.length}, Доставка - ${deliveryReviews.length}`);
        
        // Рассчитываем рейтинги для ресторана
        const restaurantCategories = [
            { id: 'food', name: 'Качество блюд' },
            { id: 'service', name: 'Уровень сервиса' },
            { id: 'atmosphere', name: 'Атмосфера' },
            { id: 'price', name: 'Цена/Качество' },
            { id: 'cleanliness', name: 'Чистота' }
        ];
        
        // Рассчитываем рейтинги для доставки
        const deliveryCategories = [
            { id: 'food', name: 'Качество блюд' },
            { id: 'deliverySpeed', name: 'Скорость доставки' },
            { id: 'deliveryQuality', name: 'Качество доставки' },
            { id: 'price', name: 'Цена/Качество' }
        ];
        
        // Функция для расчета среднего рейтинга по категории
        const calculateAverage = (reviews, categoryId, alternativeIds = []) => {
            let sum = 0;
            let count = 0;
            
            reviews.forEach(review => {
                let rating = null;
                const overallRating = parseFloat(review.rating) || 3;
                
                // Проверяем различные форматы данных
                if (review.ratings && review.ratings[categoryId] !== undefined) {
                    rating = parseFloat(review.ratings[categoryId]);
                } else if (review[`${categoryId}_rating`] !== undefined) {
                    rating = parseFloat(review[`${categoryId}_rating`]);
                } else {
                    // Проверяем альтернативные ID
                    for (const altId of alternativeIds) {
                        if (review.ratings && review.ratings[altId] !== undefined) {
                            rating = parseFloat(review.ratings[altId]);
                            break;
                        } else if (review[`${altId}_rating`] !== undefined) {
                            rating = parseFloat(review[`${altId}_rating`]);
                            break;
                        }
                    }
                }
                
                // Если рейтинг не найден или равен 0, используем общий рейтинг
                if (!rating || rating === 0 || isNaN(rating)) {
                    rating = overallRating;
                }
                
                sum += rating;
                count++;
            });
            
            return count > 0 ? sum / count : 3.0;
        };
        
        // Рассчитываем рейтинги для ресторана
        const restaurantRatings = restaurantCategories.map(category => {
            const alternativeIds = [];
            const value = calculateAverage(restaurantReviews, category.id, alternativeIds);
            
            return {
                ...category,
                value: value
            };
        });
        
        // Рассчитываем рейтинги для доставки
        const deliveryRatings = deliveryCategories.map(category => {
            let alternativeIds = [];
            
            if (category.id === 'deliverySpeed') {
                alternativeIds = ['service'];
            } else if (category.id === 'deliveryQuality') {
                alternativeIds = ['atmosphere'];
            }
            
            const value = calculateAverage(deliveryReviews, category.id, alternativeIds);
            
            return {
                ...category,
                value: value
            };
        });
        
        // Устанавливаем рейтинги
        setCategoryRatings({
            restaurant: restaurantRatings,
            delivery: deliveryRatings
        });
        
        console.log('Рассчитанные рейтинги для ресторана:', restaurantRatings);
        console.log('Рассчитанные рейтинги для доставки:', deliveryRatings);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Заголовок и фильтры */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Панель менеджера</h1>
                    <div className="flex items-center space-x-4">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            <option value="week">За неделю</option>
                            <option value="month">За месяц</option>
                            <option value="year">За год</option>
                        </select>
                    </div>
                </div>

                {/* Статистика */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <StatCard 
                        title="Всего отзывов" 
                        value={stats.totalReviews} 
                        icon={MessageSquare} 
                        color="text-blue-500"
                    />
                    <StatCard 
                        title="Средний рейтинг" 
                        value={stats.averageRating.toFixed(1)} 
                        icon={Star} 
                        color="text-yellow-500"
                    />
                    <StatCard 
                        title="Рестораны" 
                        value={stats.totalRestaurants} 
                        icon={MapPin} 
                        color="text-green-500"
                    />
                </div>

                {/* Аналитика */}
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Аналитика</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* График рейтингов */}
                    <ChartCard 
                        title="Средний рейтинг за период"
                        icon={LineChartIcon}
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData.ratings}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis domain={[0, 5]} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="rating" stroke="#8884d8" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* График количества отзывов */}
                    <ChartCard 
                        title="Количество отзывов по дням"
                        icon={BarChart2}
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData.reviews}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* График типов отзывов */}
                    <ChartCard 
                        title="Распределение типов отзывов"
                        icon={PieChartIcon}
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'В ресторане', value: stats.reviewsByType?.inRestaurant || 0 },
                                        { name: 'Доставка', value: stats.reviewsByType?.delivery || 0 }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {[
                                        { name: 'В ресторане', value: stats.reviewsByType?.inRestaurant || 0 },
                                        { name: 'Доставка', value: stats.reviewsByType?.delivery || 0 }
                                    ].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value} отзывов`, 'Количество']} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                {/* Рейтинги по категориям */}
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Рейтинги по категориям</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Рейтинги для ресторана */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                            В ресторане
                        </h3>
                        <div className="space-y-4">
                            {categoryRatings.restaurant.map((category) => {
                                // Calculate color based on rating value
                                let barColor = "bg-red-500";
                                if (category.value >= 4.5) barColor = "bg-green-500";
                                else if (category.value >= 4) barColor = "bg-teal-500";
                                else if (category.value >= 3.5) barColor = "bg-blue-500";
                                else if (category.value >= 3) barColor = "bg-yellow-500";
                                else if (category.value >= 2) barColor = "bg-orange-500";
                                
                                return (
                                    <div key={category.id} className="flex flex-col">
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {category.name}
                                            </div>
                                            <div className="flex items-center">
                                                <span className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {Number(category.value).toFixed(1)}
                                                </span>
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map((star) => {
                                                        // For partial stars
                                                        const value = Number(category.value);
                                                        const isFullStar = star <= Math.floor(value);
                                                        const isHalfStar = !isFullStar && star === Math.ceil(value) && value % 1 >= 0.5;
                                                        
                                                        return (
                                                            <span 
                                                                key={star} 
                                                                className={`text-sm ${
                                                                    isFullStar 
                                                                        ? 'text-yellow-400' 
                                                                        : isHalfStar 
                                                                            ? 'text-yellow-300' 
                                                                            : 'text-gray-300'
                                                                }`}
                                                            >
                                                                ★
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div 
                                                className={`${barColor} h-2 rounded-full transition-all duration-300`} 
                                                style={{ width: `${(category.value / 5) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* Рейтинги для доставки */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                            Доставка
                        </h3>
                        <div className="space-y-4">
                            {categoryRatings.delivery.map((category) => {
                                // Calculate color based on rating value
                                let barColor = "bg-red-500";
                                if (category.value >= 4.5) barColor = "bg-green-500";
                                else if (category.value >= 4) barColor = "bg-teal-500";
                                else if (category.value >= 3.5) barColor = "bg-blue-500";
                                else if (category.value >= 3) barColor = "bg-yellow-500";
                                else if (category.value >= 2) barColor = "bg-orange-500";
                                
                                return (
                                    <div key={category.id} className="flex flex-col">
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {category.name}
                                            </div>
                                            <div className="flex items-center">
                                                <span className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {Number(category.value).toFixed(1)}
                                                </span>
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map((star) => {
                                                        // For partial stars
                                                        const value = Number(category.value);
                                                        const isFullStar = star <= Math.floor(value);
                                                        const isHalfStar = !isFullStar && star === Math.ceil(value) && value % 1 >= 0.5;
                                                        
                                                        return (
                                                            <span 
                                                                key={star} 
                                                                className={`text-sm ${
                                                                    isFullStar 
                                                                        ? 'text-yellow-400' 
                                                                        : isHalfStar 
                                                                            ? 'text-yellow-300' 
                                                                            : 'text-gray-300'
                                                                }`}
                                                            >
                                                                ★
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div 
                                                className={`${barColor} h-2 rounded-full transition-all duration-300`} 
                                                style={{ width: `${(category.value / 5) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Управление отзывами */}
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Управление отзывами11111</h2>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <div className="relative flex-1 max-w-md">
                            <input 
                                type="text" 
                                placeholder="Поиск отзывов..." 
                                className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex space-x-2">
                            <select className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                <option>Все статусы</option>
                                <option>Новые</option>
                                <option>Отвеченные</option>
                            </select>
                            <select className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                <option>Все рейтинги</option>
                                <option>5 звезд</option>
                                <option>4 звезды</option>
                                <option>3 звезды</option>
                                <option>2 звезды</option>
                                <option>1 звезда</option>
                            </select>
                            <select className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                <option>Все типы</option>
                                <option>В ресторане</option>
                                <option>Доставка</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                            <AlertCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Отзывы не найдены</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Попробуйте изменить фильтры или критерии поиска
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-semibold mt-1">{value}</p>
            </div>
            <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    </motion.div>
);

const ChartCard = ({ title, icon: Icon, children }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
    >
        <div className="flex items-center mb-4">
            <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        {children}
    </motion.div>
);

export default ManagerPanel;