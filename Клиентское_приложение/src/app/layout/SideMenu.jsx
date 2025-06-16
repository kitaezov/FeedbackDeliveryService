/**
 * Компонент бокового меню приложения
 * 
 * Отображает навигационное боковое меню с разделами приложения
 */

import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { X, Home, Star, Restaurant, Phone, Settings, User, Users, List, Bell } from 'lucide-react';

/**
 * Компонент бокового меню
 * 
 * @param {Object} props - Свойства компонента
 * @param {boolean} props.isOpen - Открыто ли меню
 * @param {Function} props.onClose - Функция закрытия меню
 * @param {Object} props.user - Данные пользователя
 * @param {boolean} [props.isDarkMode=false] - Режим темной темы
 * @returns {JSX.Element} React-компонент
 */
export const SideMenu = ({
    isOpen,
    onClose,
    user,
    isDarkMode = false
}) => {
    // Подсветка активного пункта меню
    const activeClassName = isDarkMode
        ? 'bg-gray-800 text-white'
        : 'bg-gray-100 text-gray-900';
        
    const inactiveClassName = isDarkMode
        ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900';
    
    // Общие пункты меню
    const commonMenuItems = [
        { to: '/', icon: <Home size={20} />, label: 'Главная' },
        { to: '/restaurants', icon: <Restaurant size={20} />, label: 'Рестораны' },
        { to: '/reviews', icon: <Star size={20} />, label: 'Отзывы' },
        { to: '/contact', icon: <Phone size={20} />, label: 'Контакты' }
    ];
    
    // Пункты меню для авторизованных пользователей
    const authMenuItems = [
        { to: '/profile', icon: <User size={20} />, label: 'Профиль' },
        { to: '/notifications', icon: <Bell size={20} />, label: 'Уведомления' },
        { to: '/settings', icon: <Settings size={20} />, label: 'Настройки' }
    ];
    
    // Пункты меню для администраторов
    const adminMenuItems = [
        { to: '/admin/restaurants', icon: <List size={20} />, label: 'Управление ресторанами' },
        { to: '/admin/users', icon: <Users size={20} />, label: 'Пользователи' }
    ];
    
    // Варианты анимации
    const menuVariants = {
        hidden: {
            x: '-100%',
            opacity: 0
        },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                type: 'tween',
                duration: 0.3
            }
        },
        exit: {
            x: '-100%',
            opacity: 0,
            transition: {
                type: 'tween',
                duration: 0.2
            }
        }
    };
    
    // Варианты анимации для затемнения
    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { duration: 0.3 }
        },
        exit: { 
            opacity: 0,
            transition: { duration: 0.2 }
        }
    };
    
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Затемнение заднего фона */}
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                    />
                    
                    {/* Боковое меню */}
                    <motion.div
                        className={`fixed inset-y-0 left-0 w-64 overflow-y-auto z-50 ${
                            isDarkMode ? 'bg-gray-900' : 'bg-white'
                        } shadow-xl`}
                        variants={menuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {/* Заголовок и кнопка закрытия */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Меню
                            </h2>
                            <button
                                className={`p-1 rounded-full hover:bg-gray-200 ${
                                    isDarkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500'
                                }`}
                                onClick={onClose}
                                aria-label="Закрыть меню"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        {/* Содержимое меню */}
                        <div className="p-2">
                            <div className="my-2">
                                <h3 className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                    Навигация
                                </h3>
                                <nav className="mt-1 space-y-1">
                                    {commonMenuItems.map((item) => (
                                        <NavLink
                                            key={item.to}
                                            to={item.to}
                                            className={({ isActive }) => `
                                                flex items-center px-3 py-2 rounded-md text-sm font-medium
                                                ${isActive ? activeClassName : inactiveClassName}
                                            `}
                                            onClick={onClose}
                                        >
                                            <span className="mr-3">{item.icon}</span>
                                            {item.label}
                                        </NavLink>
                                    ))}
                                </nav>
                            </div>
                            
                            {/* Разделитель */}
                            <div className={`my-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`} />
                            
                            {/* Раздел для авторизованных пользователей */}
                            {user && (
                                <div className="my-2">
                                    <h3 className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                        Личный кабинет
                                    </h3>
                                    <nav className="mt-1 space-y-1">
                                        {authMenuItems.map((item) => (
                                            <NavLink
                                                key={item.to}
                                                to={item.to}
                                                className={({ isActive }) => `
                                                    flex items-center px-3 py-2 rounded-md text-sm font-medium
                                                    ${isActive ? activeClassName : inactiveClassName}
                                                `}
                                                onClick={onClose}
                                            >
                                                <span className="mr-3">{item.icon}</span>
                                                {item.label}
                                            </NavLink>
                                        ))}
                                    </nav>
                                </div>
                            )}
                            
                            {/* Раздел для администраторов */}
                            {user && (user.role === 'admin' || user.role === 'head_admin') && (
                                <div className="my-2">
                                    <h3 className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                        Администрирование
                                    </h3>
                                    <nav className="mt-1 space-y-1">
                                        {adminMenuItems.map((item) => (
                                            <NavLink
                                                key={item.to}
                                                to={item.to}
                                                className={({ isActive }) => `
                                                    flex items-center px-3 py-2 rounded-md text-sm font-medium
                                                    ${isActive ? activeClassName : inactiveClassName}
                                                `}
                                                onClick={onClose}
                                            >
                                                <span className="mr-3">{item.icon}</span>
                                                {item.label}
                                            </NavLink>
                                        ))}
                                    </nav>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// Проверка типов props
SideMenu.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    user: PropTypes.object,
    isDarkMode: PropTypes.bool
}; 