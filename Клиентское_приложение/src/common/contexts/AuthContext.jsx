/**
 * Контекст для работы с аутентификацией
 * 
 * Предоставляет глобальный доступ к данным пользователя и функциям аутентификации
 */

import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';

// Создаем контекст аутентификации
const AuthContext = createContext({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    login: () => Promise.resolve(),
    register: () => Promise.resolve(),
    logout: () => {},
    updateProfile: () => Promise.resolve()
});

/**
 * Провайдер аутентификации
 * 
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние компоненты
 * @returns {JSX.Element} React-компонент
 */
export const AuthProvider = ({ children }) => {
    // Используем хук для аутентификации
    const auth = useAuth();
    
    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
};

// Проверка типов props
AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
};

/**
 * Хук для использования аутентификации
 * 
 * @returns {Object} Объект с методами и данными аутентификации
 */
export const useAuthContext = () => {
    const context = useContext(AuthContext);
    
    if (context === undefined) {
        throw new Error('useAuthContext должен использоваться внутри AuthProvider');
    }
    
    return context;
}; 