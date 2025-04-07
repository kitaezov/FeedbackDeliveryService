import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../common/hooks/useAuth';
import { LoadingSpinner } from '../common/components/ui';

/**
 * Компонент для маршрутов, требующих авторизации
 * 
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние компоненты
 * @returns {React.ReactNode}
 */
export const ProtectedRoute = ({ children }) => {
    const { user, isAuthLoading } = useAuth();
    const location = useLocation();
    
    // Если проверка авторизации еще не завершена, показываем загрузку
    if (isAuthLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner size="large" />
            </div>
        );
    }
    
    // Если пользователь не авторизован, перенаправляем на страницу входа
    if (!user) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }
    
    // Если пользователь авторизован, рендерим дочерние компоненты
    return children;
}; 