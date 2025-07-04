import React, {useEffect, useState, useRef} from 'react';
import {AnimatePresence, motion} from "framer-motion";
import axios from 'axios';
import {Menu, Home, User, LogOut, ShieldCheck} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../features/auth/AuthContext';
import { API_URL } from '../config';
import { useTheme } from '../contexts/ThemeContext';

import LoginModal from '../features/auth/LoginForm';
import {ProfilePage} from '../features/auth/ProfilePage';
import ReviewForm from '../features/reviews/ReviewForm';
import ReviewsSection from "../features/reviews/ReviewsSection";
import RestaurantCharts from "../features/restaurants/RestaurantCharts";
import AdminPanel from "../features/admin/AdminPanel";
import NavigationBar from '../components/NavigationBar' ;
import HelpAssistant from "../components/HelpAssistant";
import { Footer } from '../components/Footer';
import RestaurantRatingsPage from "../features/restaurants/RestaurantRatingsPage";
import NotFoundPage from "../components/NotFoundPage";
import RestaurantEditor from "../features/admin/RestaurantEditor";
import SearchPage from "../features/search/SearchPage";
import ManagerDashboard from "../features/manager/ManagerDashboard";

/**
 * Главный компонент приложения FeedbackDelivery
 */
const App = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, logout, setUser } = useAuth();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegistration, setIsRegistration] = useState(false);
    const [error, setError] = useState(null);
    const [reviews, setReviews] = useState([]);
    
    const wsRef = useRef(null);
    const [wsConnected, setWsConnected] = useState(false);
    
    useEffect(() => {
        const apiUrlObj = new URL(API_URL || window.location.origin);
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${apiUrlObj.hostname}:${apiUrlObj.port || 5000}`;
        
        wsRef.current = new WebSocket(wsUrl);
        
        // Сохраняем соединение в глобальном объекте для доступа из других компонентов
        window.webSocket = wsRef.current;
        
        wsRef.current.addEventListener('open', (event) => {
            console.log('WebSocket соединение установлено');
            setWsConnected(true);
        });
        
        wsRef.current.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Получено сообщение через WebSocket:', data);
                
                if (data.type === 'new_review') {
                    setReviews(prevReviews => {
                        const exists = prevReviews.some(r => r.id === data.review.id);
                        if (exists) return prevReviews;
                        return [data.review, ...prevReviews];
                    });
                }
            } catch (error) {
                console.error('Ошибка при обработке сообщения WebSocket:', error);
            }
        });
        
        wsRef.current.addEventListener('close', (event) => {
            console.log('WebSocket соединение закрыто');
            setWsConnected(false);
            
            setTimeout(() => {
                if (document.visibilityState === 'visible') {
                    console.log('Попытка восстановления WebSocket соединения...');
                    setupWebSocket();
                }
            }, 3000);
        });
        
        wsRef.current.addEventListener('error', (error) => {
            console.error('Ошибка WebSocket:', error);
            setWsConnected(false);
            
            setTimeout(() => {
                if (document.visibilityState === 'visible') {
                    console.log('Попытка переподключения после ошибки...');
                    setupWebSocket();
                }
            }, 5000);
        });
        
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);
    
    const setupWebSocket = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.close();
        }
        
        const apiUrlObj = new URL(API_URL || window.location.origin);
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${apiUrlObj.hostname}:${apiUrlObj.port || 5000}`;
        
        wsRef.current = new WebSocket(wsUrl);
        
        // Обновляем глобальную ссылку
        window.webSocket = wsRef.current;
        
        wsRef.current.addEventListener('open', () => {
            console.log('WebSocket соединение восстановлено');
            setWsConnected(true);
        });
        
        wsRef.current.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Получено сообщение через WebSocket:', data);
                
                if (data.type === 'new_review') {
                    setReviews(prevReviews => {
                        const exists = prevReviews.some(r => r.id === data.review.id);
                        if (exists) return prevReviews;
                        return [data.review, ...prevReviews];
                    });
                }
            } catch (error) {
                console.error('Ошибка при обработке сообщения WebSocket:', error);
            }
        });
        
        wsRef.current.addEventListener('close', (event) => {
            console.log('WebSocket соединение закрыто');
            setWsConnected(false);
            
            setTimeout(() => {
                if (document.visibilityState === 'visible') {
                    console.log('Попытка восстановления WebSocket соединения...');
                    setupWebSocket();
                }
            }, 3000);
        });
    };
    
    // Обработчик изменения видимости страницы для переподключения
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
            console.log('Загрузка отзывов из API...');
            // Добавляем параметр запроса для исключения удаленных отзывов
            const response = await api.get('/reviews');
            
            console.log('Ответ API:', response.data);
            
            // Обработка разных возможных структур ответов
            let reviewsData = [];
            
            if (response.data && Array.isArray(response.data.reviews)) {
                // Формат: { reviews: [...] } - наиболее ожидаемый формат
                reviewsData = response.data.reviews;
                console.log('Формат данных: { reviews: [...] }');
            } else if (response.data && response.data.reviews && response.data.reviews.reviews && Array.isArray(response.data.reviews.reviews)) {
                // Формат: { reviews: { reviews: [...] } }
                reviewsData = response.data.reviews.reviews;
                console.log('Формат данных: { reviews: { reviews: [...] } }');
            } else if (Array.isArray(response.data)) {
                // Формат: [...] (массив напрямую)
                reviewsData = response.data;
                console.log('Формат данных: [...] (массив напрямую)');
            } else if (response.data && response.data.reviews === null) {
                // Пустой результат
                reviewsData = [];
                console.log('Формат данных: { reviews: null } (пустой результат)');
            } else {
                console.warn('Непредвиденная структура ответа от АПИ:', response.data);
                reviewsData = [];
            }
            
            console.log('Разобранные данные отзывов:', reviewsData);
            console.log('Количество отзывов:', reviewsData.length);

            if (reviewsData.length === 0) {
                console.warn('Нет отзывов, возвращенных от АПИ');
            }

            // Фильтруем отзывы, исключая удаленные
            const filteredReviews = reviewsData.filter(review => !review.deleted);
            console.log('Отфильтрованные отзывы (без удаленных):', filteredReviews.length);
            
            // Проверяем, есть ли удаленные отзывы
            const deletedReviews = reviewsData.filter(review => review.deleted);
            if (deletedReviews.length > 0) {
                console.warn(`Найдено ${deletedReviews.length} удаленных отзывов, которые будут скрыты`);
            }

            const reviewsWithAvatars = filteredReviews.map(review => ({
                ...review,
                avatar: null,
            }));

            setReviews(reviewsWithAvatars);
        } catch (err) {
            console.error('Ошибка при поиске отзывов:', err);
            console.error('Детали ошибки:', err.response?.data);
            // Попробуйте снова с другой конечной точкой API в качестве резерва
            try {
                console.log('Пробуем запасной API эндпоинт...');
                const fallbackResponse = await axios.get(`${API_URL}/api/reviews`);
                console.log('Ответ от запасного API:', fallbackResponse);
                
                const fallbackData = fallbackResponse.data && fallbackResponse.data.reviews ? 
                    fallbackResponse.data.reviews : 
                    Array.isArray(fallbackResponse.data) ? fallbackResponse.data : [];
                
                console.log('Данные от запасного API:', fallbackData);
                // Фильтруем отзывы, исключая удаленные
                const filteredFallbackData = fallbackData.filter(review => !review.deleted);
                setReviews(filteredFallbackData.map(review => ({...review, avatar: null})));
            } catch (fallbackErr) {
                console.error('Ошибка при запросе резервного API:', fallbackErr);
                setReviews([]);
            }
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);


    const refreshReviews = () => {
        fetchReviews();
    };

    const handleThemeToggle = () => {
        toggleDarkMode();
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
            avatar: null,
            date: new Date().toISOString().split('T')[0],
            likes: 0,
            comments: 0,
            rating: newReviewData.rating || 5,
            deleted: 0 // Явно указываем, что отзыв не удален
        };

        try {
            console.log('Отправка отзыва на сервер:', formattedReviewData);
            // Отправляем review на сервер
            const response = await api.post('/reviews', formattedReviewData, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            console.log('Ответ сервера при создании отзыва:', response.data);

            if (response.data && response.data.review) {
                // Получаем ID нового отзыва из ответа сервера
                const newReviewId = response.data.review.id;
                console.log(`Новый отзыв создан с ID: ${newReviewId}`);

                // Обновляем локальный список reviews с ID от сервера
                const newReviewWithId = {
                    ...localNewReview,
                    id: newReviewId,
                    // Добавляем дополнительные поля из ответа сервера
                    ...response.data.review
                };

                setReviews(prevReviews => [
                    newReviewWithId,
                    ...prevReviews.filter(r => r.id !== localNewReview.id)
                ]);

                // Сбрасываем форму или показываем уведомление
                setSubmitted(true);
                setTimeout(() => setSubmitted(false), 3000);
            } else {
                console.error('Ответ сервера не содержит данные о созданном отзыве:', response.data);
            }

            // Обновляем список отзывов после добавления нового
            setTimeout(() => {
                console.log('Обновление списка отзывов после добавления нового отзыва');
                fetchReviews();
            }, 1000);

        } catch (err) {
            console.error('Ошибка при отправке отзыва:', err);
            console.error('Подробности ошибки:', err.response?.data);
            // Показать пользователю сообщение об ошибке
        }
    };

    const navigateTo = async (page) => {
        try {
            if (page === 'main') {
                navigate('/');
            } else {
                navigate(`/${page}`);
            }
            setIsMenuOpen(false);
        } catch (err) {
            console.error('Ошибка при навигации:', err);
            setError('Не удалось перейти на страницу. Попробуйте еще раз.');
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

        // Логируем роль пользователя, но не делаем автоматический редирект
        if (userData && (userData.role === 'admin' || userData.role === 'super_admin' || userData.role === 'moderator' || 
            userData.role === 'глав_админ' || userData.role === 'head_admin' || 
            userData.role === 'manager' || userData.role === 'менеджер')) {
            console.log('Пользователь имеет административную роль:', userData.role);
        }
    };

    const switchToRegistration = (isReg) => {
        setIsRegistration(isReg);
    };

    const renderUnauthorizedReviewForm = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`rounded-lg p-8 flex flex-col items-center justify-center shadow-lg border ${
                isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-gray-50 text-gray-600 border-gray-200'
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
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md ${
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
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md ${
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

            <main className={`pt-20 px-4 mb-30 max-w-6xl mx-auto ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
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
                        isAuthenticated && (['admin', 'head_admin', 'moderator', 'super_admin', 'глав_админ', 'модератор'].includes(user?.role)) ? (
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
                        isAuthenticated && (['admin', 'head_admin', 'moderator', 'super_admin', 'глав_админ', 'модератор'].includes(user?.role)) ? (
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
                    
                    <Route path="/restaurant-ratings" element={
                        <RestaurantRatingsPage isDarkMode={isDarkMode} />
                    } />
                    
                    <Route path="/restaurant/:slug" element={
                        <RestaurantRatingsPage isDarkMode={isDarkMode} singleRestaurant={true} />
                    } />
                    
                    <Route path="/search" element={
                        <SearchPage isDarkMode={isDarkMode} />
                    } />
                    
                    {/* Manager Dashboard */}
                    <Route path="/manager" element={
                        isAuthenticated && (['manager', 'admin', 'head_admin', 'менеджер'].includes(user?.role)) ? (
                            <React.Suspense fallback={<div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
                            </div>}>
                                {console.log('Роль пользователя для маршрута менеджера:', user?.role)}
                                <ManagerDashboard />
                            </React.Suspense>
                        ) : (
                            <div className="text-center p-8">
                                <p>У вас нет доступа к панели менеджера</p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
                                >
                                    На главную
                                </button>
                            </div>
                        )
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