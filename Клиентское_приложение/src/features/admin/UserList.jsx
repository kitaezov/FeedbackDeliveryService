import React, { useState, useEffect } from 'react';
import { Lock, Unlock, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import RestaurantSelector from '../../components/RestaurantSelector';

// Анимация для иконки обновления
const refreshIconVariants = {
    initial: { rotate: 0 },
    animate: { rotate: 360, transition: { duration: 0.5 } }
};

// Анимация для контейнера
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

// Вспомогательная функция для получения инициалов ресторана
const getRestaurantInitials = (name) => {
    if (!name) return '';
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('');
};

// Компонент уведомления
const Notification = ({ message }) => (
    <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-md z-50"
    >
        {message}
    </motion.div>
);

const UserList = ({ user, onBlockUser, onUnblockUser, onUpdateRole }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');
    const [showRestaurantSelector, setShowRestaurantSelector] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [pendingRole, setPendingRole] = useState(null);
    const [restaurants, setRestaurants] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showNotification, setShowNotification] = useState(false);

    // Загружаем данные
    useEffect(() => {
        fetchData();
    }, []);

    // Функция для загрузки данных
    const fetchData = async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);
            const [usersResponse, restaurantsResponse] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/restaurants')
            ]);
            
            // Map restaurants to users
            const usersWithRestaurants = usersResponse.data.users.map(user => {
                const restaurant = restaurantsResponse.data.restaurants?.find(r => r.id === user.restaurant_id);
                return {
                    ...user,
                    restaurant: restaurant
                };
            });
            
            setUsers(usersWithRestaurants);
            setRestaurants(restaurantsResponse.data.restaurants || []);
            
            // Показываем анимацию обновления
            setTimeout(() => {
                setIsRefreshing(false);
                // Показываем уведомление об успешном обновлении
                setShowNotification(true);
                // Скрываем уведомление через 3 секунды
                setTimeout(() => {
                    setShowNotification(false);
                }, 3000);
            }, 300);
        } catch (error) {
            console.error('Error fetching users:', error);
            setIsRefreshing(false);
        } finally {
            setLoading(false);
        }
    };

    // Фильтруем пользователей на основе поискового запроса
    const filteredUsers = users.filter(user => {
        const query = searchQuery.toLowerCase();
        return (
            user.name?.toLowerCase().includes(query) || 
            user.email?.toLowerCase().includes(query) ||
            user.role?.toLowerCase().includes(query)
        );
    });

    // Сортируем пользователей
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        // Обработка строкового сравнения
        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }
        
        if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    // Обработка изменения сортировки
    const handleSort = (field) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Обработка изменения роли
    const handleRoleChange = (userId, newRole) => {
        if (newRole === 'manager') {
            setSelectedUserId(userId);
            setPendingRole(newRole);
            setShowRestaurantSelector(true);
        } else {
            onUpdateRole(userId, newRole);
        }
    };

    // Обработка выбора ресторана
    const handleRestaurantSelect = (restaurant) => {
        if (selectedUserId && pendingRole) {
            onUpdateRole(selectedUserId, pendingRole, restaurant.id);
            setShowRestaurantSelector(false);
            setSelectedUserId(null);
            setPendingRole(null);
        }
    };

// Форматируем отображение роли с названием ресторана для менеджеров
    const formatRoleDisplay = (userItem) => {
        if (userItem.role === 'manager' && userItem.restaurant) {
            return (
                <div className="flex flex-col gap-1">
                    <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Менеджер
                    </div>
                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                            {userItem.restaurant.name || 'Ресторан не указан'}
                        </span>
                    </div>
                </div>
            );
        }
        return (
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                ${userItem.role === 'head_admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 
                userItem.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                userItem.role === 'manager' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
            >
                {userItem.role === 'head_admin' ? 'Гл. Админ' :
                 userItem.role === 'admin' ? 'Админ' :
                 userItem.role === 'manager' ? 'Менеджер' : 'Пользователь'}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden" 
            animate="visible" 
            exit="exit"
            className="bg-white dark:bg-gray-800 p-3 sm:p-5 rounded-lg shadow-md max-w-full"
        >
            <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                <h2 className="text-lg font-semibold dark:text-gray-200">Управление пользователями</h2>
                <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={fetchData}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                    title="Обновить список пользователей"
                    disabled={loading}
                >
                    {loading ? (
                        <div className="animate-spin h-3.5 w-3.5 border-2 border-white rounded-full border-t-transparent"></div>
                    ) : (
                        <motion.div
                            variants={refreshIconVariants}
                            initial="initial"
                            animate={isRefreshing ? "animate" : "initial"}
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                        </motion.div>
                    )}
                    <span>{loading ? "Обновление..." : "Обновить"}</span>
                </motion.button>
            </div>
            
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    Всего пользователей: {users.length}
                </div>
                <div className="w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Поиск по имени или email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-60 px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                </div>
            </div>
            
            <div className="w-full">
                <div className="border rounded-md overflow-hidden">
                    <table className="w-full table-auto border-collapse text-xs">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th 
                                    scope="col" 
                                    className="w-10 px-2 py-1.5 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('id')}
                                >
                                    ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-2 py-1.5 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('name')}
                                >
                                    Имя {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th 
                                    scope="col" 
                                    className="hidden md:table-cell px-2 py-1.5 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('email')}
                                >
                                    Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-2 py-1.5 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('role')}
                                >
                                    Роль {sortField === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th> 
                                <th 
                                    scope="col" 
                                    className="hidden md:table-cell px-2 py-1.5 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('is_blocked')}
                                >
                                    Статус {sortField === 'is_blocked' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th scope="col" className="px-2 py-1.5 text-right font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Действия
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                            {sortedUsers.length > 0 ? (
                                sortedUsers.map((userItem, index) => (
                                    <motion.tr 
                                        key={userItem.id}
                                        variants={itemVariants}
                                        initial={isRefreshing ? "hidden" : false}
                                        animate={isRefreshing ? "visible" : false}
                                        className={`${userItem.is_blocked === 1 ? 'bg-red-50 dark:bg-red-900/20' : index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/30'} hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors`}
                                    >
                                        <td className="px-2 py-1.5 text-gray-900 dark:text-gray-300">{userItem.id}</td>
                                        <td className="px-2 py-1.5 text-gray-900 dark:text-gray-300">
                                            <div className="font-medium">{userItem.name}</div>
                                            <div className="md:hidden text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{userItem.email}</div>
                                            {userItem.is_blocked === 1 && (
                                                <div className="md:hidden mt-1">
                                                    <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                        Заблокирован
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="hidden md:table-cell px-2 py-1.5 text-gray-500 dark:text-gray-400">
                                            {userItem.email}
                                        </td>
                                        <td className="px-2 py-1.5">
                                        <div className="flex flex-col items-start">
                                            <span className={`inline-flex items-center px-1 py-0.5 rounded text-xs font-medium 
                                                ${userItem.role === 'head_admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 
                                                userItem.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                                                userItem.role === 'manager' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
                                            >
                                                {formatRoleDisplay(userItem)}
                                            </span>
                                        </div>
                                        </td>
                                        <td className="hidden md:table-cell px-2 py-1.5">
                                            {userItem.is_blocked === 1 ? (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                    Заблокирован
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                    Активен
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-2 py-1.5 font-medium space-x-1 text-right">
                                            {/* Allow role change if user has higher privileges */}
                                            {((user.role === 'head_admin') || 
                                            (user.role === 'admin' && userItem.role !== 'admin' && userItem.role !== 'head_admin') || 
                                            (user.role === 'manager' && userItem.role === 'user')) && 
                                            userItem.email !== 'admin@yandex.ru' && userItem.id !== user.id && (
                                                <div className="inline-block">
                                                    <select 
                                                        value={userItem.role}
                                                        onChange={(e) => handleRoleChange(userItem.id, e.target.value)}
                                                        className="border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500 block w-24 text-xs rounded py-1 dark:bg-gray-700 dark:text-white"
                                                    >
                                                        <option value="user">Пользователь</option>
                                                        {(user.role === 'admin' || user.role === 'head_admin') && (
                                                            <option value="manager">Менеджер</option>
                                                        )}
                                                        {user.role === 'head_admin' && (
                                                            <>
                                                                <option value="admin">Админ</option>
                                                                {userItem.email !== 'admin@yandex.ru' && (
                                                                    <option value="head_admin">Гл. Админ</option>
                                                                )}
                                                            </>
                                                        )}
                                                    </select>
                                                </div>
                                            )}
                                            
                                            {/* Block/Unblock User Button */}
                                            {(user.role === 'admin' || user.role === 'head_admin') && 
                                            userItem.email !== 'admin@yandex.ru' && 
                                            userItem.id !== user.id &&
                                            userItem.role !== 'head_admin' &&
                                            (
                                                <>
                                                    {userItem.is_blocked === 1 ? (
                                                        <motion.button
                                                            variants={buttonVariants}
                                                            whileHover="hover"
                                                            whileTap="tap"
                                                            onClick={() => onUnblockUser(userItem.id)}
                                                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                            title="Разблокировать пользователя"
                                                        >
                                                            <Unlock className="h-4 w-4" />
                                                        </motion.button>
                                                    ) : (
                                                        <motion.button
                                                            variants={buttonVariants}
                                                            whileHover="hover"
                                                            whileTap="tap"
                                                            onClick={() => onBlockUser(userItem.id)}
                                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                            title="Заблокировать пользователя"
                                                        >
                                                            <Lock className="h-4 w-4" />
                                                        </motion.button>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-2 py-3 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/30">
                                        {searchQuery 
                                            ? "Пользователи не найдены по заданным критериям" 
                                            : "Нет пользователей в системе"
                                        }
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Restaurant selector modal */}
            <RestaurantSelector
                isOpen={showRestaurantSelector}
                onClose={() => {
                    setShowRestaurantSelector(false);
                    setSelectedUserId(null);
                    setPendingRole(null);
                }}
                onSelect={handleRestaurantSelect}
                selectedRestaurantId={null}
            />
            
            {/* Notification component */}
            {showNotification && (
                <Notification message="Список пользователей успешно обновлен!" />
            )}
        </motion.div>
    );
};

export default UserList; 