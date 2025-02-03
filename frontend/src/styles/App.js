import React, {useState} from 'react';
import {Moon, Sun, Menu, Home, User, LogOut} from 'lucide-react';
import {Card, CardHeader, CardTitle, CardContent} from '../components/Card';
import {LoadingSpinner} from '../components/LoadingSpinner';
import {LoginModal} from '../features/auth/LoginForm';
import {AnimatedButton} from '../components/AnimatedButton';
import {CompactRatingCategory} from '../components/RatingStars';
import {ProfilePage } from '../features/auth/ProfilePage';
import {ReviewCard} from '../components/ReviewCard';
import {ReviewForm} from '../features/reviews/ReviewForm';

const App = () => {
    const [rating, setRating] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegistration, setIsRegistration] = useState(false);
    const [currentPage, setCurrentPage] = useState('main');
    const [isLoading, setIsLoading] = useState(false);
    const [loginData, setLoginData] = useState({name: '', email: '', password: ''});
    const [user, setUser] = useState(null);

    const getRandomAvatar = () => {
        const styles = ['micah', 'bottts', 'pixel-art'];
        const style = styles[Math.floor(Math.random() * styles.length)];
        const seed = Math.random().toString(36).substring(7);
        return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
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

    const navigateTo = async (page) => {
        setIsLoading(true);

        document.body.style.transition = "background-color 0.3s ease-in-out";
        document.body.style.backgroundColor = "rgba(10,10,10,0.7)";


        await new Promise(resolve => setTimeout(resolve, 800));

        setCurrentPage(page);
        document.body.style.opacity = "1";

        setIsLoading(false);
        setIsMenuOpen(false);
    };


    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
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
        setIsLoading(false);
    };

    const handleLogout = () => {
        setUser(null);
        navigateTo('main');
    };

    const handleNewReview = (newReview) => {
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
                    onClick={() => {
                        setIsRegistration(false);
                        setIsLoginModalOpen(true);
                    }}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                >
                    Войти
                </AnimatedButton>
                <AnimatedButton
                    onClick={() => {
                        setIsRegistration(true);
                        setIsLoginModalOpen(true);
                    }}
                    className="bg-transparent border border-gray-500 text-gray-500 px-6 py-2 rounded-lg hover:bg-gray-800 hover:text-white"
                >
                    Регистрация
                </AnimatedButton>
            </div>
        </div>
    );


    return (
        <div className={`min-h-screen font-source ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-900 text-white'}`}>
            {isLoading && <LoadingSpinner/>}
            {isLoginModalOpen && (
                <LoginModal
                    onClose={() => setIsLoginModalOpen(false)}
                    onSubmit={handleLoginSubmit}
                    loginData={loginData}
                    setLoginData={setLoginData}
                    isRegistration={isRegistration}
                />
            )}

            <nav className="fixed top-0 w-full bg-white dark:bg-gray-800 shadow-lg z-40">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center py-4">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <Menu className="h-6 w-6"/>
                        </button>
                        <h1
                            onClick={() => navigateTo('main')}
                            className="text-xl font-bold font-playfair cursor-pointer hover:text-gray-400 transition-colors"
                        >
                            FeedbackDelivery
                        </h1>
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            {isDarkMode ? <Sun className="h-6 w-6"/> : <Moon className="h-6 w-6"/>}
                        </button>
                    </div>
                </div>
            </nav>

            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ease-in-out opacity-100">
                    <div
                        className="w-64 bg-white dark:bg-gray-800 h-full shadow-lg p-4 transform transition-transform duration-300 ease-in-out translate-x-0"
                        style={{transform: isMenuOpen ? 'translateX(0)' : 'translateX(-100%)'}}
                    >
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            ✕
                        </button>
                        <ul className="mt-4 space-y-2">
                            <li>
                                <button
                                    onClick={() => navigateTo('main')}
                                    className="w-full flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
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
                                            className="w-full flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                        >
                                            <User className="h-5 w-5"/>
                                            <span>Профиль</span>
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-red-500"
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
        </div>
    );
};

export default App;