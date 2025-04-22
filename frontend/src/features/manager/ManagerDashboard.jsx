import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Star, Clock, Search, ChevronDown, 
    MapPin, MessageSquare, CheckCircle2, AlertCircle,
    DownloadCloud, RefreshCw
} from 'lucide-react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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

    // Форматирование даты с учетом возможных ошибок
    const formatDate = (dateString) => {
        try {
            // Проверка является ли строка датой в ISO формате
            if (dateString && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(dateString)) {
                return new Date(dateString).toLocaleDateString();
            } 
            // Проверка является ли строка Unix timestamp (в миллисекундах)
            else if (dateString && !isNaN(Number(dateString)) && Number(dateString) > 1000000000000) {
                return new Date(Number(dateString)).toLocaleDateString();
            }
            // Проверка является ли строка Unix timestamp (в секундах)
            else if (dateString && !isNaN(Number(dateString)) && Number(dateString) < 1000000000000) {
                return new Date(Number(dateString) * 1000).toLocaleDateString();
            }
            // Если обычное форматирование не сработало, пробуем разные форматы
            else if (dateString) {
                // Пробуем формат YYYY-MM-DD
                if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                    const [year, month, day] = dateString.split('-');
                    return new Date(year, month - 1, day).toLocaleDateString();
                }
                // Пробуем формат DD.MM.YYYY
                else if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
                    const [day, month, year] = dateString.split('.');
                    return new Date(year, month - 1, day).toLocaleDateString();
                }
                // Другие форматы при необходимости
            }
            
            // Если ничего не сработало
            return "Нет даты";
        } catch (e) {
            console.warn("Ошибка форматирования даты:", e, dateString);
            return "Нет даты";
        }
    };

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
                            <p className="text-sm font-medium mb-1 dark:text-gray-300">Ваш ответ:</p>
                            <p className="text-gray-700 dark:text-gray-300">{review.response}</p>
                        </div>
                    ) : (
                        <div>
                            <textarea
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Напишите ваш ответ..."
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

const SimplePieChart = ({ data }) => (
    <div className="h-full flex items-center justify-center">
        <div className="grid grid-cols-2 gap-4 w-full">
            {data?.labels?.map((label, index) => (
                <div key={index} className="flex items-center">
                    <div 
                        className="w-4 h-4 mr-2 rounded-full" 
                        style={{ backgroundColor: data.datasets[0].backgroundColor[index] }}
                    ></div>
                    <div className="text-sm">{label}: {data.datasets[0].data[index]}</div>
                </div>
            ))}
        </div>
    </div>
);

const ManagerDashboard = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
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
            labels: ['Еда', 'Обслуживание', 'Атмосфера', 'Цена', 'Чистота'],
            datasets: [{
                label: 'Категории',
                data: [0, 0, 0, 0, 0],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                ],
            }]
        }
    });
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        // Load data on component mount
        loadAllData();
        // Fetch data every 5 minutes
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
        const getRestaurants = async () => {
            try {
                const response = await api.get('/manager/restaurants');
                console.log('Получены данные о ресторанах:', response.data);
                setRestaurants(response.data);
            } catch (error) {
                console.error('Ошибка при получении данных о ресторанах:', error);
            }
        };

        if (restaurants.length === 0) {
            getRestaurants();
        }
    }, [restaurants.length]);

    const loadAllData = async () => {
        setLoading(true);
        
        try {
            console.log('Начинаем загрузку данных...');
            
            // Попытка получения реальных данных
            try {
                // Получаем данные из API
                const reviewsData = await fetchReviewsFromDatabase();
                console.log('Отзывы загружены, количество:', reviewsData.length);
                
                // Используем загруженные отзывы для расчета статистики
                await calculateStatsFromDatabase();
                
                // Подготавливаем данные для графиков
                await fetchChartDataFromDatabase();
            } catch (error) {
                console.error('Ошибка при загрузке данных из API, генерируем тестовые данные:', error);
                
                // Если получение данных не удалось, генерируем тестовые данные
                const mockReviews = [
                    {
                        id: 1,
                        user: { id: 1, name: 'Иван Иванов', email: 'ivan@example.com' },
                        restaurant: { id: 1, name: 'Итальянский Ресторан' },
                        rating: 4,
                        text: 'Отличная еда и превосходное обслуживание! Паста была восхитительной.',
                        createdAt: new Date().toISOString(),
                        responded: false,
                        response: '',
                        responseDate: null
                    },
                    {
                        id: 2,
                        user: { id: 2, name: 'Алиса Смирнова', email: 'alisa@example.com' },
                        restaurant: { id: 2, name: 'Азиатский Фьюжн' },
                        rating: 5,
                        text: 'Удивительные вкусы и красивая подача. Обязательно вернусь!',
                        createdAt: new Date(Date.now() - 86400000).toISOString(), // вчера
                        responded: false,
                        response: '',
                        responseDate: null
                    },
                    {
                        id: 3,
                        user: { id: 3, name: 'Борис Петров', email: 'boris@example.com' },
                        restaurant: { id: 1, name: 'Итальянский Ресторан' },
                        rating: 3,
                        text: 'Еда была хорошей, но обслуживание было немного медленным. Ждал основное блюдо 30 минут.',
                        createdAt: new Date(Date.now() - 2*86400000).toISOString(), // позавчера
                        responded: false,
                        response: '',
                        responseDate: null
                    }
                ];
                
                setReviews(mockReviews);
                
                // Устанавливаем статистику на основе тестовых данных
                const mockStats = {
                    totalReviews: mockReviews.length,
                    respondedReviews: mockReviews.filter(r => r.responded).length,
                    pendingReviews: mockReviews.filter(r => !r.responded).length,
                    averageRating: mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length,
                    totalRestaurants: 2
                };
                
                setStats(mockStats);
                
                // Устанавливаем тестовые данные для графиков
                setChartData({
                    ratings: {
                        labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
                        datasets: [{
                            label: 'Средний рейтинг',
                            data: [3.5, 4.0, 3.8, 4.2, 4.5, 3.9, 4.1],
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.5)',
                        }]
                    },
                    volumeByDay: {
                        labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
                        datasets: [{
                            label: 'Количество отзывов',
                            data: [5, 8, 3, 6, 10, 12, 4],
                            backgroundColor: 'rgba(99, 102, 241, 0.5)',
                        }]
                    },
                    categoryDistribution: {
                        labels: ['Итальянский Ресторан', 'Азиатский Фьюжн'],
                        datasets: [{
                            label: 'Количество отзывов',
                            data: [2, 1],
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.6)',
                                'rgba(54, 162, 235, 0.6)',
                            ],
                        }]
                    }
                });
                
                console.log('Сгенерированы тестовые данные для отображения');
            }
        } catch (error) {
            console.error('Критическая ошибка при загрузке данных:', error);
        } finally {
            setLoading(false);
            console.log('Загрузка данных завершена');
        }
    };

    const fetchReviewsFromDatabase = async () => {
        try {
            console.log('Запрос отзывов из базы данных...');
            // Corrected API path based on backend routes
            const response = await api.get('/manager/reviews');
            
            if (response.data && Array.isArray(response.data)) {
                console.log(`Найдено ${response.data.length} отзывов`);
                setReviews(response.data);
                return response.data;
            } else if (response.data) {
                // Fallback handling if data is returned but not as an array
                console.log('Данные получены в неожиданном формате, пытаемся адаптировать:', response.data);
                
                let reviews = [];
                if (typeof response.data === 'object') {
                    if (Array.isArray(response.data.reviews)) {
                        reviews = response.data.reviews;
                    } else if (Array.isArray(response.data.data)) {
                        reviews = response.data.data;
                    } else {
                        // If it's a single object, wrap it in an array
                        reviews = [response.data];
                    }
                }
                
                console.log(`Адаптированы данные, получено ${reviews.length} отзывов`);
                setReviews(reviews);
                return reviews;
            } else {
                console.error('API вернул неожиданный формат данных:', response.data);
                throw new Error('Неверный формат данных отзывов');
            }
        } catch (error) {
            console.error('Ошибка при получении отзывов из базы данных:', error);
            // Return empty array instead of throwing error to avoid breaking the dashboard
            return [];
        }
    };

    const calculateStatsFromDatabase = async () => {
        try {
            console.log('Запрос статистики из базы данных...');
            // Corrected API path based on backend routes
            const response = await api.get('/manager/analytics/stats');
            
            if (response.data) {
                console.log('Получена статистика:', response.data);
                
                // Сохраняем предыдущие значения статистики
                setPrevStats({...stats});
                
                // Устанавливаем новые значения статистики
                setStats(response.data);
                
                // Рассчитываем тренды
                calculateTrends(response.data);
                
                return response.data;
            } else {
                console.error('API вернул неожиданный формат данных статистики');
                // Return current stats instead of throwing error
                return stats;
            }
        } catch (error) {
            console.error('Ошибка при получении статистики из базы данных:', error);
            // Return current stats instead of throwing error
            return stats;
        }
    };

    const fetchChartDataFromDatabase = async () => {
        try {
            console.log('Запрос данных для графиков из базы данных...');
            // Corrected API path based on backend routes
            const response = await api.get('/manager/analytics/charts', {
                params: { period: chartPeriod }
            });
            
            if (response.data) {
                console.log('Получены данные для графиков:', response.data);
                
                // Устанавливаем данные для графиков
                setChartData(response.data);
                
                return response.data;
            } else {
                console.error('API вернул неожиданный формат данных для графиков');
                // Return current chart data instead of throwing error
                return chartData;
            }
        } catch (error) {
            console.error('Ошибка при получении данных для графиков из базы данных:', error);
            // In case of error, generate some default chart data
            console.log('Используем локальные данные для графиков');
            
            // Use current chart data instead of throwing error
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
            console.log(`Отправка ответа на отзыв ${reviewId}...`);
            await api.post(`/manager/reviews/${reviewId}/response`, { text: responseText });
            
            console.log('Ответ успешно отправлен');
            // После успешного ответа обновляем данные
            loadAllData();
        } catch (error) {
            console.error('Ошибка при отправке ответа:', error);
            alert('Не удалось отправить ответ. Пожалуйста, попробуйте еще раз.');
        }
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const filteredReviews = reviews.filter(review => {
        // Status filter
        if (filters.status === 'pending' && review.responded) return false;
        if (filters.status === 'responded' && !review.responded) return false;
        
        // Rating filter
        if (filters.rating !== 'all' && review.rating !== parseInt(filters.rating)) return false;
        
        // Search filter (name, text content)
        if (filters.search && !review.text.toLowerCase().includes(filters.search.toLowerCase()) && 
            !review.user?.name?.toLowerCase().includes(filters.search.toLowerCase())) {
            return false;
        }
        
        return true;
    });

    // Sort reviews (newest first)
    const sortedReviews = [...filteredReviews].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );

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
            
            // Определяем разделитель для CSV (точка с запятой лучше работает с Excel в русской локали)
            const delimiter = ';';
            
            // Получаем все отзывы для экспорта с корректным форматированием
            const rows = reviews.map(review => {
                // Определяем имя пользователя
                const userName = review.user?.name || review.userName || 
                                (review.author ? (typeof review.author === 'string' ? review.author : review.author.name) : null) || 
                                review.username || "Анонимно";
                
                // Определяем название ресторана
                const restaurantName = review.restaurant?.name || review.restaurantName || "Неизвестно";
                
                // Форматируем дату
                let dateFormatted = "Нет даты";
                try {
                    if (review.createdAt) {
                        if (typeof review.createdAt === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(review.createdAt)) {
                            dateFormatted = new Date(review.createdAt).toLocaleDateString();
                        } else if (!isNaN(Number(review.createdAt))) {
                            dateFormatted = new Date(Number(review.createdAt)).toLocaleDateString();
                        } else {
                            dateFormatted = review.createdAt;
                        }
                    }
                } catch (e) {
                    console.warn('Ошибка форматирования даты для CSV:', e);
                }
                
                return {
                    "ID": review.id || review._id || "",
                    "Пользователь": userName,
                    "Ресторан": restaurantName,
                    "Рейтинг": review.rating || review.stars || 0,
                    "Отзыв": review.text || review.comment || review.content || review.feedback || "",
                    "Дата": dateFormatted,
                    "Статус": review.responded ? "Отвечено" : "Ожидает ответа",
                    "Ответ": review.response || review.answer || review.responseText || ""
                };
            });
            
            // Формируем заголовки CSV
            const headers = Object.keys(rows[0]);
            const headerRow = headers.map(escapeCSV).join(delimiter);
            
            // Формируем строки данных
            const csvRows = rows.map(row => {
                return headers.map(header => {
                    return escapeCSV(row[header]);
                }).join(delimiter);
            });
            
            // Добавляем BOM для корректного отображения кириллицы в Excel
            const BOM = "\uFEFF";
            
            // Создаем полный CSV с заголовками и BOM
            const csvContent = BOM + headerRow + '\r\n' + csvRows.join('\r\n');
            
            // Создаем blob и ссылку для скачивания
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            // Создаем имя файла с датой
            const date = new Date();
            const formattedDate = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            const fileName = `reviews_export_${formattedDate}.csv`;
            
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Освобождаем URL объект
            setTimeout(() => {
                URL.revokeObjectURL(url);
                console.log('CSV файл успешно сохранен:', fileName);
                alert(`Файл "${fileName}" успешно сохранен`);
            }, 100);
            
        } catch (error) {
            console.error('Ошибка при экспорте данных в CSV:', error);
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
                <h1 className="text-2xl font-bold dark:text-white">Панель управления</h1>
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
                    trend={trends.totalReviews}
                />
                <StatCard
                    title="Средний рейтинг"
                    value={Number(stats.averageRating).toFixed(1)}
                    icon={Star}
                    color="text-yellow-500"
                    trend={trends.averageRating}
                />
                <StatCard
                    title="Ожидают ответа"
                    value={stats.pendingReviews}
                    icon={Clock}
                    color="text-orange-500"
                    trend={trends.pendingReviews}
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
                                        Рейтинг
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Отзывы
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
                                                {restaurant.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                                <span className="text-sm text-gray-900 dark:text-white">
                                                    {typeof restaurant.rating === 'number' ? restaurant.rating.toFixed(1) : 'Нет'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {restaurant.reviews || restaurant.reviewCount || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                {restaurant.type || restaurant.category || 'Общий'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                restaurant.status === 'active' || restaurant.status === 'открыт' 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}>
                                                {restaurant.status || 'активен'}
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