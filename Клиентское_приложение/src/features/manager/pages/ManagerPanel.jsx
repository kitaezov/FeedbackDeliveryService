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
                
            } catch (error) {
                console.error('Error loading manager data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [timeRange]);

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

                    {/* Критерии оценивания */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                            <h3 className="text-lg font-medium mb-4">Критерии оценивания</h3>
                            
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">По количеству отзывов:</p>
                                <div className="flex items-center mt-1">
                                    <div className="w-5 h-5 rounded-full bg-pink-300 flex items-center justify-center mr-2">
                                        <Star className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-sm">5 звезд: {stats.totalReviews || 1}</span>
                                </div>
                            </div>
                            
                            <div className="mb-2">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Основные критерии оценки:</p>
                            </div>
                            
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Качество еды:</span>
                                        <span>5.0</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Обслуживание:</span>
                                        <span>5.0</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Интерьер:</span>
                                        <span>5.0</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Соотношение цена/качество:</span>
                                        <span>5.0</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Скорость обслуживания:</span>
                                        <span>5.0</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Управление отзывами */}
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Управление отзывами</h2>
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