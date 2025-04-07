/**
 * Главный компонент разметки (Layout) приложения
 * 
 * Объединяет компоненты Header, Footer и основное содержимое
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Header } from './Header';
import { Footer } from './Footer';

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
    // Состояние для темного режима
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    // Загрузка настроек темы из localStorage при монтировании
    useEffect(() => {
        const savedTheme = localStorage.getItem('darkMode');
        if (savedTheme) {
            setIsDarkMode(JSON.parse(savedTheme));
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // Если пользователь предпочитает темную тему в системе
            setIsDarkMode(true);
        }
    }, []);
    
    // Обновление настроек темы в localStorage при изменении
    useEffect(() => {
        document.body.classList.toggle('dark-mode', isDarkMode);
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    }, [isDarkMode]);
    
    // Переключение темного режима
    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };
    
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
            <main className="flex-grow container mx-auto px-4 py-6">
                {children}
            </main>
            
            {/* Футер */}
            <Footer isDarkMode={isDarkMode} />
        </div>
    );
};

// Проверка типов props
Layout.propTypes = {
    children: PropTypes.node.isRequired,
    user: PropTypes.object,
    onLogout: PropTypes.func.isRequired
}; 