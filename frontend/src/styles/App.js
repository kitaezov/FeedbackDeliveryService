<<<<<<< HEAD
import React, {useEffect, useState, useRef} from 'react';
import {AnimatePresence, motion} from "framer-motion";
import axios from 'axios';
import {Menu, Home, User, LogOut, ShieldCheck} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../features/auth/AuthContext';
import { API_URL } from '../config';

import { LoadingSpinner } from '../common/components/ui/LoadingSpinner';
import LoginModal from '../features/auth/LoginForm';
import {ProfilePage} from '../features/auth/ProfilePage';
import {ReviewForm} from '../features/reviews/ReviewForm';
import ReviewsSection from "../features/reviews/ReviewsSection";
import RestaurantCharts from "../features/restaurants/RestaurantCharts";
import AdminPanel from "../features/admin/AdminPanel";
import NavigationBar from '../components/NavigationBar' ;
import HelpAssistant from "../components/HelpAssistant";
import { Footer } from '../components/Footer';
import RestaurantRatingsPage from "../features/restaurants/RestaurantRatingsPage";
import NotFoundPage from "../components/NotFoundPage";
import RestaurantEditor from "../features/admin/RestaurantEditor";
import CriteriaEditor from "../features/admin/CriteriaEditor";
import SearchPage from "../features/search/SearchPage";

=======
import React, {useState} from 'react';
import {Menu, Home, User, LogOut} from 'lucide-react';
import {Card, CardHeader, CardTitle, CardContent} from '../components/Card';
import {LoadingSpinner} from '../components/LoadingSpinner';
import {LoginModal} from '../features/auth/LoginForm';
import {AnimatedButton} from '../components/AnimatedButton';
import {ProfilePage} from '../features/auth/ProfilePage';
import {ReviewCard} from '../components/ReviewCard';
import {ReviewForm} from '../features/reviews/ReviewForm';
>>>>>>> c0de413dc1865264c2ef241c20aa63fec52080b1

/**
 * Главный компонент приложения FeedbackDelivery
 */
const App = () => {
<<<<<<< HEAD
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth();
=======
    const [rating, setRating] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [feedback, setFeedback] = useState('');
>>>>>>> c0de413dc1865264c2ef241c20aa63fec52080b1
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegistration, setIsRegistration] = useState(false);
<<<<<<< HEAD
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    // WebSocket connection
    const wsRef = useRef(null);
    const [wsConnected, setWsConnected] = useState(false);
    
    // Setup WebSocket connection
    useEffect(() => {
        // Get the host and port from the API_URL
        const apiUrlObj = new URL(API_URL || window.location.origin);
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${apiUrlObj.host}`;
        
        // Create WebSocket connection
        wsRef.current = new WebSocket(wsUrl);
        
        // Connection opened
        wsRef.current.addEventListener('open', (event) => {
            console.log('WebSocket соединение установлено');
            setWsConnected(true);
        });
        
        // Listen for messages
        wsRef.current.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Получено сообщение через WebSocket:', data);
                
                if (data.type === 'new_review') {
                    // Add the new review to the state
                    setReviews(prevReviews => {
                        // Check if we already have this review to avoid duplicates
                        const exists = prevReviews.some(r => r.id === data.review.id);
                        if (exists) return prevReviews;
                        return [data.review, ...prevReviews];
                    });
                }
            } catch (error) {
                console.error('Ошибка при обработке сообщения WebSocket:', error);
            }
        });
        
        // Connection closed
        wsRef.current.addEventListener('close', (event) => {
            console.log('WebSocket соединение закрыто');
            setWsConnected(false);
            
            // Try to reconnect after 3 seconds
            setTimeout(() => {
                if (document.visibilityState === 'visible') {
                    console.log('Попытка восстановления WebSocket соединения...');
                    setupWebSocket();
                }
            }, 3000);
        });
        
        // Error handler
        wsRef.current.addEventListener('error', (error) => {
            console.error('Ошибка WebSocket:', error);
        });
        
        // Cleanup on unmount
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);
    
    // Function to reconnect WebSocket
    const setupWebSocket = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.close();
        }
        
        const apiUrlObj = new URL(API_URL || window.location.origin);
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${apiUrlObj.host}`;
        
        wsRef.current = new WebSocket(wsUrl);
        
        wsRef.current.addEventListener('open', () => {
            console.log('WebSocket соединение восстановлено');
            setWsConnected(true);
        });
        
        // Re-add other event listeners...
    };
    
    // Page visibility change handler for reconnecting
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)) {
                console.log('Страница стала видимой, восстанавливаем WebSocket соединение');
                setupWebSocket();
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await api.get('/reviews');
            
            // Проверяем структуру ответа сервера
            const reviewsData = response.data.reviews || [];
            console.log('Получены отзывы от сервера:', reviewsData);

            const reviewsWithAvatars = reviewsData.map(review => ({
                ...review,
                avatar: `https://i.pravatar.cc/100?u=${review.user_name || 'user'}`,
                date: review.date
            }));

            setReviews(reviewsWithAvatars);
            setLoading(false);
        } catch (err) {
            console.error('Ошибка при загрузке отзывов:', err);
            // setError('Не удалось загрузить отзывы. Попробуйте позже.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const refreshReviews = () => {
        fetchReviews();
    };

    const handleThemeToggle = (darkMode) => {
        setIsDarkMode(darkMode);
        // Additional theme-switching logic
        document.documentElement.classList.toggle('dark', darkMode);
    };

    const handleProfileClick = () => {
        navigateTo('profile');
    };

    const handleNewReview = async (newReviewData) => {
        if (!user || !user.token) {
            console.error('Пользователь не авторизован');
            return;
        }

        const formattedReviewData = {
            userId: user.id,
            restaurantName: newReviewData.restaurantName,
            rating: newReviewData.rating || 5,
            comment: newReviewData.comment,
            ratings: {
                food: newReviewData.foodRating || 0,
                service: newReviewData.serviceRating || 0,
                atmosphere: newReviewData.atmosphereRating || 0,
                price: newReviewData.priceRating || 0,
                cleanliness: newReviewData.cleanlinessRating || 0
            }
        };

        const localNewReview = {
            ...newReviewData,
            id: Date.now(),
            user_name: user.name,
            avatar: `https://i.pravatar.cc/100?u=${user.name}`,
            date: new Date().toISOString().split('T')[0],
            likes: 0,
            comments: 0,
            rating: newReviewData.rating || 5
        };

        try {
            console.log('Отправка отзыва на сервер:', formattedReviewData);
            // Отправляем review на сервер
            const response = await api.post('/reviews', formattedReviewData, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            console.log('Ответ сервера:', response.data);

            // Обновляем локальный список reviews с ID от сервера
            setReviews(prevReviews => [
                {...localNewReview, id: response.data.review.id},
                ...prevReviews.filter(r => r.id !== localNewReview.id)
            ]);

            // Сбрасываем форму или показываем уведомление
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 3000);

        } catch (err) {
            console.error('Ошибка при отправке отзыва:', err);
            console.error('Подробности ошибки:', err.response?.data);
            // Показать пользователю сообщение об ошибке
        }
    };
=======
    const [currentPage, setCurrentPage] = useState('main');
    const [isLoading, setIsLoading] = useState(false);
    const [loginData, setLoginData] = useState({name: '', email: '', password: ''});
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    const getRandomAvatar = () => {
        try {
            const styles = ['micah', 'bottts', 'pixel-art'];
            const style = styles[Math.floor(Math.random() * styles.length)];
            const seed = Math.random().toString(36).substring(7);
            return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
        } catch (error) {
            console.error('Ошибка при генерации аватара:', error);
            return `https://api.dicebear.com/7.x/micah/svg?seed=default`;
        }
    };

    const [reviews, setReviews] = useState([
        {
            id: 1,
            userName: "Анна М.",
            rating: 5,
            date: "2024-01-15",
            comment: "Потрясающий ресторан! Обслуживание на высшем уровне, еда великолепная. Особенно впечатлило разнообразие десертов.",
            restaurantName: "La Belle Cuisine",
            likes: 24,
            avatar: getRandomAvatar()
        },
        {
            id: 2,
            userName: "Иван П.",
            rating: 4,
            date: "2024-01-20",
            comment: "Хорошее место для семейного ужина. Уютная атмосфера, вкусные блюда. Детское меню порадовало разнообразием.",
            restaurantName: "Family Kitchen",
            likes: 15,
            avatar: getRandomAvatar()
        },
        {
            id: 3,
            userName: "Мария К.",
            rating: 5,
            date: "2024-01-25",
            comment: "Лучшие стейки в городе! Шеф-повар настоящий профессионал. Мясо готовят именно так, как просишь.",
            restaurantName: "Meat & Grill",
            likes: 32,
            avatar: getRandomAvatar()
        },
        {
            id: 4,
            userName: "Дмитрий В.",
            rating: 5,
            date: "2024-01-28",
            comment: "Восхитительная итальянская кухня! Паста и пицца на высшем уровне. Атмосфера как в настоящей траттории.",
            restaurantName: "Italiano Vero",
            likes: 28,
            avatar: getRandomAvatar()
        },
        {
            id: 5,
            userName: "Елена С.",
            rating: 4,
            date: "2024-01-30",
            comment: "Отличный выбор морепродуктов. Свежие устрицы и великолепно приготовленные креветки. Немного высокие цены.",
            restaurantName: "Sea Food Paradise",
            likes: 19,
            avatar: getRandomAvatar()
        }
    ]);
>>>>>>> c0de413dc1865264c2ef241c20aa63fec52080b1

    const navigateTo = async (page) => {
        try {
            setIsLoading(true);
<<<<<<< HEAD

            // Use navigate instead of setCurrentPage
            if (page === 'main') {
                navigate('/');
            } else {
                navigate(`/${page}`);
            }

            // Добавим небольшую задержку для визуального отображения перехода
            await new Promise(resolve => setTimeout(resolve, 300));
            
            setIsLoading(false);
            setIsMenuOpen(false);
        } catch (err) {
            console.error('Ошибка при навигации:', err);
            setError('Не удалось перейти на страницу. Попробуйте еще раз.');
=======
            document.body.style.transition = "background-color 0.3s ease-in-out";
            document.body.style.backgroundColor = "rgba(10,10,10,0.7)";

            await new Promise(resolve => setTimeout(resolve, 800));

            setCurrentPage(page);
            document.body.style.opacity = "1";
        } catch (err) {
            console.error('Ошибка при навигации:', err);
            setError('Произошла ошибка при переходе');
        } finally {
>>>>>>> c0de413dc1865264c2ef241c20aa63fec52080b1
            setIsLoading(false);
            setIsMenuOpen(false);
        }
    };

<<<<<<< HEAD
    const handleLogout = () => {
        logout();
        navigateTo('main');
    };

    const handleLoginSuccess = (userData) => {
        console.log('Успешный вход в систему, данные пользователя:', userData);
        
        // Если у пользователя есть аватар, предзагружаем его для кэширования
        if (userData && userData.avatar) {
            // Функция для получения полного URL аватара
            const getAvatarUrl = (avatarPath) => {
                if (!avatarPath) return null;
                
                // Если аватар уже полный URL
                if (avatarPath.startsWith('http')) return avatarPath;
                
                // Для путей, начинающихся с /uploads, добавляем базовый URL сервера
                if (avatarPath.startsWith('/uploads')) {
                    // Добавляем случайный параметр для обхода кэша браузера
                    return `${API_URL}${avatarPath}?t=${new Date().getTime()}`;
                }
                
                // Для путей без начального слеша
                if (!avatarPath.startsWith('/')) {
                    // Добавляем случайный параметр для обхода кэша браузера
                    return `${API_URL}/${avatarPath}?t=${new Date().getTime()}`;
                }
                
                // В остальных случаях просто добавляем базовый URL сервера
                // Добавляем случайный параметр для обхода кэша браузера
                return `${API_URL}${avatarPath}?t=${new Date().getTime()}`;
            };
            
            // Предзагрузка аватара
            const fullAvatarUrl = getAvatarUrl(userData.avatar);
            if (fullAvatarUrl) {
                const img = new Image();
                img.src = fullAvatarUrl;
                console.log('Предзагрузка аватара:', fullAvatarUrl);
                
                // Обновляем глобальное состояние через событие
                const avatarEvent = new CustomEvent('avatar-updated', { 
                    detail: { 
                        userId: userData.id,
                        avatarUrl: userData.avatar
                    } 
                });
                document.dispatchEvent(avatarEvent);
            }
        }
        
        setIsLoginModalOpen(false);
        fetchReviews();
    };

    const switchToRegistration = (isReg) => {
        setIsRegistration(isReg);
    };

    const renderUnauthorizedReviewForm = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`rounded-lg p-8 flex flex-col items-center justify-center ${
                isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-600'
            }`}
        >
            <User className="w-16 h-16 mb-4 animate-pulse" />
            <h3 className="text-xl font-medium mb-2">
                Требуется авторизация
            </h3>
            <p className="text-sm mb-4">
                Чтобы выбрать ресторан и оставить отзыв, необходимо войти или зарегистрироваться
            </p>
            <div className="space-x-4">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
=======
    const handleLoginSubmit = async (e) => {
        try {
            e.preventDefault();
            setIsLoading(true);

            if (!loginData.email || !loginData.password) {
                throw new Error('Заполните все обязательные поля');
            }

            await new Promise(resolve => setTimeout(resolve, 1000));

            setUser({
                name: loginData.name,
                email: loginData.email,
                avatar: getRandomAvatar(),
                totalReviews: 0,
                averageRating: 0,
                totalLikes: 0,
                reviews: []
            });
            setIsLoginModalOpen(false);
        } catch (err) {
            console.error('Ошибка авторизации:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        setUser(null);
        navigateTo('main');
    };

    const handleNewReview = (newReview) => {
        try {
            if (!newReview.rating || !newReview.comment) {
                throw new Error('Заполните все поля отзыва');
            }

            setReviews(prev => [newReview, ...prev]);
            if (user) {
                setUser(prev => ({
                    ...prev,
                    reviews: [newReview, ...prev.reviews],
                    totalReviews: prev.totalReviews + 1,
                    averageRating: (prev.averageRating * prev.totalReviews + newReview.rating) / (prev.totalReviews + 1)
                }));
            }
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 3000);
        } catch (err) {
            console.error('Ошибка при добавлении отзыва:', err);
            setError(err.message);
        }
    };

    const renderUnauthorizedReviewForm = () => (
        <div className="text-center py-8">
            <User className="w-16 h-16 mx-auto text-gray-400 mb-4"/>
            <h3 className="text-xl font-semibold mb-2">Требуется авторизация</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
                Чтобы оставить отзыв, необходимо войти или зарегистрироваться
            </p>
            <div className="space-x-4">
                <AnimatedButton
>>>>>>> c0de413dc1865264c2ef241c20aa63fec52080b1
                    onClick={() => {
                        setIsRegistration(false);
                        setIsLoginModalOpen(true);
                    }}
<<<<<<< HEAD
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isDarkMode
                            ? 'bg-gray-700 text-white hover:bg-gray-600'
                            : 'bg-gray-500 text-white hover:bg-gray-600'
                    }`}
                >
                    Войти
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
=======
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                >
                    Войти
                </AnimatedButton>
                <AnimatedButton
>>>>>>> c0de413dc1865264c2ef241c20aa63fec52080b1
                    onClick={() => {
                        setIsRegistration(true);
                        setIsLoginModalOpen(true);
                    }}
<<<<<<< HEAD
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isDarkMode
                            ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                    }`}
                >
                    Регистрация
                </motion.button>
            </div>
        </motion.div>
    );

    // Обработчик обновления профиля (обновляет пользователя, когда меняется аватар)
    const handleProfileUpdate = (updatedUser) => {
        // Если пользователь существует, обновляем его данные
        if (user && updatedUser) {
            // Копируем обновленного пользователя для установки
            const newUser = { ...user, ...updatedUser };
            
            // Обновляем аватар и другие поля
            if (updatedUser.avatar) {
                newUser.avatar = updatedUser.avatar;
            }
            
            // Обновляем состояние пользователя в контексте аутентификации
            const authEvent = new CustomEvent('auth-changed', { 
                detail: { 
                    isAuthenticated: true,
                    user: newUser
                } 
            });
            document.dispatchEvent(authEvent);
        }
    };

    return (
        <div
            className={`min-h-screen font-source transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'}`}>
            {isLoading && <LoadingSpinner inline size="md" color="blue"/>}
=======
                    className="bg-transparent border border-gray-500 text-gray-500 px-6 py-2 rounded-lg hover:bg-gray-800 hover:text-white"
                >
                    Регистрация
                </AnimatedButton>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen font-source bg-gray-900 text-white">
            {isLoading && <LoadingSpinner/>}
>>>>>>> c0de413dc1865264c2ef241c20aa63fec52080b1

            {error && (
                <div className="fixed top-20 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
                    {error}
                    <button onClick={() => setError(null)} className="ml-2">✕</button>
                </div>
            )}

            {isLoginModalOpen && (
                <LoginModal
                    onClose={() => setIsLoginModalOpen(false)}
<<<<<<< HEAD
                    isRegistration={isRegistration}
                    onLoginSuccess={handleLoginSuccess}
                    switchToRegistration={switchToRegistration}
                />
            )}

            <NavigationBar
                user={user}
                isDarkMode={isDarkMode}
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                navigateTo={navigateTo}
                onProfileClick={() => navigateTo('profile')}
                onThemeToggle={handleThemeToggle}
                onLogout={handleLogout}
                onLogin={() => setIsLoginModalOpen(true)}
                onProfileUpdate={handleProfileUpdate}
            />

            <main className={`pt-20 px-4 max-w-6xl mx-auto ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                <AnimatePresence>
                    {isLoading && (
                        <LoadingSpinner 
                            fullscreen={true} 
                            size="md" 
                            variant="primary"
                            isDarkMode={isDarkMode}
                            text="Загрузка данных..."
                            showLogo={true}
                        />
                    )}
                </AnimatePresence>

                <Routes>
                    <Route path="/" element={
                        <div className="space-y-6">
                            <Card
                                className={`border rounded-lg shadow-md ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-800'}`}>
                                <CardHeader className="border-b p-4">
                                    <CardTitle className="text-xl font-semibold">Рестораны</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4">
                                    {isAuthenticated ? (
                                        <ReviewForm
                                            onSubmit={handleNewReview}
                                            user={user}
                                        />
                                    ) : (
                                        renderUnauthorizedReviewForm()
                                    )}
                                    {submitted && (
                                        <p className="text-green-500 mt-4 font-source">Спасибо за ваш отзыв!</p>
                                    )}
                                </CardContent>
                            </Card>

                            <ReviewsSection
                                reviews={reviews}
                                user={user}
                                onRefresh={refreshReviews}
                                isDarkMode={isDarkMode}
                            />

                            <RestaurantCharts reviews={reviews}/>
                        </div>
                    } />

                    <Route path="/profile" element={
                        isAuthenticated ? (
                            <ProfilePage user={user} onLogout={handleLogout}/>
                        ) : (
                            <div className="text-center p-8">
                                <p>Вам необходимо войти в систему для просмотра профиля</p>
                                <button
                                    onClick={() => setIsLoginModalOpen(true)}
                                    className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
                                >
                                    Войти
                                </button>
                            </div>
                        )
                    } />

                    <Route path="/admin" element={
                        isAuthenticated && (['admin', 'head_admin', 'manager', 'moderator', 'super_admin', 'глав_админ', 'менеджер', 'модератор'].includes(user?.role)) ? (
                            <AdminPanel user={user} />
                        ) : (
                            <div className="text-center p-8">
                                <p>У вас нет доступа к панели администратора</p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
                                >
                                    На главную
                                </button>
                            </div>
                        )
                    } />

                    <Route path="/admin/restaurant/:id" element={
                        isAuthenticated && (['admin', 'head_admin', 'manager', 'moderator', 'super_admin', 'глав_админ', 'менеджер', 'модератор'].includes(user?.role)) ? (
                            <RestaurantEditor user={user} />
                        ) : (
                            <div className="text-center p-8">
                                <p>У вас нет доступа к панели администратора</p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
                                >
                                    На главную
                                </button>
                            </div>
                        )
                    } />
                    
                    <Route path="/admin/restaurant/:id/criteria" element={
                        isAuthenticated && (['admin', 'head_admin', 'manager', 'moderator', 'super_admin', 'глав_админ', 'менеджер', 'модератор'].includes(user?.role)) ? (
                            <CriteriaEditor user={user} />
                        ) : (
                            <div className="text-center p-8">
                                <p>У вас нет доступа к панели администратора</p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
                                >
                                    На главную
                                </button>
                            </div>
                        )
                    } />

                    <Route path="/restaurant-ratings" element={
                        <RestaurantRatingsPage isDarkMode={isDarkMode} />
                    } />
                    
                    <Route path="/restaurant/:slug" element={
                        <RestaurantRatingsPage isDarkMode={isDarkMode} singleRestaurant={true} />
                    } />
                    
                    <Route path="/search" element={
                        <SearchPage isDarkMode={isDarkMode} />
                    } />
                    
                    {/* 404 Page - This must be the last route */}
                    <Route path="*" element={
                        <NotFoundPage isDarkMode={isDarkMode} />
                    } />
                </Routes>

                <HelpAssistant isDarkMode={isDarkMode}/>
            </main>

            <Footer isDarkMode={isDarkMode} />
=======
                    onSubmit={handleLoginSubmit}
                    loginData={loginData}
                    setLoginData={setLoginData}
                    isRegistration={isRegistration}
                />
            )}

            <nav className="fixed top-0 w-full bg-gray-800 shadow-lg z-40">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center py-4">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-lg hover:bg-gray-700"
                        >
                            <Menu className="h-6 w-6"/>
                        </button>
                        <h1
                            onClick={() => navigateTo('main')}
                            className="text-xl font-bold font-playfair cursor-pointer hover:text-gray-400 transition-colors"
                        >
                            FeedbackDelivery
                        </h1>
                        <div className="w-6"/> {/* Placeholder для баланса */}
                    </div>
                </div>
            </nav>

            {isMenuOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ease-in-out opacity-100">
                    <div
                        className="w-64 bg-gray-800 h-full shadow-lg p-4 transform transition-transform duration-300 ease-in-out translate-x-0"
                    >
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="p-2 rounded-lg hover:bg-gray-700"
                        >
                            ✕
                        </button>
                        <ul className="mt-4 space-y-2">
                            <li>
                                <button
                                    onClick={() => navigateTo('main')}
                                    className="w-full flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-lg"
                                >
                                    <Home className="h-5 w-5"/>
                                    <span>Главная</span>
                                </button>
                            </li>
                            {user && (
                                <>
                                    <li>
                                        <button
                                            onClick={() => navigateTo('profile')}
                                            className="w-full flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-lg"
                                        >
                                            <User className="h-5 w-5"/>
                                            <span>Профиль</span>
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-lg text-red-500"
                                        >
                                            <LogOut className="h-5 w-5"/>
                                            <span>Выход</span>
                                        </button>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            )}

            <main className="pt-20 px-4 max-w-4xl mx-auto">
                {currentPage === 'main' && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Оставить отзыв</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {user ? (
                                    <ReviewForm onSubmit={handleNewReview} user={user}/>
                                ) : (
                                    renderUnauthorizedReviewForm()
                                )}
                                {submitted && (
                                    <p className="text-green-500 mt-4 font-source">Спасибо за ваш отзыв!</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Последние отзывы</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {reviews.map(review => (
                                        <ReviewCard key={review.id} review={review}/>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {currentPage === 'profile' && user && (
                    <ProfilePage user={user} onUpdateUser={setUser} onLogout={handleLogout}/>
                )}
            </main>
>>>>>>> c0de413dc1865264c2ef241c20aa63fec52080b1
        </div>
    );
};

export default App;