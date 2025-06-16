/**
 * Главный компонент разметки (Layout) приложения
 * 
 * Объединяет компоненты Header, Footer и основное содержимое
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Компонент основной разметки приложения
 * 
 * @param {Object} props - Свойства компонента
 * @param {ReactNode} props.children - Дочерние элементы (содержимое)
 * @param {Object} props.user - Информация о пользователе (null если не авторизован)
 * @param {Function} props.onLogout - Функция выхода из системы
 * @returns {JSX.Element} React-компонент
 */
export const Layout = ({
    children,
    user,
    onLogout
}) => {
    // Используем контекст темы вместо локального состояния
    const { isDarkMode, toggleDarkMode } = useTheme();
    
    // Получаем текущий маршрут
    const location = useLocation();
    
    // Проверка на главную страницу и исключение админ и других специальных страниц
    const isExactHomePage = location.pathname === '/' && !location.search;
    const isAdminPage = location.pathname.includes('/admin');
    const isProfilePage = location.pathname.includes('/profile');
    const isSettingsPage = location.pathname.includes('/settings');
    const shouldShowFooter = isExactHomePage && !isAdminPage && !isProfilePage && !isSettingsPage;
    
    return (
        <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Заголовок */}
            <Header
                user={user}
                onLogout={onLogout}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
            />
            
            {/* Основное содержимое */}
            <main className="flex-1 container mx-auto px-4 py-6 mb-6">
                {children}
            </main>
            
            {/* Отображаем футер только на главной странице и исключаем специальные страницы */}
            {shouldShowFooter && <Footer isDarkMode={isDarkMode} />}
        </div>
    );
};

// Проверка типов props
Layout.propTypes = {
    children: PropTypes.node.isRequired,
    user: PropTypes.object,
    onLogout: PropTypes.func.isRequired
}; 