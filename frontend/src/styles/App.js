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


/**
 * Главный компонент приложения FeedbackDelivery
 */
const App = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegistration, setIsRegistration] = useState(false);
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

    const navigateTo = async (page) => {
        try {
            setIsLoading(true);

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
            setIsLoading(false);
            setIsMenuOpen(false);
        }
    };

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
                    onClick={() => {
                        setIsRegistration(false);
                        setIsLoginModalOpen(true);
                    }}
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
                    onClick={() => {
                        setIsRegistration(true);
                        setIsLoginModalOpen(true);
                    }}
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

            {error && (
                <div className="fixed top-20 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
                    {error}
                    <button onClick={() => setError(null)} className="ml-2">✕</button>
                </div>
            )}

            {isLoginModalOpen && (
                <LoginModal
                    onClose={() => setIsLoginModalOpen(false)}
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
        </div>
    );
};

export default App;