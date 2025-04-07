/**
 * Контекст для работы с темой оформления
 * 
 * Предоставляет глобальный доступ к теме и функциям управления темой
 */

import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { useDarkMode } from '../hooks/useDarkMode';

// Создаем контекст темы
const ThemeContext = createContext({
    isDarkMode: false,
    toggleDarkMode: () => {},
    setDarkMode: () => {},
    resetToSystemPreference: () => {}
});

/**
 * Провайдер темы оформления
 * 
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние компоненты
 * @returns {JSX.Element} React-компонент
 */
export const ThemeProvider = ({ children }) => {
    // Используем хук для темы
    const { 
        isDarkMode, 
        toggleDarkMode, 
        setDarkMode, 
        resetToSystemPreference 
    } = useDarkMode();
    
    // Создаем объект со значениями контекста
    const themeContextValue = {
        isDarkMode,
        toggleDarkMode,
        setDarkMode,
        resetToSystemPreference
    };
    
    return (
        <ThemeContext.Provider value={themeContextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

// Проверка типов props
ThemeProvider.propTypes = {
    children: PropTypes.node.isRequired
};

/**
 * Хук для использования темы оформления
 * 
 * @returns {Object} Объект с методами и состоянием темы
 */
export const useTheme = () => {
    const context = useContext(ThemeContext);
    
    if (context === undefined) {
        throw new Error('useTheme должен использоваться внутри ThemeProvider');
    }
    
    return context;
}; 