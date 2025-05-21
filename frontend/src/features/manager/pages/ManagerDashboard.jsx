import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../../components/Card';
import { MessageSquare, Star, Clock, CheckCircle2, AlertCircle, Filter, Search } from 'lucide-react';
import api from '../../utils/api';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_URL } from '../../../config';

const ManagerDashboard = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalReviews: 0,
        respondedReviews: 0,
        pendingReviews: 0,
        averageRating: 0
    });
    const [filters, setFilters] = useState({
        status: 'all',
        rating: 'all',
        search: ''
    });
    const [chartPeriod, setChartPeriod] = useState('week');
    const [chartData, setChartData] = useState({
        ratings: {
            labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
            datasets: [{
                label: 'Средний рейтинг',
                data: [0, 0, 0, 0, 0, 0, 0],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
            }]
        },
        volumeByDay: {
            labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
            datasets: [{
                label: 'Количество отзывов',
                data: [0, 0, 0, 0, 0, 0, 0],
                backgroundColor: 'rgba(99, 102, 241, 0.5)',
            }]
        },
        categoryDistribution: {
            labels: [],
            datasets: [{
                label: 'Количество отзывов',
                data: [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(75, 192, 80, 0.6)',
                    'rgba(153, 81, 255, 0.6)',
                    'rgba(255, 150, 132, 0.6)',
                    'rgba(54, 100, 235, 0.6)',
                ],
            }]
        }
    });
    const [isChartLoading, setIsChartLoading] = useState(false);

    useEffect(() => {
        fetchReviews();
        fetchStats();
        fetchChartData();
        
        // Обновление данных при изменении периода графика
        if (chartPeriod) {
            fetchChartData();
        }
    }, [chartPeriod]);

    const fetchReviews = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await api.get('/api/reviews', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReviews(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке отзывов:', error);
            toast.error('Не удалось загрузить отзывы');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await api.get('/api/reviews/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке статистики:', error);
            toast.error('Не удалось загрузить статистику');
        }
    };

    const fetchChartData = async () => {
        setIsChartLoading(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/manager/chart-data`, {
                params: { period: chartPeriod },
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Данные диаграммы получены:', response.data);
            
            // Обработка данных для графиков
            const chartDataResponse = response.data;
            
            // Распределение по ресторанам вместо категорий
            const restaurantCounts = {};
            
            // Подсчитываем количество отзывов для каждого ресторана
            if (chartDataResponse.reviews && chartDataResponse.reviews.length > 0) {
                chartDataResponse.reviews.forEach(review => {
                    if (review.restaurant && review.restaurant.name) {
                        const restaurantName = review.restaurant.name;
                        restaurantCounts[restaurantName] = (restaurantCounts[restaurantName] || 0) + 1;
                    }
                });
            }
            
            // Если нет данных о ресторанах, используем демо-данные
            if (Object.keys(restaurantCounts).length === 0) {
                restaurantCounts['Итальянский Ресторан'] = 3;
                restaurantCounts['Азиатский Фьюжн'] = 2;
                restaurantCounts['Кафе У Дома'] = 1;
            }
            
            console.log('Распределение отзывов по ресторанам:', restaurantCounts);
            
            // Создаем массивы для названий ресторанов и количества отзывов
            const restaurantNames = Object.keys(restaurantCounts);
            const reviewCountsByRestaurant = Object.values(restaurantCounts);
            
            // Создаем цвета для каждого ресторана на диаграмме
            const restaurantColors = [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)',
                'rgba(75, 192, 80, 0.6)',
                'rgba(153, 81, 255, 0.6)',
                'rgba(255, 150, 132, 0.6)',
                'rgba(54, 100, 235, 0.6)',
            ];
            
            // Обрезаем массив цветов до количества ресторанов
            const backgroundColors = restaurantColors.slice(0, restaurantNames.length);
            
            setChartData(prevData => ({
                ...prevData,
                ratings: {
                    labels: chartDataResponse.dayLabels || ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
                    datasets: [{
                        label: 'Средний рейтинг',
                        data: chartDataResponse.averageRatings || [0, 0, 0, 0, 0, 0, 0],
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    }]
                },
                volumeByDay: {
                    labels: chartDataResponse.dayLabels || ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
                    datasets: [{
                        label: 'Количество отзывов',
                        data: chartDataResponse.reviewCounts || [0, 0, 0, 0, 0, 0, 0],
                        backgroundColor: 'rgba(99, 102, 241, 0.5)',
                    }]
                },
                categoryDistribution: {
                    labels: restaurantNames,
                    datasets: [{
                        label: 'Количество отзывов',
                        data: reviewCountsByRestaurant,
                        backgroundColor: backgroundColors,
                    }]
                }
            }));

            setIsChartLoading(false);
        } catch (error) {
            console.error('Error fetching chart data:', error);
            toast.error('Не удалось загрузить данные для графиков');
            setIsChartLoading(false);
        }
    };

    const handleResponse = async (reviewId, responseText) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            await api.post(`/api/reviews/${reviewId}/response`, 
                { text: responseText },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Ответ успешно отправлен');
            fetchReviews();
            fetchStats();
        } catch (error) {
            console.error('Ошибка при отправке ответа:', error);
            toast.error('Не удалось отправить ответ');
        }
    };

    const filteredReviews = reviews.filter(review => {
        const matchesStatus = filters.status === 'all' || 
            (filters.status === 'responded' && review.hasResponse) ||
            (filters.status === 'pending' && !review.hasResponse);
        
        const matchesRating = filters.rating === 'all' || 
            review.rating === parseInt(filters.rating);
        
        const matchesSearch = review.text.toLowerCase().includes(filters.search.toLowerCase()) ||
            review.customerName.toLowerCase().includes(filters.search.toLowerCase());

        return matchesStatus && matchesRating && matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-white">Загрузка...</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold text-white mb-8">Панель менеджера</h1>

                {/* Статистика */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-blue-500/20 backdrop-blur-sm border border-blue-500/30">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white/60 text-sm">Всего отзывов</p>
                                    <p className="text-2xl font-bold text-white">{stats.totalReviews}</p>
                                </div>
                                <MessageSquare className="w-8 h-8 text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-green-500/20 backdrop-blur-sm border border-green-500/30">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white/60 text-sm">Отвечено</p>
                                    <p className="text-2xl font-bold text-white">{stats.respondedReviews}</p>
                                </div>
                                <CheckCircle2 className="w-8 h-8 text-green-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white/60 text-sm">Ожидают ответа</p>
                                    <p className="text-2xl font-bold text-white">{stats.pendingReviews}</p>
                                </div>
                                <Clock className="w-8 h-8 text-yellow-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-purple-500/20 backdrop-blur-sm border border-purple-500/30">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white/60 text-sm">Средний рейтинг</p>
                                    <p className="text-2xl font-bold text-white">{stats.averageRating.toFixed(1)}</p>
                                </div>
                                <Star className="w-8 h-8 text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Аналитика */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-white">Аналитика</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-white/60">Период:</span>
                            <select
                                value={chartPeriod}
                                onChange={(e) => setChartPeriod(e.target.value)}
                                className="bg-white/5 border border-white/20 rounded-lg text-white px-4 py-2 text-sm"
                            >
                                <option value="week">Последние 7 дней</option>
                                <option value="month">Последние 30 дней</option>
                                <option value="year">Последние 12 месяцев</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
                            <CardContent className="p-4">
                                <h3 className="text-white font-medium mb-4">Средний рейтинг за период</h3>
                                <div className="h-64 flex items-center justify-center">
                                    <p className="text-white/60">График среднего рейтинга</p>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
                            <CardContent className="p-4">
                                <h3 className="text-white font-medium mb-4">Количество отзывов по дням</h3>
                                <div className="h-64 flex items-center justify-center">
                                    <p className="text-white/60">График количества отзывов</p>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
                            <CardContent className="p-4">
                                <h3 className="text-white font-medium mb-4">Распределение по категориям</h3>
                                <div className="h-64 flex items-center justify-center">
                                    <p className="text-white/60">Диаграмма распределения</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Фильтры */}
                <Card className="bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
                                    <input
                                        type="text"
                                        placeholder="Поиск отзывов..."
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    className="bg-white/5 border border-white/20 rounded-lg text-white px-4 py-2"
                                >
                                    <option value="all">Все статусы</option>
                                    <option value="responded">Отвечено</option>
                                    <option value="pending">Ожидают ответа</option>
                                </select>
                                <select
                                    value={filters.rating}
                                    onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                                    className="bg-white/5 border border-white/20 rounded-lg text-white px-4 py-2"
                                >
                                    <option value="all">Все рейтинги</option>
                                    <option value="5">5 звезд</option>
                                    <option value="4">4 звезды</option>
                                    <option value="3">3 звезды</option>
                                    <option value="2">2 звезды</option>
                                    <option value="1">1 звезда</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Список отзывов */}
                <h2 className="text-xl font-semibold text-white mb-4">Управление отзывами</h2>
                <div className="space-y-4">
                    {filteredReviews.map((review) => (
                        <Card key={review.id} className="bg-white/10 backdrop-blur-sm border border-white/20">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${
                                                            i < review.rating
                                                                ? 'text-yellow-400 fill-current'
                                                                : 'text-white/20'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-white/60 text-sm">
                                                {review.customerName} • {review.date}
                                            </span>
                                        </div>
                                        <p className="text-white mb-4">{review.text}</p>
                                        
                                        {review.hasResponse ? (
                                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                                <p className="text-white text-sm">
                                                    <span className="text-blue-400">Ваш ответ:</span> {review.response}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Напишите ответ..."
                                                    className="flex-1 bg-white/5 border border-white/20 rounded-lg text-white px-4 py-2"
                                                    data-review-id={review.id}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter' && e.target.value.trim()) {
                                                            handleResponse(review.id, e.target.value);
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                />
                                                <button
                                                    onClick={() => {
                                                        const input = document.querySelector(`input[data-review-id="${review.id}"]`);
                                                        if (input && input.value.trim()) {
                                                            handleResponse(review.id, input.value);
                                                            input.value = '';
                                                        }
                                                    }}
                                                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg"
                                                >
                                                    Отправить
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {!review.hasResponse && (
                                        <div className="ml-4">
                                            <AlertCircle className="w-5 h-5 text-yellow-400" />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    
                    {filteredReviews.length === 0 && (
                        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
                            <CardContent className="p-6 text-center">
                                <p className="text-white/60">Нет отзывов, соответствующих выбранным фильтрам</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ManagerDashboard; 