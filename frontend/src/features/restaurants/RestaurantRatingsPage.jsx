import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Star, Search, Filter, MapPin, Award, ArrowLeft } from 'lucide-react';
import RestaurantListView from "./RestaurantCharts";
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

// Демо-данные для отображения, в реальном приложении это должно приходить с API
const sampleReviews = [
    {
        restaurantName: 'Итальянский дворик',
        ratings: { food: 4.8, service: 4.6, atmosphere: 4.9 },
        likes: 156,
        timestamp: Date.now() - 1000000
    },
    {
        restaurantName: 'Азиатский бриз',
        ratings: { food: 4.7, service: 4.3, atmosphere: 4.5 },
        likes: 132,
        timestamp: Date.now() - 2000000
    },
    {
        restaurantName: 'У Михалыча',
        ratings: { food: 4.9, service: 4.8, atmosphere: 4.2 },
        likes: 201,
        timestamp: Date.now() - 500000
    },
    {
        restaurantName: 'Морской причал',
        ratings: { food: 4.4, service: 4.7, atmosphere: 4.8 },
        likes: 175,
        timestamp: Date.now() - 1500000
    },
    {
        restaurantName: 'Французская лавка',
        ratings: { food: 4.6, service: 4.5, atmosphere: 4.7 },
        likes: 145,
        timestamp: Date.now() - 800000
    },
    {
        restaurantName: 'Грузинская кухня',
        ratings: { food: 4.9, service: 4.4, atmosphere: 4.6 },
        likes: 188,
        timestamp: Date.now() - 300000
    },
    {
        restaurantName: 'Мексиканский уголок',
        ratings: { food: 4.5, service: 4.2, atmosphere: 4.4 },
        likes: 120,
        timestamp: Date.now() - 2500000
    },
    {
        restaurantName: 'Американский бургер',
        ratings: { food: 4.6, service: 4.1, atmosphere: 4.0 },
        likes: 167,
        timestamp: Date.now() - 1800000
    }
];

// Категории ресторанов для фильтрации
const categories = [
    { id: 'all', name: 'Все рестораны' },
    { id: 'italian', name: 'Итальянская кухня' },
    { id: 'asian', name: 'Азиатская кухня' },
    { id: 'russian', name: 'Русская кухня' },
    { id: 'seafood', name: 'Морепродукты' },
    { id: 'french', name: 'Французская кухня' },
    { id: 'georgian', name: 'Грузинская кухня' },
    { id: 'mexican', name: 'Мексиканская кухня' },
    { id: 'american', name: 'Американская кухня' }
];

const RestaurantRatingsPage = ({ isDarkMode = false, singleRestaurant = false }) => {
    const { slug } = useParams();
    const [restaurants, setRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');

    useEffect(() => {
        const fetchRestaurants = async () => {
            setLoading(true);
            setError(null);
            try {
                if (singleRestaurant && slug) {
                    // Fetch single restaurant by slug
                    const response = await api.get(`/restaurants/by-slug/${slug}`);
                    if (response.data.restaurant) {
                        setRestaurants([response.data.restaurant]);
                        setFilteredRestaurants([response.data.restaurant]);
                        setSelectedRestaurant(response.data.restaurant);
                    } else {
                        setError('Ресторан не найден');
                    }
                } else {
                    // Fetch all restaurants
                    const response = await api.get('/restaurants');
                    const activeRestaurants = response.data.restaurants.filter(r => r.is_active);
                    setRestaurants(activeRestaurants);
                    setFilteredRestaurants(activeRestaurants);
                }
            } catch (err) {
                console.error('Error fetching restaurants:', err);
                setError('Не удалось загрузить данные ресторанов');
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, [singleRestaurant, slug]);

    const themeClasses = {
        background: isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800',
        card: isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
        highlight: isDarkMode ? 'text-gray-400' : 'text-gray-600',
        button: isDarkMode
            ? 'bg-gray-800 hover:bg-gray-700 text-white ring-1 ring-gray-700'
            : 'bg-white hover:bg-gray-100 text-gray-800 ring-1 ring-gray-200',
        activeButton: isDarkMode
            ? 'bg-gray-700 text-gray-300 ring-1 ring-gray-600'
            : 'bg-gray-200 text-gray-700 ring-1 ring-gray-300',
        input: isDarkMode
            ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-400'
            : 'bg-white border-gray-200 text-gray-800 placeholder:text-gray-500'
    };

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        
        // Filter restaurants based on search term
        if (term.trim() === '') {
            setFilteredRestaurants(restaurants);
        } else {
            const filtered = restaurants.filter(restaurant => 
                restaurant.name.toLowerCase().includes(term.toLowerCase()) ||
                (restaurant.address && restaurant.address.toLowerCase().includes(term.toLowerCase()))
            );
            setFilteredRestaurants(filtered);
        }
    };

    // Render a restaurant card
    const renderRestaurantCard = (restaurant) => {
        const { id, name, address, image_url, rating, slug } = restaurant;
        
        return (
            <motion.div
                key={id}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`rounded-lg overflow-hidden shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
                <Link to={`/restaurant/${slug || id}`} className="block">
                    <div className="h-48 bg-gray-300 overflow-hidden">
                        {image_url ? (
                            <img 
                                src={image_url} 
                                alt={name} 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                <Award size={48} className="text-gray-400" />
                            </div>
                        )}
                    </div>
                    <div className="p-4">
                        <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            {name}
                        </h3>
                        <div className="flex items-center mt-1">
                            <MapPin size={16} className={`mr-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {address || 'Адрес не указан'}
                            </p>
                        </div>
                        <div className="flex items-center mt-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                    key={i}
                                    size={16}
                                    fill={i < Math.round(rating || 0) ? '#FFD700' : 'none'}
                                    stroke={i < Math.round(rating || 0) ? '#FFD700' : '#CBD5E0'}
                                />
                            ))}
                            <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {rating ? rating.toFixed(1) : 'Нет оценок'}
                            </span>
                        </div>
                    </div>
                </Link>
            </motion.div>
        );
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 flex justify-center items-center" style={{ minHeight: '400px' }}>
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <motion.div 
                className="h-full flex flex-col items-center justify-center px-4"
                initial="initial"
                animate="animate"
                variants={{
                    initial: { opacity: 0, y: 20 },
                    animate: { 
                        opacity: 1, 
                        y: 0,
                        transition: {
                            duration: 0.6,
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                            staggerChildren: 0.1
                        }
                    }
                }}
                style={{ minHeight: '70vh' }}
            >
                <div className={`w-full max-w-lg border rounded-lg shadow-lg ${
                    isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-800'
                }`}>
                    <div className="border-b p-6 flex flex-col items-center">
                        <motion.div
                            className={`mb-4 p-4 rounded-full bg-red-100 dark:bg-red-900/20`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ 
                                type: "spring", 
                                stiffness: 260, 
                                damping: 20,
                                delay: 0.2 
                            }}
                        >
                            <Award className={`w-16 h-16 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
                        </motion.div>
                        <motion.h2 
                            className="text-3xl font-bold text-center"
                            variants={{
                                initial: { opacity: 0, y: 20 },
                                animate: { 
                                    opacity: 1, 
                                    y: 0,
                                    transition: { duration: 0.4 }
                                }
                            }}
                        >
                            {error}
                        </motion.h2>
                        <motion.p 
                            className="text-xl mt-2 text-center"
                            variants={{
                                initial: { opacity: 0, y: 20 },
                                animate: { 
                                    opacity: 1, 
                                    y: 0,
                                    transition: { duration: 0.4 }
                                }
                            }}
                        >
                            Данные недоступны
                        </motion.p>
                    </div>
                    
                    <div className="p-6 text-center">
                        <motion.p 
                            className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                            variants={{
                                initial: { opacity: 0, y: 20 },
                                animate: { 
                                    opacity: 1, 
                                    y: 0,
                                    transition: { duration: 0.4 }
                                }
                            }}
                        >
                            К сожалению, произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.
                        </motion.p>
                        
                        {singleRestaurant && (
                            <motion.button
                                onClick={() => window.location.href = '/restaurant-ratings'}
                                className={`inline-flex items-center bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                variants={{
                                    initial: { opacity: 0, y: 20 },
                                    animate: { 
                                        opacity: 1, 
                                        y: 0,
                                        transition: { duration: 0.4 }
                                    }
                                }}
                            >
                                <ArrowLeft size={16} className="mr-2" /> Вернуться к списку ресторанов
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    }

    // Render section showing top restaurants
    const renderTopRestaurants = () => {
        if (filteredRestaurants.length === 0) {
            return (
                <div className="text-center py-8">
                    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                        Рестораны по вашему запросу не найдены
                    </p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRestaurants.map(restaurant => renderRestaurantCard(restaurant))}
            </div>
        );
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
            <div className="container mx-auto px-4 py-8 restaurant-section">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">
                        {singleRestaurant && selectedRestaurant 
                            ? selectedRestaurant.name 
                            : 'Рейтинги ресторанов'}
                    </h1>
                    
                    {singleRestaurant ? (
                        <Link to="/restaurant-ratings" className="flex items-center text-gray-600">
                            <ArrowLeft size={16} className="mr-1" /> Все рестораны
                        </Link>
                    ) : (
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Поиск ресторана..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className={`border rounded-lg px-10 py-2 w-full md:w-64 ${
                                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-300'
                                }`}
                            />
                            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                        </div>
                    )}
                </div>

                {singleRestaurant && selectedRestaurant ? (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="h-64 bg-gray-200 relative">
                            {selectedRestaurant.image_url ? (
                                <img 
                                    src={selectedRestaurant.image_url} 
                                    alt={selectedRestaurant.name} 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                    <Award size={64} className="text-gray-400" />
                                </div>
                            )}
                        </div>
                        
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star 
                                        key={i}
                                        size={20}
                                        fill={i < Math.round(selectedRestaurant.rating || 0) ? '#FFD700' : 'none'}
                                        stroke={i < Math.round(selectedRestaurant.rating || 0) ? '#FFD700' : '#CBD5E0'}
                                    />
                                ))}
                                <span className="ml-2 text-gray-600">
                                    {selectedRestaurant.rating ? selectedRestaurant.rating.toFixed(1) : 'Нет оценок'}
                                </span>
                            </div>
                            
                            <p className="text-gray-700 mb-4">{selectedRestaurant.description || 'Описание отсутствует'}</p>
                            
                            {selectedRestaurant.website && (
                                <div className="mb-2">
                                    <strong className="text-gray-700">Сайт:</strong> 
                                    <a href={selectedRestaurant.website} target="_blank" rel="noopener noreferrer" className="text-gray-600 ml-2">
                                        {selectedRestaurant.website}
                                    </a>
                                </div>
                            )}
                            
                            {selectedRestaurant.contact_phone && (
                                <div className="mb-2">
                                    <strong className="text-gray-700">Телефон:</strong> 
                                    <span className="ml-2">{selectedRestaurant.contact_phone}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    renderTopRestaurants()
                )}
            </div>
        </div>
    );
};

export default RestaurantRatingsPage;