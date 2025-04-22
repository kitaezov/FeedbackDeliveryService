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
    BarChart2, PieChart as PieChartIcon, LineChart as LineChartIcon
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
                const response = await api.get('/api/manager/statistics');
                setStats(response.data.stats);
                setChartData(response.data.charts);
                setRestaurants(response.data.restaurants);
            } catch (error) {
                console.error('Error fetching manager data:', error);
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Админ панель</h1>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                        title="Активных пользователей" 
                        value={stats.activeUsers} 
                        icon={Users} 
                        color="text-green-500"
                    />
                    <StatCard 
                        title="Процент ответов" 
                        value={`${stats.responseRate}%`} 
                        icon={ThumbsUp} 
                        color="text-purple-500"
                    />
                </div>

                {/* Графики */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* График рейтингов */}
                    <ChartCard 
                        title="Распределение рейтингов"
                        icon={BarChart2}
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData.ratings}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="rating" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* График типов отзывов */}
                    <ChartCard 
                        title="Типы отзывов"
                        icon={PieChartIcon}
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={chartData.reviews}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {chartData.reviews.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* График ответов */}
                    <ChartCard 
                        title="Динамика ответов"
                        icon={LineChartIcon}
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData.responses}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                {/* Список ресторанов */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Рестораны</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                                    <th className="pb-4 text-gray-500 dark:text-gray-400">Название</th>
                                    <th className="pb-4 text-gray-500 dark:text-gray-400">Рейтинг</th>
                                    <th className="pb-4 text-gray-500 dark:text-gray-400">Отзывы</th>
                                    <th className="pb-4 text-gray-500 dark:text-gray-400">Тип</th>
                                    <th className="pb-4 text-gray-500 dark:text-gray-400">Статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                {restaurants.map(restaurant => (
                                    <tr key={restaurant.id} className="border-b border-gray-200 dark:border-gray-700">
                                        <td className="py-4 text-gray-900 dark:text-white">{restaurant.name}</td>
                                        <td className="py-4">
                                            <div className="flex items-center">
                                                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                                <span className="text-gray-900 dark:text-white">{restaurant.rating.toFixed(1)}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-gray-900 dark:text-white">{restaurant.reviews}</td>
                                        <td className="py-4">
                                            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                {restaurant.type}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                restaurant.status === 'active'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}>
                                                {restaurant.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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