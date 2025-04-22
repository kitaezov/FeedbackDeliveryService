import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Основной макет приложения с навигацией и футером
 * Футер будет отображаться внизу страницы, только на главной странице
 */
export const MainLayout = () => {
    const location = useLocation();
    const { isDarkMode } = useTheme?.() || { isDarkMode: false };
    
    // Проверяем, что мы находимся только на главной странице
    const isHomePage = location.pathname === '/';
    
    return (
        <div className="fixed bottom-0 left-0">
            {/* Навигация */}
            <NavigationBar />
            
            {/* Основное содержимое */}
            <main className="flex-grow container mx-auto px-4 py-6">
                <Outlet />
            </main>
            
            {/* Футер отображается только на главной странице */}
            {isHomePage && <Footer isDarkMode={isDarkMode} />}
        </div>
    );
};

export default MainLayout; 