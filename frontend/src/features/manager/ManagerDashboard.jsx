import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Star, Clock, Search, ChevronDown, 
    MapPin, MessageSquare, CheckCircle2, AlertCircle,
    DownloadCloud, RefreshCw
} from 'lucide-react';
import useBackendApi from '../../hooks/useBackendApi';
import LoadingSpinner from '../../components/LoadingSpinner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Форматирование даты с учетом возможных ошибок
const formatDate = (dateString) => {
    try {
        // ISO формат (наиболее распространенный)
        if (dateString && typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(dateString)) {
            const date = new Date(dateString);
            return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth()+1).toString().padStart(2, '0')}.${date.getFullYear()}`;
        } 
        // Unix timestamp в миллисекундах
        else if (dateString && !isNaN(Number(dateString)) && Number(dateString) > 1000000000000) {
            const date = new Date(Number(dateString));
            return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth()+1).toString().padStart(2, '0')}.${date.getFullYear()}`;
        }
        // Unix timestamp в секундах
        else if (dateString && !isNaN(Number(dateString)) && Number(dateString) < 1000000000000) {
            const date = new Date(Number(dateString) * 1000);
            return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth()+1).toString().padStart(2, '0')}.${date.getFullYear()}`;
        }
        // Формат YYYY-MM-DD
        else if (dateString && typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            const [year, month, day] = dateString.split('-');
            return `${day}.${month}.${year}`;
        }
        // Формат DD.MM.YYYY
        else if (dateString && typeof dateString === 'string' && /^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
            return dateString;
        }
        // Если не распознан формат
        else if (dateString) {
            return String(dateString);
        }
        
        // Если ничего не сработало
        return "Нет даты";
    } catch (e) {
        console.warn("Ошибка форматирования даты:", e, dateString);
        return "Нет даты";
    }
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { 
            duration: 0.5,
            when: "beforeChildren",
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
        y: 0, 
        opacity: 1,
        transition: { duration: 0.3 }
    }
};

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
    <motion.div 
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center gap-4"
    >
        <div className={`rounded-full p-3 ${color} bg-opacity-10`}>
            <Icon className={`${color}`} size={22} />
        </div>
        <div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
            <div className="flex items-center gap-2">
                <p className="text-2xl font-bold dark:text-white">{value}</p>
                {trend && (
                    <span className={`text-xs font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {trend > 0 ? `+${trend}%` : `${trend}%`}
                    </span>
                )}
            </div>
        </div>
    </motion.div>
);

const ChartCard = ({ title, children, className = '' }) => (
    <motion.div 
        variants={itemVariants}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${className}`}
    >
        <h3 className="text-lg font-semibold mb-4 dark:text-white">{title}</h3>
        <div className="h-64">
            {children}
        </div>
    </motion.div>
);

const ReviewItem = ({ review, onRespond }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [responseText, setResponseText] = useState('');

    // Получение имени пользователя с учетом разных форматов данных
    const getUserName = () => {
        // Проверяем различные структуры данных для имени пользователя
        if (review.user?.name) {
            return review.user.name;
        } else if (review.userName) {
            return review.userName;
        } else if (review.author) {
            return typeof review.author === 'string' ? review.author : review.author.name || 'Анонимно';
        } else if (review.username) {
            return review.username;
        } else {
            return 'Анонимно';
        }
    };

    return (
        <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-3"
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="font-medium dark:text-white">{getUserName()}</h4>
                    <div className="flex items-center">
                        <div className="flex items-center mr-3">
                            {[...Array(5)].map((_, i) => (
                                <Star 
                                    key={i} 
                                    size={16} 
                                    className={i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"} 
                                />
                            ))}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(review.createdAt)}
                        </span>
                    </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                    review.responded ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                }`}>
                    {review.responded ? 'Отвечено' : 'Ожидает'}
                </span>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-2">{review.text}</p>
            
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-600 dark:text-blue-400 text-sm flex items-center hover:underline"
            >
                {isExpanded ? 'Свернуть' : 'Подробнее'} <ChevronDown size={16} className={`ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            
            {isExpanded && (
                <div className="mt-3">
                    {review.responded ? (
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                            <p className="text-sm font-medium mb-1 dark:text-gray-300">
                                <span className="text-blue-600 dark:text-blue-400">
                                    {review.restaurant?.name || 'Ресторан'}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400"> • Менеджер ресторана</span>
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">{review.response}</p>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-2 flex items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                                    Вы отвечаете как менеджер ресторана
                                </span>
                                <span className="text-blue-600 dark:text-blue-400 font-medium">
                                    {review.restaurant?.name || 'Неизвестный ресторан'}
                                </span>
                            </div>
                            <textarea
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Напишите ваш ответ от имени ресторана..."
                                rows={3}
                            />
                            <button
                                onClick={() => {
                                    onRespond(review.id, responseText);
                                    setResponseText('');
                                    setIsExpanded(false);
                                }}
                                disabled={!responseText.trim()}
                                className={`mt-2 px-3 py-1 rounded-md text-white ${
                                    responseText.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            >
                                Отправить ответ
                            </button>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};

// Simple chart components to render with mock data
const SimpleLineChart = ({ data }) => (
    <div className="h-full flex items-center justify-center">
        <div className="w-full">
            <div className="flex justify-between mb-4">
                {data?.labels?.map((label, index) => (
                    <div key={index} className="text-xs text-gray-500">{label}</div>
                ))}
            </div>
            <div className="relative h-40">
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200"></div>
                <div className="flex justify-between h-full">
                    {data?.datasets?.[0]?.data.map((value, index) => {
                        const height = `${(value / 5) * 100}%`;
                        return (
                            <div key={index} className="flex flex-col justify-end w-full">
                                <div 
                                    className="bg-blue-500 mx-1 rounded-t"
                                    style={{ height }}
                                ></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    </div>
);

const SimpleBarChart = ({ data }) => (
    <div className="h-full flex items-center justify-center">
        <div className="w-full">
            <div className="flex justify-between mb-4">
                {data?.labels?.map((label, index) => (
                    <div key={index} className="text-xs text-gray-500">{label}</div>
                ))}
            </div>
            <div className="relative h-40">
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200"></div>
                <div className="flex justify-between h-full">
                    {data?.datasets?.[0]?.data.map((value, index) => {
                        const maxValue = Math.max(...data.datasets[0].data);
                        const height = `${(value / maxValue) * 100}%`;
                        return (
                            <div key={index} className="flex flex-col justify-end w-full">
                                <div 
                                    className="bg-indigo-500 mx-1 rounded-t"
                                    style={{ height }}
                                ></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    </div>
);

const SimplePieChart = ({ data }) => {
    // Проверяем наличие данных
    if (!data || !data.labels || !data.datasets || !data.datasets[0] || !data.datasets[0].data) {
        return <div className="h-full flex items-center justify-center text-gray-500">Нет данных</div>;
    }

    // Получаем данные о ресторанах
    const restaurants = data.labels.map((label, index) => ({
        name: label,
        reviews: data.datasets[0].data[index],
        color: data.datasets[0].backgroundColor[index]
    })).sort((a, b) => b.reviews - a.reviews); // Сортируем по убыванию количества отзывов

    // Используем динамически рассчитанные критерии оценок из данных, если они доступны
    // Или используем заглушку, если данных нет
    const reviewCriteria = data.criteriasRatings || [
        { name: 'Качество еды', score: 4.2 },
        { name: 'Обслуживание', score: 4.0 },
        { name: 'Интерьер', score: 4.5 }, 
        { name: 'Соотношение цена/качество', score: 3.8 },
        { name: 'Скорость обслуживания', score: 3.9 }
    ];

    return (
        <div className="h-full flex flex-col">
            {/* Распределение по ресторанам */}
            <div className="mb-5">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">По количеству отзывов:</h4>
                <div className="grid grid-cols-2 gap-3 w-full">
                    {restaurants.map((restaurant, index) => (
                        <div key={index} className="flex items-center">
                            <div 
                                className="w-4 h-4 mr-2 rounded-full" 
                                style={{ backgroundColor: restaurant.color }}
                            ></div>
                            <div className="text-sm truncate">{restaurant.name}: {restaurant.reviews}</div>
                        </div>
                    ))}
                </div>
                
                {/* Если данных мало, показываем сообщение */}
                {restaurants.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 mt-4">
                        Нет данных о ресторанах. Добавьте рестораны и отзывы, чтобы увидеть статистику.
                    </div>
                )}
            </div>
            
            {/* Критерии оценок в отзывах */}
            {restaurants.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Основные критерии оценки:</h4>
                    <div className="space-y-2">
                        {reviewCriteria.map((criterion, index) => (
                            <div key={index} className="flex items-center">
                                <div className="text-sm min-w-20 truncate">{criterion.name}:</div>
                                <div className="flex-grow h-2 bg-gray-200 dark:bg-gray-700 rounded-full mx-2">
                                    <div 
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{ width: `${(criterion.score / 5) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="text-sm font-medium">{criterion.score}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const ManagerDashboard = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [timeRange, setTimeRange] = useState('week');
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        totalReviews: 0,
        respondedReviews: 0,
        pendingReviews: 0,
        averageRating: 0,
        totalRestaurants: 0
    });
    const [prevStats, setPrevStats] = useState({
        totalReviews: 0,
        respondedReviews: 0,
        pendingReviews: 0,
        averageRating: 0,
        totalRestaurants: 0
    });
    const [trends, setTrends] = useState({
        totalReviews: 0,
        averageRating: 0,
        pendingReviews: 0
    });
    const [filters, setFilters] = useState({
        status: 'all',
        rating: 'all',
        search: ''
    });
    const [chartPeriod, setChartPeriod] = useState('week');
    const [chartData, setChartData] = useState({
        ratings: null,
        volumeByDay: null,
        categoryDistribution: null
    });

    // Use our custom hook for API calls
    const { loading: apiLoading, error: apiError, fetchData, postData } = useBackendApi();
    const [loading, setLoading] = useState(true);

    // On component mount, load all data
    useEffect(() => {
        loadAllData();
        
        // Auto-refresh data every 5 minutes
        const interval = setInterval(() => {
            console.log('Автоматическое обновление данных...');
            loadAllData();
        }, 300000); // 5 minutes
        
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // When the chart period changes, reload chart data
        if (!loading) {
            console.log('Обновление данных графика при изменении периода:', chartPeriod);
            fetchChartDataFromDatabase();
        }
    }, [chartPeriod]);

    // Fetch restaurants if not already loaded
    useEffect(() => {
        if (restaurants.length === 0) {
            getRestaurants();
        }
    }, [restaurants.length]);

    const getRestaurants = async () => {
        try {
            const data = await fetchData('manager/restaurants');
            console.log('Получены данные о ресторанах:', data);
            
            // Получаем отзывы для расчета рейтингов и количества отзывов
            const reviewsData = await fetchData('manager/reviews');
            console.log(`Получено ${reviewsData.length} отзывов для обработки рейтингов ресторанов`);
            
            // Обрабатываем данные ресторанов с учетом отзывов
            const processedRestaurants = data.map(restaurant => {
                try {
                    // Находим все отзывы для текущего ресторана
                    const restaurantReviews = reviewsData.filter(review => {
                        try {
                            // Проверяем все возможные поля для связи ресторана с отзывом
                            return (review.restaurantId === restaurant.id) || 
                                   (review.restaurant_id === restaurant.id) ||
                                   (review.restaurantName === restaurant.name) || 
                                   (review.restaurant_name === restaurant.name);
                        } catch (error) {
                            console.warn(`Ошибка при фильтрации отзыва для ресторана ${restaurant.name}:`, error);
                            return false;
                        }
                    });
                    
                    console.log(`Ресторан "${restaurant.name}": найдено ${restaurantReviews.length} отзывов`);
                    
                    // Рассчитываем средний рейтинг на основе отзывов
                    let avgRating = 0;
                    if (restaurantReviews.length > 0) {
                        const ratingsSum = restaurantReviews.reduce((sum, review) => 
                            sum + (Number(review.rating) || 0), 0);
                        avgRating = ratingsSum / restaurantReviews.length;
                        console.log(`Ресторан "${restaurant.name}": средний рейтинг ${avgRating.toFixed(1)}`);
                    }
                    
                    // Обновляем данные ресторана
                    return {
                        ...restaurant,
                        rating: avgRating || restaurant.rating || 0,
                        reviews: restaurantReviews.length,
                        reviewCount: restaurantReviews.length
                    };
                } catch (error) {
                    console.error(`Ошибка при обработке ресторана ${restaurant.name}:`, error);
                    return restaurant;
                }
            });
            
            // Обновляем состояние с обработанными данными
            setRestaurants(processedRestaurants);
        } catch (error) {
            console.error('Ошибка при получении данных о ресторанах:', error);
        }
    };

    const loadAllData = async () => {
        setLoading(true);
        
        try {
            console.log('Начинаем загрузку данных из базы данных...');
            
            // Параллельная загрузка всех данных
            await Promise.all([
                fetchReviewsFromDatabase(),
                calculateStatsFromDatabase(),
                fetchChartDataFromDatabase()
            ]);
            
            console.log('Все данные успешно загружены из базы данных');
        } catch (error) {
            console.error('Ошибка при загрузке данных из базы данных:', error);
            console.log('Убедитесь, что сервер базы данных запущен и доступен');
        } finally {
            setLoading(false);
            console.log('Загрузка данных завершена');
        }
    };
    
    const fetchReviewsFromDatabase = async () => {
        try {
            // Получаем данные с правильного эндпоинта
            const data = await fetchData('reviews');
            console.log('Получены отзывы из базы данных:', data);
            
            // Проверяем структуру ответа
            let reviewsData = [];
            if (data.reviews && Array.isArray(data.reviews)) {
                reviewsData = data.reviews;
            } else if (Array.isArray(data)) {
                reviewsData = data;
            }
            
            // Нормализуем данные отзывов
            const normalizedReviews = reviewsData.map(review => ({
                id: review.id,
                text: review.comment || review.text || review.content || '',
                rating: Number(review.rating) || 0,
                createdAt: review.created_at || review.createdAt || review.date || new Date().toISOString(),
                responded: review.responded || Boolean(review.response),
                response: review.response || '',
                responseDate: review.responseDate || review.response_date || null,
                user: {
                    name: review.user_name || review.userName || review.username || 'Пользователь'
                },
                restaurant: {
                    name: review.restaurant_name || review.restaurantName || 'Ресторан'
                }
            })).filter(review => review.text && review.rating); // Фильтруем невалидные отзывы
            
            console.log(`Обработано ${normalizedReviews.length} валидных отзывов`);
            setReviews(normalizedReviews);
            return normalizedReviews;
        } catch (error) {
            console.error('Ошибка при получении отзывов из базы данных:', error);
            setReviews([]);
            return [];
        }
    };

    const calculateStatsFromDatabase = async () => {
        try {
            const data = await fetchData('manager/analytics/stats');
            console.log('Получена статистика:', data);
            
            // Сохраняем предыдущие значения статистики
            setPrevStats({...stats});
            
            // Устанавливаем новые значения статистики
            setStats(data);
            
            // Рассчитываем тренды
            calculateTrends(data);
            
            return data;
        } catch (error) {
            console.error('Ошибка при получении статистики из базы данных:', error);
            return stats;
        }
    };

    const fetchChartDataFromDatabase = async () => {
        try {
            const data = await fetchData('manager/analytics/charts', { period: chartPeriod });
            console.log('Получены данные для графиков:', data);
            
            // Если данных нет или нет распределения по ресторанам, создаем его из текущих данных
            if (!data.categoryDistribution || !data.categoryDistribution.labels || data.categoryDistribution.labels.length === 0) {
                console.log('Генерируем данные распределения по ресторанам из имеющихся ресторанов и отзывов');
                
                // Подсчитываем количество отзывов для каждого ресторана
                const restaurantCounts = {};
                
                if (reviews && reviews.length > 0) {
                    reviews.forEach(review => {
                        // Получаем название ресторана из отзыва
                        const restaurantName = review.restaurant?.name || 
                                              review.restaurantName || 
                                              (typeof review.restaurant === 'string' ? review.restaurant : null);
                        
                        if (restaurantName) {
                            restaurantCounts[restaurantName] = (restaurantCounts[restaurantName] || 0) + 1;
                        }
                    });
                }
                
                // Если до сих пор нет данных, используем данные из списка ресторанов
                if (Object.keys(restaurantCounts).length === 0 && restaurants && restaurants.length > 0) {
                    restaurants.forEach(restaurant => {
                        if (restaurant.name) {
                            restaurantCounts[restaurant.name] = restaurant.reviewCount || restaurant.reviews || 0;
                        }
                    });
                }
                
                // Сортируем рестораны по количеству отзывов (по убыванию)
                const sortedRestaurants = Object.entries(restaurantCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10); // Берем топ-10 ресторанов
                
                // Формируем данные для графика
                const restaurantLabels = sortedRestaurants.map(([name]) => name);
                const restaurantData = sortedRestaurants.map(([_, count]) => count);
                
                // Генерируем цвета для ресторанов
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
                    'rgba(54, 100, 235, 0.6)'
                ].slice(0, restaurantLabels.length);
                
                // Создаем объект с данными для диаграммы
                data.categoryDistribution = {
                    labels: restaurantLabels,
                    datasets: [{
                        label: 'Количество отзывов',
                        data: restaurantData,
                        backgroundColor: restaurantColors
                    }]
                };
                
                console.log('Сгенерированы данные для распределения по ресторанам:', data.categoryDistribution);
            }
            
            // Рассчитываем оценки по критериям из реальных отзывов
            if (!data.criteriasRatings) {
                // Список критериев, которые мы ищем в отзывах
                const criterias = [
                    { name: 'Качество еды', keywords: ['еда', 'блюдо', 'вкус', 'кухня', 'приготовлен'], totalRating: 0, count: 0 },
                    { name: 'Обслуживание', keywords: ['персонал', 'официант', 'обслуживание', 'сервис', 'внимание'], totalRating: 0, count: 0 },
                    { name: 'Интерьер', keywords: ['интерьер', 'атмосфера', 'дизайн', 'комфорт', 'чисто'], totalRating: 0, count: 0 },
                    { name: 'Соотношение цена/качество', keywords: ['цена', 'стоимость', 'деньги', 'дорого', 'дешево'], totalRating: 0, count: 0 },
                    { name: 'Скорость обслуживания', keywords: ['скорость', 'быстро', 'ожидание', 'долго', 'ждать'], totalRating: 0, count: 0 }
                ];

                // Проходим по всем отзывам и подсчитываем упоминания критериев
                if (reviews && reviews.length > 0) {
                    reviews.forEach(review => {
                        if (!review.text || !review.rating) return;
                        
                        // Текст отзыва в нижнем регистре для поиска ключевых слов
                        const lowerText = review.text.toLowerCase();
                        
                        criterias.forEach(criteria => {
                            // Проверяем, есть ли в отзыве упоминание критерия по ключевым словам
                            const mentionedKeyword = criteria.keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
                            
                            if (mentionedKeyword) {
                                criteria.totalRating += Number(review.rating);
                                criteria.count += 1;
                            }
                        });
                    });
                }

                // Вычисляем средний рейтинг для каждого критерия
                const criteriasRatings = criterias.map(criteria => {
                    return {
                        name: criteria.name,
                        score: criteria.count > 0 ? parseFloat((criteria.totalRating / criteria.count).toFixed(1)) : 0
                    };
                }).sort((a, b) => b.count - a.count); // Сортируем по количеству упоминаний
                
                // Если не хватает данных, заполняем средними значениями от общего рейтинга
                const avgRating = stats.averageRating || 4.0;
                criteriasRatings.forEach(criteria => {
                    if (criteria.score === 0) {
                        criteria.score = avgRating;
                    }
                });
                
                // Добавляем данные о критериях в общий объект данных
                data.criteriasRatings = criteriasRatings;
                
                console.log('Рассчитаны оценки по критериям:', data.criteriasRatings);
            }
            
            // Устанавливаем данные для графиков
            setChartData(data);
            
            return data;
        } catch (error) {
            console.error('Ошибка при получении данных для графиков:', error);
            return chartData;
        }
    };

    const calculateTrends = (newStats) => {
        const newTrends = {
            totalReviews: 0,
            averageRating: 0,
            pendingReviews: 0
        };
        
        try {
            // Only calculate if we have previous stats
            if (prevStats && Object.keys(prevStats).length > 0) {
                // Calculate trend for total reviews (percentage change)
                if (prevStats.totalReviews > 0) {
                    newTrends.totalReviews = Math.round(
                        ((newStats.totalReviews - prevStats.totalReviews) / prevStats.totalReviews) * 100
                    );
                }
                
                // Calculate trend for average rating (percentage change)
                if (prevStats.averageRating > 0) {
                    newTrends.averageRating = Math.round(
                        ((newStats.averageRating - prevStats.averageRating) / prevStats.averageRating) * 100
                    );
                }
                
                // Calculate trend for pending reviews (percentage change)
                if (prevStats.pendingReviews > 0) {
                    newTrends.pendingReviews = Math.round(
                        ((newStats.pendingReviews - prevStats.pendingReviews) / prevStats.pendingReviews) * 100
                    );
                }
                
                console.log('Расчитаны тренды (в %):', newTrends);
            } else {
                console.log('Нет предыдущих статистик для расчета трендов');
            }
        } catch (error) {
            console.error('Ошибка при расчете трендов:', error);
        }
        
        setTrends(newTrends);
    };

    const handleResponse = async (reviewId, responseText) => {
        try {
            await postData('manager/reviews/respond', {
                reviewId,
                responseText
            });
            
            // Обновляем список отзывов после ответа
            await fetchReviewsFromDatabase();
            await calculateStatsFromDatabase();
        } catch (error) {
            console.error('Ошибка при ответе на отзыв:', error);
        }
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const filteredReviews = reviews.filter(review => {
        // Ensure all required data is available
        if (!review || !review.text) {
            console.warn('Skipping invalid review:', review);
            return false;
        }
        
        // Status filter
        if (filters.status === 'pending' && review.responded) return false;
        if (filters.status === 'responded' && !review.responded) return false;
        
        // Rating filter
        if (filters.rating !== 'all' && parseInt(review.rating) !== parseInt(filters.rating)) return false;
        
        // Search filter (name, text content, restaurant name)
        if (filters.search && filters.search.trim() !== '') {
            const searchTerm = filters.search.toLowerCase().trim();
            const textMatch = review.text && review.text.toLowerCase().includes(searchTerm);
            const userMatch = review.user?.name && review.user.name.toLowerCase().includes(searchTerm);
            const restaurantMatch = review.restaurant?.name && review.restaurant.name.toLowerCase().includes(searchTerm);
            
            if (!textMatch && !userMatch && !restaurantMatch) return false;
        }
        
        return true;
    });

    // Сортировка отзывов (сначала новые)
    const sortedReviews = [...filteredReviews].sort((a, b) => {
        // Обработка возможных отсутствующих дат, используя текущее время как значение по умолчанию
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date();
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date();
        return dateB - dateA;
    });

    console.log(`Отфильтрованные отзывы: ${filteredReviews.length} из ${reviews.length} всего`);
    console.log(`Текущие фильтры:`, filters);

    const refreshData = () => {
        loadAllData();
    };

    const exportToCsv = () => {
        try {
            // Проверяем наличие отзывов
            if (!reviews || reviews.length === 0) {
                alert('Нет отзывов для экспорта');
                return;
            }
            
            console.log('Начинаем экспорт в CSV...');
            
            // Создаем функцию для безопасного форматирования строк CSV
            const escapeCSV = (value) => {
                if (value === null || value === undefined) return '';
                // Преобразуем в строку, заменяем двойные кавычки на двойные двойные кавычки
                // и заключаем в кавычки любой текст, содержащий кавычки, запятые, переносы строк
                const str = String(value);
                if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r') || str.includes(';')) {
                    return '"' + str.replace(/"/g, '""') + '"';
                }
                return str;
            };
            
            // Определяем заголовки для CSV
            const headers = [
                'ID',
                'Дата',
                'Пользователь',
                'Ресторан',
                'Рейтинг',
                'Комментарий',
                'Статус ответа'
            ];
            
            // Преобразуем отзывы в строки CSV
            const csvRows = [
                headers.join(';'),
                ...reviews.map(review => [
                    review.id,
                    formatDate(review.date),
                    review.userName,
                    review.restaurantName,
                    review.rating,
                    escapeCSV(review.comment),
                    review.responded ? 'Отвечено' : 'Без ответа'
                ].join(';'))
            ];
            
            // Создаем содержимое файла
            const csvContent = csvRows.join('\n');
            
            // Создаем Blob и ссылку для скачивания
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `reviews_export_${formatDate(new Date())}.csv`;
            
            // Запускаем скачивание
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('Экспорт в CSV завершен успешно');
        } catch (error) {
            console.error('Ошибка при экспорте в CSV:', error);
            alert('Произошла ошибка при экспорте данных');
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="container mx-auto px-4 py-6"
        >
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold dark:text-white">Панель менеджера</h1>
                <div className="flex gap-2">
                    <button 
                        onClick={refreshData}
                        className="p-2 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                        title="Обновить данные"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <button 
                        onClick={exportToCsv}
                        className="p-2 rounded-md bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-300"
                        title="Экспорт данных в CSV"
                    >
                        <DownloadCloud size={18} />
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Всего отзывов"
                    value={stats.totalReviews}
                    icon={MessageSquare}
                    color="text-blue-500"
                 />
                <StatCard
                    title="Средний рейтинг"
                    value={Number(stats.averageRating).toFixed(1)}
                    icon={Star}
                    color="text-yellow-500"
                 />
                <StatCard
                    title="Ожидают ответа"
                    value={stats.pendingReviews}
                    icon={Clock}
                    color="text-orange-500"
                 />
                <StatCard
                    title="Рестораны"
                    value={stats.totalRestaurants}
                    icon={MapPin}
                    color="text-green-500"
                />
            </div>

            {/* Charts Grid */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold dark:text-white">Аналитика</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Период:</span>
                        <select
                            value={chartPeriod}
                            onChange={(e) => {
                                setChartPeriod(e.target.value);
                            }}
                            className="border border-gray-300 dark:border-gray-600 rounded py-1 px-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            <option value="week">Последние 7 дней</option>
                            <option value="month">Последние 30 дней</option>
                            <option value="year">Последние 12 месяцев</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ChartCard title="Средний рейтинг за период" className="col-span-1 lg:col-span-1">
                        {chartData.ratings && (
                            <SimpleLineChart data={chartData.ratings} />
                        )}
                    </ChartCard>
                    
                    <ChartCard title="Количество отзывов по дням" className="col-span-1 lg:col-span-1">
                        {chartData.volumeByDay && (
                            <SimpleBarChart data={chartData.volumeByDay} />
                        )}
                    </ChartCard>
                    
                    <ChartCard title="Распределение по ресторанам" className="col-span-1 lg:col-span-1">
                        {chartData.categoryDistribution && (
                            <SimplePieChart data={chartData.categoryDistribution} />
                        )}
                    </ChartCard>
                </div>
            </div>

            {/* Reviews Management */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <h2 className="text-xl font-semibold dark:text-white">Управление отзывами</h2>
                    
                    <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Поиск отзывов..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                        </div>
                        
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            <option value="all">Все статусы</option>
                            <option value="pending">Ожидают</option>
                            <option value="responded">Отвечено</option>
                        </select>
                        
                        <select
                            value={filters.rating}
                            onChange={(e) => handleFilterChange('rating', e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow p-4">
                    <div className="mb-3 flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Показано {sortedReviews.length} отзывов
                        </span>
                        <button
                            onClick={() => setFilters({ status: 'all', rating: 'all', search: '' })}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Сбросить фильтры
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        {sortedReviews.length > 0 ? (
                            sortedReviews.map(review => (
                                <ReviewItem 
                                    key={review.id} 
                                    review={review} 
                                    onRespond={handleResponse} 
                                />
                            ))
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
                                <AlertCircle size={48} className="mx-auto mb-3 text-gray-400" />
                                <h3 className="text-lg font-semibold dark:text-white">Отзывы не найдены</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Попробуйте изменить фильтры или критерии поиска
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Restaurants section */}
            {restaurants.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold dark:text-white mb-4">Рестораны</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Название
                                    </th>
                  
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Тип
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Статус
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {restaurants.map(restaurant => (
                                    <tr key={restaurant.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {restaurant.name || 'Без названия'}
                                            </div>
                                        </td>
                             
            
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                {restaurant.type || restaurant.category || restaurant.cuisine || 'Общий'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                restaurant.status === 'active' || restaurant.status === 'открыт' || restaurant.status === 1 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}>
                                                {restaurant.status === 1 ? 'активен' : restaurant.status || 'неактивен'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ManagerDashboard; 