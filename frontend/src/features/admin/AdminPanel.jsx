import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Edit, Plus, User, Shield, UserCheck, Settings, Link as LinkIcon, AlertTriangle, UserCog, BookOpen, RefreshCw, XCircle, Info, Lock, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import UserList from './UserList';

// Анимация для контейнеров
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { 
            duration: 0.3,
            when: "beforeChildren",
            staggerChildren: 0.1
        }
    },
    exit: { 
        opacity: 0,
        transition: { duration: 0.2 } 
    }
};

// Анимация для элементов
const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
        y: 0, 
        opacity: 1,
        transition: { 
            type: "spring",
            stiffness: 300,
            damping: 24
        }
    }
};

// Анимация для кнопок
const buttonVariants = {
    hover: {
        scale: 1.03,
        transition: { 
            duration: 0.2,
            type: "spring", 
            stiffness: 400 
        }
    },
    tap: {
        scale: 0.97,
        transition: { 
            duration: 0.1 
        }
    }
};

// Кнопка вкладки с анимацией
const TabButton = ({ active, onClick, icon: Icon, children }) => {
    const buttonVariants = {
        hover: { scale: 1.03, transition: { duration: 0.2 } },
        tap: { scale: 0.97, transition: { duration: 0.1 } }
    };

    return (
        <motion.button
            onClick={onClick}
            className={`
                py-1.5 sm:py-2 px-2 sm:px-4 rounded-md flex items-center text-xs sm:text-sm font-medium
                ${active 
                    ? 'bg-gray-700 text-white dark:bg-gray-800 dark:text-gray-300' 
                    : 'bg-white hover:bg-gray-100 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200'}
            `}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
        >
            <Icon size={16} className="mr-1 sm:mr-2 flex-shrink-0" />
            {children}
        </motion.button>
    );
};

// Причины удаления отзывов
const deletionReasons = [
    "Спам",
    "Оскорбительное содержание",
    "Недостоверная информация",
    "Нарушение правил сайта",
    "Рекламный контент",
    "Мошенничество",
    "Другое"
];

const AdminPanel = ({ user }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('restaurants');
    const [restaurants, setRestaurants] = useState([]);
    const [users, setUsers] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [deletedReviews, setDeletedReviews] = useState([]);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [loading, setLoading] = useState({
        restaurants: false,
        users: false,
        reviews: false,
        deletedReviews: false,
        blockedUsers: false
    });
    const [deleteReason, setDeleteReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [deleteReviewId, setDeleteReviewId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [restaurantToDelete, setRestaurantToDelete] = useState(null);
    const [showDeleteRestaurantModal, setShowDeleteRestaurantModal] = useState(false);
    const [userToBlock, setUserToBlock] = useState(null);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [blockReason, setBlockReason] = useState('');
    const [userToUnblock, setUserToUnblock] = useState(null);
    const [showUnblockModal, setShowUnblockModal] = useState(false);
    
    // После авторизации и проверки прав загружаем заблокированных пользователей
    useEffect(() => {
        // Проверка авторизации
        if (!user || !user.token) {
            navigate('/');
            return;
        }
        
        const adminRoles = ['admin', 'head_admin', 'manager', 'moderator', 'super_admin', 'глав_админ', 'менеджер', 'модератор'];
        if (!adminRoles.includes(user.role)) {
            navigate('/');
            return;
        }
        
        // Автоматически загружаем заблокированных пользователей
        if (user.role === 'admin' || user.role === 'head_admin') {
            fetchBlockedUsers();
        }
    }, [user, navigate]);

    // Set initial active tab based on user role
    useEffect(() => {
        if (user?.role === 'manager') {
            setActiveTab('reviews');
        }
    }, [user?.role]);

    // Fetch restaurants data
    const fetchRestaurants = async () => {
        setLoading(prev => ({ ...prev, restaurants: true }));
        try {
            const response = await api.get('/restaurants');
            setRestaurants(response.data.restaurants || []);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        } finally {
            setLoading(prev => ({ ...prev, restaurants: false }));
        }
    };

    // Fetch users data
    const fetchUsers = async () => {
        setLoading(prev => ({ ...prev, users: true }));
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(prev => ({ ...prev, users: false }));
        }
    };

    // Fetch reviews data
    const fetchReviews = async () => {
        setLoading(prev => ({ ...prev, reviews: true }));
        try {
            const response = await api.get('/reviews');
            setReviews(response.data.reviews || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(prev => ({ ...prev, reviews: false }));
        }
    };

    // Fetch deleted reviews data
    const fetchDeletedReviews = async () => {
        setLoading(prev => ({ ...prev, deletedReviews: true }));
        try {
            const response = await api.get('/admin/deleted-reviews');
            setDeletedReviews(response.data.deletedReviews || []);
        } catch (error) {
            console.error('Error fetching deleted reviews:', error);
        } finally {
            setLoading(prev => ({ ...prev, deletedReviews: false }));
        }
    };

    // Fetch blocked users data
    const fetchBlockedUsers = async () => {
        setLoading(prev => ({ ...prev, blockedUsers: true }));
        try {
            console.log('Запрос списка пользователей для фильтрации заблокированных...');
            
            const response = await api.get('/admin/users');
            console.log('Получены пользователи от сервера:', response.data);
            
            if (!response.data.users || !Array.isArray(response.data.users)) {
                console.error('Неверный формат данных:', response.data);
                setBlockedUsers([]);
                return;
            }
            
            // Выводим значения is_blocked для каждого пользователя
            console.log('Значения is_blocked для всех пользователей:');
            const usersWithDetails = response.data.users.map(user => {
                console.log(`${user.id} - ${user.name}: is_blocked = ${user.is_blocked}, тип: ${typeof user.is_blocked}`);
                return user;
            });
            
            // Фильтруем только заблокированных пользователей с учетом разных типов значений
            const blocked = usersWithDetails.filter(user => {
                const isBlocked = user.is_blocked === 1 || user.is_blocked === '1' || user.is_blocked === true;
                return isBlocked;
            });
            
            console.log('Найденные заблокированные пользователи:', blocked);
            console.log('Количество заблокированных пользователей:', blocked.length);
            
            setBlockedUsers(blocked || []);
        } catch (error) {
            console.error('Error fetching blocked users:', error);
            console.error('Детали ошибки:', error.response?.data);
        } finally {
            setLoading(prev => ({ ...prev, blockedUsers: false }));
        }
    };

    // Load data on tab change
    useEffect(() => {
        if (activeTab === 'restaurants') {
            fetchRestaurants();
        } else if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'reviews') {
            fetchReviews();
        } else if (activeTab === 'deletedReviews') {
            fetchDeletedReviews();
        } else if (activeTab === 'blockedUsers') {
            fetchBlockedUsers();
        }
    }, [activeTab]);

    // Handle delete restaurant
    const handleDeleteRestaurant = async (id) => {
        // Instead of using window.confirm, we'll set the restaurant ID to delete and show our modal
        const restaurant = restaurants.find(r => r.id === id);
        setRestaurantToDelete(restaurant);
        setShowDeleteRestaurantModal(true);
    };

    // Confirm delete restaurant
    const confirmDeleteRestaurant = async () => {
        if (!restaurantToDelete) return;
        
        try {
            await api.delete(`/restaurants/${restaurantToDelete.id}`);
            // Close the modal and refresh the restaurants list
            setShowDeleteRestaurantModal(false);
            setRestaurantToDelete(null);
            fetchRestaurants();
        } catch (error) {
            console.error('Error deleting restaurant:', error);
            alert('Ошибка при удалении ресторана');
        }
    };

    // Cancel delete restaurant
    const cancelDeleteRestaurant = () => {
        setShowDeleteRestaurantModal(false);
        setRestaurantToDelete(null);
    };

    // Update user role with proper role hierarchy
    const handleUpdateRole = async (userId, newRole) => {
        // Don't allow role changes to same or higher level roles
        const roleHierarchy = {
            'head_admin': 100,
            'admin': 80,
            'manager': 50,
            'user': 10
        };

        const currentUserLevel = roleHierarchy[user.role] || 0;
        const newRoleLevel = roleHierarchy[newRole] || 0;

        if (newRoleLevel >= currentUserLevel) {
            alert('Вы не можете назначить роль выше или равную вашей собственной');
            return;
        }

        if (window.confirm(`Вы уверены, что хотите назначить пользователю роль "${newRole}"?`)) {
            try {
                console.log(`Отправка запроса на изменение роли пользователя ${userId} на ${newRole}`);
                const response = await api.put(`/admin/users/${userId}/role`, { role: newRole });
                console.log('Успешный ответ:', response.data);
                fetchUsers();
            } catch (error) {
                console.error('Ошибка обновления роли пользователя:', error);
                console.error('Детали ошибки:', error.response?.data);
                console.error('Статус ошибки:', error.response?.status);
                alert(`Ошибка обновления роли пользователя: ${error.response?.data?.details || error.message || 'Неизвестная ошибка'}`);
            }
        }
    };

    // Show delete modal for review
    const openDeleteModal = (reviewId) => {
        setDeleteReviewId(reviewId);
        setDeleteReason('');
        setCustomReason('');
        setShowDeleteModal(true);
    };

    // Handle delete review
    const handleDeleteReview = async () => {
        let finalReason = deleteReason;
        
        // Если выбрано "Другое", используем пользовательскую причину
        if (deleteReason === "Другое") {
            if (!customReason.trim()) {
                alert('Пожалуйста, укажите причину удаления');
                return;
            }
            finalReason = customReason;
        } else if (!deleteReason) {
            alert('Пожалуйста, выберите причину удаления');
            return;
        }

        try {
            await api.delete(`/admin/reviews/${deleteReviewId}`, {
                data: { reason: finalReason }
            });
            setShowDeleteModal(false);
            fetchReviews();
            // If on the deleted reviews tab, also refresh that data
            if (activeTab === 'deletedReviews') {
                fetchDeletedReviews();
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            alert(error.response?.data?.details || 'Ошибка удаления отзыва');
        }
    };

    // Handle user block
    const handleBlockUser = (userId) => {
        const userObj = users.find(u => u.id === userId);
        if (!userObj) {
            console.error('Пользователь не найден:', userId);
            return;
        }
        
        console.log('Выбран пользователь для блокировки:', userObj);
        setUserToBlock(userObj);
        setBlockReason('');
        setShowBlockModal(true);
    };
    
    // Confirm block user
    const confirmBlockUser = async () => {
        if (!userToBlock || !blockReason.trim()) return;
        
        try {
            console.log('Отправка запроса блокировки пользователя:', {
                userId: userToBlock.id,
                reason: blockReason
            });
            
            // Отправляем запрос блокировки
            const response = await api.post(`admin/users/${userToBlock.id}/block`, { reason: blockReason });
            console.log('Ответ сервера на блокировку:', response.data);
            
            // Обновляем пользователя в списке
            setUsers(prevUsers => prevUsers.map(u => 
                u.id === userToBlock.id ? { 
                    ...u, 
                    is_blocked: 1, 
                    blocked_reason: blockReason
                } : u
            ));
            
            // Создаем обновленного пользователя для списка заблокированных
            const updatedUser = {
                ...userToBlock,
                is_blocked: 1,
                blocked_reason: blockReason
            };
            
            // Всегда обновляем список заблокированных пользователей
            setBlockedUsers(prev => {
                // Проверяем, есть ли этот пользователь уже в списке
                const exists = prev.some(u => u.id === userToBlock.id);
                if (exists) {
                    // Обновляем существующего пользователя
                    return prev.map(u => u.id === userToBlock.id ? updatedUser : u);
                } else {
                    // Добавляем нового заблокированного пользователя
                    return [updatedUser, ...prev];
                }
            });
            
            // Закрываем модальное окно
            setShowBlockModal(false);
            setUserToBlock(null);
            setBlockReason('');
            
            // Если активна вкладка заблокированных пользователей, перезагружаем список
            if (activeTab === 'blockedUsers') {
                fetchBlockedUsers();
            }
            
            // Показываем уведомление пользователю
            alert(`Пользователь ${userToBlock.name} успешно заблокирован.`);
        } catch (error) {
            console.error('Error blocking user:', error);
            alert(`Ошибка при блокировке пользователя: ${error.response?.data?.message || error.message}`);
        }
    };
    
    // Handle user unblock
    const handleUnblockUser = (userId) => {
        const userObj = users.find(u => u.id === userId);
        setUserToUnblock(userObj);
        setShowUnblockModal(true);
    };
    
    // Confirm unblock user
    const confirmUnblockUser = async () => {
        if (!userToUnblock) return;
        
        try {
            // Отправляем запрос разблокировки
            const response = await api.post(`admin/users/${userToUnblock.id}/unblock`);
            
            // Обновляем пользователей в списке
            setUsers(prevUsers => prevUsers.map(u => 
                u.id === userToUnblock.id ? { 
                    ...u, 
                    is_blocked: 0, 
                    blocked_reason: null 
                } : u
            ));
            
            // Если открыта вкладка заблокированных пользователей, удаляем пользователя из этого списка
            if (activeTab === 'blockedUsers') {
                setBlockedUsers(prev => prev.filter(u => u.id !== userToUnblock.id));
            }
            
            // Закрываем модальное окно
            setShowUnblockModal(false);
            setUserToUnblock(null);
            
            // Показываем уведомление пользователю
            alert(`Пользователь ${userToUnblock.name} успешно разблокирован.`);
        } catch (error) {
            console.error('Error unblocking user:', error);
            alert(`Ошибка при разблокировке пользователя: ${error.response?.data?.message || error.message}`);
        }
    };

    // Render restaurant table с обычными кнопками без анимации
    const renderRestaurantTable = () => (
        <div className="overflow-x-auto mt-2 sm:mt-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Управление ресторанами</h2>
                <div className="flex space-x-2">
                    <motion.button 
                        onClick={fetchRestaurants}
                        className="bg-gray-700 text-white hover:bg-gray-600 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md flex items-center overflow-hidden text-xs sm:text-sm"
                        variants={{
                            hover: {
                                backgroundColor: 'var(--gray-600)',
                                transition: { 
                                    duration: 0.2
                                }
                            },
                            tap: {
                                scale: 0.97,
                                transition: { 
                                    duration: 0.1 
                                }
                            }
                        }}
                        whileHover="hover"
                        whileTap="tap"
                        disabled={loading.restaurants}
                    >
                        <RefreshCw size={14} className={`mr-1 ${loading.restaurants ? 'animate-spin' : ''}`} />
                        Обновить
                    </motion.button>
                    
                    <Link to="/admin/restaurant/new">
                        <motion.button
                            className="bg-green-500 hover:bg-green-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-md flex items-center overflow-hidden text-xs sm:text-sm"
                            variants={{
                                hover: {
                                    backgroundColor: 'var(--green-600)',
                                    transition: { 
                                        duration: 0.2
                                    }
                                },
                                tap: {
                                    scale: 0.97,
                                    transition: { 
                                        duration: 0.1 
                                    }
                                }
                            }}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <Plus size={14} className="mr-1" /> Добавить
                        </motion.button>
                    </Link>
                </div>
            </div>
            
            {loading.restaurants ? (
                <div className="flex justify-center py-6 sm:py-10">
                    <LoadingSpinner />
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Название</th>
                                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Статус</th>
                                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">URL</th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Действия</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {restaurants.map((restaurant, index) => (
                                    <motion.tr 
                                        key={restaurant.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                            <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{restaurant.name}</div>
                                            <div className="sm:hidden mt-1">
                                                <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    restaurant.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                }`}>
                                                    {restaurant.is_active ? 'Активен' : 'Неактивен'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                restaurant.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}>
                                                {restaurant.is_active ? 'Активен' : 'Неактивен'}
                                            </span>
                                        </td>
                                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {restaurant.slug ? (
                                                <div className="flex items-center">
                                                    <LinkIcon size={14} className="mr-1" />
                                                    <span>{restaurant.slug}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 dark:text-gray-600">Не задан</span>
                                            )}
                                        </td>
                                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2 sm:space-x-3">
                                                <Link to={`/admin/restaurant/${restaurant.id}`}>
                                                    <motion.button 
                                                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 overflow-hidden"
                                                        variants={{
                                                            hover: {
                                                                color: 'var(--indigo-900)',
                                                                transition: { duration: 0.2 }
                                                            },
                                                            tap: {
                                                                scale: 0.97,
                                                                transition: { duration: 0.1 }
                                                            }
                                                        }}
                                                        whileHover="hover"
                                                        whileTap="tap"
                                                    >
                                                        <Edit size={16} />
                                                    </motion.button>
                                                </Link>
                                                <Link to={`/admin/restaurant/${restaurant.id}/criteria`}>
                                                    <motion.button 
                                                        className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 overflow-hidden"
                                                        variants={{
                                                            hover: {
                                                                color: 'var(--amber-800)',
                                                                transition: { duration: 0.2 }
                                                            },
                                                            tap: {
                                                                scale: 0.97,
                                                                transition: { duration: 0.1 }
                                                            }
                                                        }}
                                                        whileHover="hover"
                                                        whileTap="tap"
                                                    >
                                                        <Settings size={16} />
                                                    </motion.button>
                                                </Link>
                                                <motion.button
                                                    onClick={() => handleDeleteRestaurant(restaurant.id)}
                                                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 overflow-hidden"
                                                    variants={{
                                                        hover: {
                                                            color: 'var(--red-800)',
                                                            transition: { duration: 0.2 }
                                                        },
                                                        tap: {
                                                            scale: 0.97,
                                                            transition: { duration: 0.1 }
                                                        }
                                                    }}
                                                    whileHover="hover"
                                                    whileTap="tap"
                                                >
                                                    <Trash2 size={16} />
                                                </motion.button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                                
                                {restaurants.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                            Нет ресторанов для отображения
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );

    // Render users table with proper role permissions
    const renderUsersTable = () => (
        <UserList 
            user={user}
            onBlockUser={handleBlockUser}
            onUnblockUser={handleUnblockUser}
            onUpdateRole={handleUpdateRole}
        />
    );

    // Рендеринг таблицы отзывов (аналогичные анимации)
    const renderReviewsTable = () => (
        <div className="overflow-x-auto mt-2 sm:mt-4">
            <div className="flex justify-between mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Управление отзывами</h2>
            </div>
            
            {loading.reviews ? (
                <div className="flex justify-center py-6 sm:py-10">
                    <LoadingSpinner />
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Автор</th>
                                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Текст</th>
                                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ресторан</th>
                                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Дата</th>
                                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Действия</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {reviews.map(review => (
                                    <tr key={review.id}>
                                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                            <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{review.user_name}</div>
                                        </td>
                                        <td className="px-2 sm:px-6 py-2 sm:py-4">
                                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-[120px] sm:max-w-xs truncate">
                                                {review.text || review.comment}
                                            </div>
                                            <div className="sm:hidden mt-1 text-xs text-gray-400">
                                                {review.restaurant_name || '-'} • 
                                                {review.created_at ? new Date(review.created_at).toLocaleDateString() : 
                                                review.date ? new Date(review.date).toLocaleDateString() : 'Дата не указана'}
                                            </div>
                                        </td>
                                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{review.restaurant_name || '-'}</div>
                                        </td>
                                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {review.created_at ? new Date(review.created_at).toLocaleDateString() : 
                                                review.date ? new Date(review.date).toLocaleDateString() : 'Дата не указана'}
                                            </div>
                                        </td>
                                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                                            <button
                                                onClick={() => openDeleteModal(review.id)}
                                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                
                                {reviews.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                            Нет отзывов для отображения
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );

    // Рендеринг таблицы удаленных отзывов (аналогичные анимации)
    const renderDeletedReviewsTable = () => (
        <div className="overflow-x-auto mt-2 sm:mt-4">
            <div className="flex justify-between mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Удаленные отзывы</h2>
            </div>
            
            {loading.deletedReviews ? (
                <div className="flex justify-center py-6 sm:py-10">
                    <LoadingSpinner />
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Пользователь</th>
                                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ресторан</th>
                                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Комментарий</th>
                                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Причина</th>
                                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Удалено</th>
                                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Удалил</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {deletedReviews.map(review => (
                                    <tr key={review.id}>
                                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                            <div className="text-xs sm:text-sm text-gray-900 dark:text-white">{review.user_name}</div>
                                            <div className="sm:hidden text-xs text-gray-500">{review.restaurant_name}</div>
                                        </td>
                                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">{review.restaurant_name}</div>
                                        </td>
                                        <td className="px-2 sm:px-6 py-2 sm:py-4">
                                            <div className="text-xs sm:text-sm text-gray-900 dark:text-white max-w-[120px] sm:max-w-xs truncate">{review.comment}</div>
                                            <div className="sm:hidden mt-1 text-xs text-gray-400">
                                                {review.deleted_at ? new Date(review.deleted_at).toLocaleString() : 'Дата не указана'} • 
                                                {review.admin_name}
                                            </div>
                                        </td>
                                        <td className="px-2 sm:px-6 py-2 sm:py-4">
                                            <div className="text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 max-w-[120px] sm:max-w-xs truncate">{review.deletion_reason}</div>
                                        </td>
                                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {review.deleted_at ? new Date(review.deleted_at).toLocaleString() : 'Дата не указана'}
                                            </div>
                                        </td>
                                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{review.admin_name}</div>
                                        </td>
                                    </tr>
                                ))}
                                
                                {deletedReviews.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                            Нет удаленных отзывов
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );

    // Render blocked users table
    const renderBlockedUsersTable = () => (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
        >
            {loading.blockedUsers ? (
                <div className="p-6 flex justify-center">
                    <LoadingSpinner />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    ID
                                </th>
                                <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Имя / Email
                                </th>
                                <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Роль
                                </th>
                                <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Причина блокировки
                                </th>
                                <th scope="col" className="px-2 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Действия
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                            {blockedUsers.map(userItem => (
                                <motion.tr 
                                    key={userItem.id}
                                    variants={itemVariants}
                                    className="bg-red-50 dark:bg-red-900/20"
                                >
                                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-gray-300">{userItem.id}</td>
                                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-gray-300">
                                        <div className="font-medium">{userItem.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">{userItem.email}</div>
                                        <div className="sm:hidden mt-1">
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                Заблокирован
                                            </span>
                                        </div>
                                    </td>
                                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                        {userItem.role}
                                    </td>
                                    <td className="px-2 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-900 dark:text-gray-300">
                                        <div className="text-sm font-medium mb-1">Причина:</div>
                                        <div className="text-sm text-red-600 dark:text-red-400 max-w-[280px]">
                                            {userItem.blocked_reason || "Причина не указана"}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Статус: <span className="text-red-500 font-medium">Заблокирован</span>
                                        </div>
                                    </td>
                                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm">
                                        {(user.role === 'admin' || user.role === 'head_admin') && 
                                        userItem.email !== 'admin@yandex.ru' && 
                                        userItem.id !== user.id &&
                                        userItem.role !== 'head_admin' && (
                                            <motion.button
                                                variants={buttonVariants}
                                                whileHover="hover"
                                                whileTap="tap"
                                                onClick={() => handleUnblockUser(userItem.id)}
                                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                title="Разблокировать пользователя"
                                            >
                                                <Unlock className="h-4 sm:h-5 w-4 sm:w-5" />
                                            </motion.button>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                            {blockedUsers.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                        Нет заблокированных пользователей в системе
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    );

    // Обновленный компонент с вкладками с учетом ролей пользователей
    const renderTabs = () => (
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6 bg-white dark:bg-gray-800 p-1 sm:p-2 rounded-lg shadow">
            {/* Рестораны доступны только для admin и head_admin */}
            {(user?.role === 'admin' || user?.role === 'head_admin') && (
                <TabButton 
                    active={activeTab === 'restaurants'} 
                    onClick={() => setActiveTab('restaurants')}
                    icon={BookOpen}
                >
                    Рестораны
                </TabButton>
            )}
            
            {/* Управление пользователями доступно только для admin и head_admin */}
            {(user?.role === 'admin' || user?.role === 'head_admin') && (
                <TabButton 
                    active={activeTab === 'users'} 
                    onClick={() => setActiveTab('users')}
                    icon={UserCog}
                >
                    Пользователи
                </TabButton>
            )}
            
            {/* Заблокированные пользователи доступны только для admin и head_admin */}
            {(user?.role === 'admin' || user?.role === 'head_admin') && (
                <TabButton 
                    active={activeTab === 'blockedUsers'} 
                    onClick={() => setActiveTab('blockedUsers')}
                    icon={Lock}
                >
                    Заблокированные
                </TabButton>
            )}
            
            {/* Отзывы доступны для всех ролей администрирования */}
            <TabButton 
                active={activeTab === 'reviews'} 
                onClick={() => setActiveTab('reviews')}
                icon={Shield}
            >
                Отзывы
            </TabButton>
            
            {/* Удаленные отзывы доступны для всех ролей администрирования */}
            <TabButton 
                active={activeTab === 'deletedReviews'} 
                onClick={() => setActiveTab('deletedReviews')}
                icon={AlertTriangle}
            >
                Удаленные отзывы
            </TabButton>
        </div>
    );

    // Modals
    const renderDeleteRestaurantModal = () => (
        <AnimatePresence>
            {showDeleteRestaurantModal && restaurantToDelete && (
                <motion.div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div 
                        className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-xl max-w-md w-full mx-4"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                        <motion.div 
                            className="flex items-center mb-3 sm:mb-4 text-red-600 dark:text-red-400"
                            variants={itemVariants}
                        >
                            <Info size={24} className="mr-2" />
                            <h3 className="text-base sm:text-lg font-bold">Подтверждение удаления</h3>
                        </motion.div>
                        
                        <motion.p 
                            className="mb-4 sm:mb-6 text-sm sm:text-base text-gray-700 dark:text-gray-300"
                            variants={itemVariants}
                        >
                            Вы действительно хотите удалить ресторан "<span className="font-semibold">{restaurantToDelete.name}</span>"? 
                            Это действие нельзя будет отменить.
                        </motion.p>
                        
                        <motion.div 
                            className="flex justify-end space-x-3"
                            variants={itemVariants}
                        >
                            <motion.button
                                onClick={cancelDeleteRestaurant}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                Отмена
                            </motion.button>
                            <motion.button
                                onClick={confirmDeleteRestaurant}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center text-sm sm:text-base"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <Trash2 size={16} className="mr-1" />
                                Удалить
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // Модальное окно удаления отзыва с анимацией
    const renderDeleteModal = () => (
        <AnimatePresence>
            {showDeleteModal && (
                <motion.div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div 
                        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl max-w-md w-full"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                        <motion.h3 
                            className="text-lg font-bold mb-4 text-gray-900 dark:text-white"
                            variants={itemVariants}
                        >
                            Удаление отзыва
                        </motion.h3>
                        <motion.div 
                            className="mb-4"
                            variants={itemVariants}
                        >
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Причина удаления:
                            </label>
                            <select 
                                value={deleteReason}
                                onChange={(e) => setDeleteReason(e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="">Выберите причину...</option>
                                {deletionReasons.map(reason => (
                                    <option key={reason} value={reason}>{reason}</option>
                                ))}
                            </select>
                        </motion.div>
                        
                        <AnimatePresence>
                            {deleteReason === "Другое" && (
                                <motion.div 
                                    className="mb-4"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Укажите свою причину:
                                    </label>
                                    <textarea 
                                        value={customReason}
                                        onChange={(e) => setCustomReason(e.target.value)}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        rows="3"
                                        placeholder="Опишите причину удаления отзыва"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                            
                        <motion.div 
                            className="flex justify-end space-x-2"
                            variants={itemVariants}
                        >
                            <motion.button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                Отмена
                            </motion.button>
                            <motion.button
                                onClick={handleDeleteReview}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                Удалить
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // Add block user modal
    const renderBlockUserModal = () => (
        <AnimatePresence>
            {showBlockModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                >
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 mx-4"
                    >
                        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 dark:text-white">Блокировка пользователя</h3>
                        <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                            Вы собираетесь заблокировать пользователя <strong>{userToBlock?.name}</strong> ({userToBlock?.email}).
                        </p>
                        
                        <div className="mb-3 sm:mb-4">
                            <label className="block text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2">
                                Причина блокировки:
                            </label>
                            <textarea
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline text-xs sm:text-sm"
                                rows="3"
                                placeholder="Укажите причину блокировки..."
                                required
                            />
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowBlockModal(false);
                                    setUserToBlock(null);
                                    setBlockReason('');
                                }}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 focus:outline-none dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 text-xs sm:text-sm"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={confirmBlockUser}
                                disabled={!blockReason.trim()}
                                className={`px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded focus:outline-none text-xs sm:text-sm ${
                                    !blockReason.trim() 
                                        ? 'opacity-50 cursor-not-allowed' 
                                        : 'hover:bg-red-700'
                                }`}
                            >
                                Заблокировать
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
    
    // Add unblock user modal
    const renderUnblockUserModal = () => (
        <AnimatePresence>
            {showUnblockModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                >
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 mx-4"
                    >
                        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 dark:text-white">Разблокировка пользователя</h3>
                        <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                            Вы собираетесь разблокировать пользователя <strong>{userToUnblock?.name}</strong> ({userToUnblock?.email}).
                        </p>
                        
                        <div className="mb-3 sm:mb-4">
                            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                Пользователь был заблокирован по причине: <span className="font-semibold">{userToUnblock?.blocked_reason || 'Причина не указана'}</span>
                            </p>
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowUnblockModal(false);
                                    setUserToUnblock(null);
                                }}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 focus:outline-none dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 text-xs sm:text-sm"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={confirmUnblockUser}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none text-xs sm:text-sm"
                            >
                                Разблокировать
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="container mx-auto px-4 py-4 sm:py-8">
            <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 dark:text-white">Панель управления</h1>
                <div className="bg-white dark:bg-gray-800 p-2 sm:p-4 rounded-lg shadow-md">
                    {renderTabs()}
                </div>
            </div>
            
            <div className="mb-6">
                {activeTab === 'restaurants' && renderRestaurantTable()}
                {activeTab === 'users' && renderUsersTable()}
                {activeTab === 'reviews' && renderReviewsTable()}
                {activeTab === 'deletedReviews' && renderDeletedReviewsTable()}
                {activeTab === 'blockedUsers' && renderBlockedUsersTable()}
            </div>
            
            {renderDeleteModal()}
            {renderDeleteRestaurantModal()}
            {renderBlockUserModal()}
            {renderUnblockUserModal()}
        </div>
    );
};

export default AdminPanel;
