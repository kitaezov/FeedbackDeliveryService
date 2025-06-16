import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../../components/Card';
import { MessageSquare, Star, Clock, CheckCircle2, AlertCircle, Filter, Search, MapPin } from 'lucide-react';
import api from '../../utils/api';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_URL } from '../../../config';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RatingCriteria } from '../../restaurants/components/RatingCriteria';
import EnhancedManagerDashboard from '../ManagerDashboard';
import useBackendApi from '../../../hooks/useBackendApi';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ManagerDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({
        totalReviews: 0,
        averageRating: 0,
        pendingReviews: 0,
        responseRate: 0
    });
    const [prevStats, setPrevStats] = useState(null);
    const [trends, setTrends] = useState({
        totalReviews: 0,
        averageRating: 0,
        pendingReviews: 0
    });
    const [chartData, setChartData] = useState({
        ratings: [],
        reviews: [],
        restaurantCriteriaRatings: []
    });
    const [filters, setFilters] = useState({
        status: 'all',
        rating: 'all',
        search: '',
        type: 'all'
    });
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState('all');
    
    const { getData, postData } = useBackendApi();
    
    // Анимация для списка отзывов
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
                duration: 0.3
            }
        }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    useEffect(() => {
        if (selectedRestaurant) {
            fetchReviewsFromDatabase();
        }
    }, [selectedRestaurant]);
    
    const getRestaurants = async () => {
        try {
            const response = await getData('manager/restaurants');
            console.log('Получены рестораны:', response);
            
            if (response && Array.isArray(response)) {
                setRestaurants(response);
            } else if (response && response.restaurants && Array.isArray(response.restaurants)) {
                setRestaurants(response.restaurants);
            } else {
                console.error('Неожиданный формат данных для ресторанов:', response);
                setRestaurants([]);
            }
        } catch (error) {
            console.error('Ошибка при получении списка ресторанов:', error);
            setRestaurants([]);
        }
    };
    
    const loadAllData = async () => {
        try {
            setLoading(true);
            
            // Сохраняем текущую статистику как предыдущую для расчета трендов
            setPrevStats({...stats});
            
            // Загружаем рестораны
            await getRestaurants();
            
            // Загружаем отзывы и статистику
            await fetchReviewsFromDatabase();
            await calculateStatsFromDatabase();
            await fetchChartDataFromDatabase();
            
        } catch (error) {
            console.error('Ошибка при загрузке данных:', error);
            toast.error('Не удалось загрузить данные');
        } finally {
            setLoading(false);
        }
    };

    const fetchReviewsFromDatabase = async () => {
        try {
            console.log('Загрузка отзывов из базы данных...');
            
            // Определяем URL в зависимости от выбранного ресторана
            let url = 'manager/reviews';
            if (selectedRestaurant && selectedRestaurant !== 'all') {
                url += `?restaurantId=${selectedRestaurant}`;
            }
            
            const response = await getData(url);
            console.log('Ответ API отзывов:', response);
            
            // Обработка различных форматов ответа
            let reviewsData = [];
            
            if (Array.isArray(response)) {
                reviewsData = response;
            } else if (response && Array.isArray(response.reviews)) {
                reviewsData = response.reviews;
            } else if (response && response.data && Array.isArray(response.data.reviews)) {
                reviewsData = response.data.reviews;
            } else {
                console.error('Неожиданный формат данных:', response);
            }
            
            console.log(`Получено ${reviewsData.length} отзывов`);
            
            // Нормализуем данные отзывов
            const normalizedReviews = reviewsData.map(review => {
                return {
                    id: review.id,
                    user_id: review.user_id || review.userId,
                    user_name: review.user_name || review.userName || (review.user ? review.user.name : 'Пользователь'),
                    rating: review.rating || 0,
                    comment: review.comment || review.text || '',
                    created_at: review.created_at || review.createdAt,
                    responded: review.responded || review.hasResponse || Boolean(review.response),
                    response: review.response || '',
                    restaurant_id: review.restaurant_id || review.restaurantId,
                    restaurant_name: review.restaurant_name || review.restaurantName || '',
                    type: review.type || 'inRestaurant',
                    ratings: review.ratings || {
                        food: review.food_rating || 0,
                        service: review.service_rating || 0,
                        atmosphere: review.atmosphere_rating || 0,
                        price: review.price_rating || 0,
                        cleanliness: review.cleanliness_rating || 0
                    }
                };
            });
            
            setReviews(normalizedReviews);
            
        } catch (error) {
            console.error('Ошибка при загрузке отзывов:', error);
            toast.error('Не удалось загрузить отзывы');
        }
    };

    // Use the enhanced version of the dashboard
    return <EnhancedManagerDashboard />;
};

export default ManagerDashboard; 