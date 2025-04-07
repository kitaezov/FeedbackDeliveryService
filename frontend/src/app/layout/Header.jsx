/**
 * Компонент заголовка (хедера) приложения
 * 
 * Отображает верхнюю навигационную панель с логотипом, основной навигацией и кнопками пользователя
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Bell, User, Sun, Moon, LogOut, Settings } from 'lucide-react';
import { SideMenu } from './SideMenu';

/**
 * Компонент заголовка приложения
 * 
 * @param {Object} props - Свойства компонента
 * @param {Object} props.user - Информация о пользователе (null если не авторизован)
 * @param {Function} props.onLogout - Функция для выхода из системы
 * @param {boolean} props.isDarkMode - Флаг темного режима
 * @param {Function} props.toggleDarkMode - Функция переключения темного режима
 * @returns {JSX.Element} React-компонент
 */
export const Header = ({
    user,
    onLogout,
    isDarkMode = false,
    toggleDarkMode
}) => {
    // Состояние для отображения бокового меню на мобильных устройствах
    const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
    
    // Состояние для отображения меню пользователя
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    
    // Классы для активного пункта меню
    const activeClassName = 'text-gray-800 font-semibold border-b-2 border-gray-700';
    const inactiveClassName = 'text-gray-700 hover:text-gray-900 font-medium';
    
    // Обработчик закрытия меню пользователя при клике вне его
    const handleClickOutside = () => {
        setIsUserMenuOpen(false);
    };
    
    return (
        <header className={`sticky top-0 z-30 w-full ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} shadow-md`}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Логотип и кнопка мобильного меню */}
                    <div className="flex items-center">
                        {/* Кнопка мобильного меню */}
                        <button
                            className="md:hidden mr-3 p-2 rounded-md hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
                            onClick={() => setIsSideMenuOpen(true)}
                            aria-label="Открыть меню"
                        >
                            <Menu size={24} />
                        </button>
                        
                        {/* Логотип */}
                        <Link
                            to="/"
                            className="flex items-center text-xl font-bold"
                        >
                            <img 
                                src="/logo.svg" 
                                alt="FeedBack" 
                                className="h-8 w-auto mr-2" 
                            />
                            <span className={isDarkMode ? 'text-white' : 'text-gray-700'}>
                                FeedBack
                            </span>
                        </Link>
                    </div>
                    
                    {/* Основная навигация (скрыта на мобильных) */}
                    <nav className="hidden md:flex space-x-6">
                        <NavLink
                            to="/"
                            className={({ isActive }) => `py-5 ${isActive ? activeClassName : inactiveClassName}`}
                            end
                        >
                            Главная
                        </NavLink>
                        <NavLink
                            to="/restaurants"
                            className={({ isActive }) => `py-5 ${isActive ? activeClassName : inactiveClassName}`}
                        >
                            Рестораны
                        </NavLink>
                        <NavLink
                            to="/reviews"
                            className={({ isActive }) => `py-5 ${isActive ? activeClassName : inactiveClassName}`}
                        >
                            Отзывы
                        </NavLink>
                        <NavLink
                            to="/contact"
                            className={({ isActive }) => `py-5 ${isActive ? activeClassName : inactiveClassName}`}
                        >
                            Контакты
                        </NavLink>
                    </nav>
                    
                    {/* Правая часть с пользовательскими действиями */}
                    <div className="flex items-center space-x-4">
                        {/* Переключатель темы */}
                        <button 
                            onClick={toggleDarkMode}
                            className={`p-2 rounded-full ${
                                isDarkMode 
                                    ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            } focus:outline-none`}
                            aria-label={isDarkMode ? 'Включить светлую тему' : 'Включить темную тему'}
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        
                        {/* Если пользователь авторизован */}
                        {user ? (
                            <div className="relative">
                                {/* Уведомления */}
                                <Link
                                    to="/notifications"
                                    className={`p-2 rounded-full ${
                                        isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                                    } relative`}
                                    aria-label="Уведомления"
                                >
                                    <Bell size={20} />
                                    {user.unreadNotifications > 0 && (
                                        <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs text-center">
                                            {user.unreadNotifications > 9 ? '9+' : user.unreadNotifications}
                                        </span>
                                    )}
                                </Link>
                                
                                {/* Профиль пользователя */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center space-x-2 p-2 rounded-full focus:outline-none"
                                        aria-label="Открыть меню пользователя"
                                    >
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300">
                                            {user.avatar ? (
                                                <img 
                                                    src={user.avatar} 
                                                    alt={user.name} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            ) : (
                                                <User className="w-full h-full p-1" />
                                            )}
                                        </div>
                                    </button>
                                    
                                    {/* Выпадающее меню пользователя */}
                                    {isUserMenuOpen && (
                                        <>
                                            <div 
                                                className="fixed inset-0 z-10" 
                                                onClick={handleClickOutside}
                                            />
                                            <div 
                                                className={`absolute right-0 mt-2 w-48 py-2 rounded-md shadow-lg z-20 ${
                                                    isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                                                } border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                                            >
                                                <div className="px-4 py-2 border-b border-gray-200">
                                                    <p className="text-sm font-medium">{user.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                </div>
                                                
                                                <Link
                                                    to="/profile"
                                                    className={`flex items-center px-4 py-2 text-sm ${
                                                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                                                    }`}
                                                    onClick={handleClickOutside}
                                                >
                                                    <User size={16} className="mr-2" />
                                                    Профиль
                                                </Link>
                                                
                                                <Link
                                                    to="/settings"
                                                    className={`flex items-center px-4 py-2 text-sm ${
                                                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                                                    }`}
                                                    onClick={handleClickOutside}
                                                >
                                                    <Settings size={16} className="mr-2" />
                                                    Настройки
                                                </Link>
                                                
                                                <button
                                                    onClick={() => {
                                                        handleClickOutside();
                                                        onLogout();
                                                    }}
                                                    className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                                                        isDarkMode ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'
                                                    }`}
                                                >
                                                    <LogOut size={16} className="mr-2" />
                                                    Выйти
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* Если пользователь не авторизован */
                            <div className="flex items-center space-x-2">
                                <Link
                                    to="/login"
                                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                                        isDarkMode 
                                            ? 'text-white hover:bg-gray-800' 
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    Войти
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 rounded-md text-sm font-medium bg-gray-700 text-white hover:bg-gray-600"
                                >
                                    Регистрация
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Боковое меню для мобильных устройств */}
            <SideMenu
                isOpen={isSideMenuOpen}
                onClose={() => setIsSideMenuOpen(false)}
                user={user}
                isDarkMode={isDarkMode}
            />
        </header>
    );
};

// Проверка типов props
Header.propTypes = {
    user: PropTypes.object,
    onLogout: PropTypes.func.isRequired,
    isDarkMode: PropTypes.bool,
    toggleDarkMode: PropTypes.func.isRequired
}; 