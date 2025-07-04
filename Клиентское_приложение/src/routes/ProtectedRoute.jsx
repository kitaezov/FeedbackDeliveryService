import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../common/hooks/useAuth';
import { LoadingSpinner } from '../common/components/ui';

/**
 * Компонент для маршрутов, требующих авторизации и проверки роли
 * 
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние компоненты
 * @param {string[]} [props.allowedRoles] - Массив разрешенных ролей. Если не указан, доступ разрешен любой роли.
 * @returns {React.ReactNode}
 */
export const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, isAuthLoading } = useAuth();
    const location = useLocation();
    
    // Если проверка авторизации еще не завершена, показываем загрузку
    if (isAuthLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner size="large" />
            </div>
        );
    }
    
    // Если пользователь не авторизован, перенаправляем на страницу входа
    if (!user) {
        return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
    }
    
    // Проверка роли, если указаны разрешенные роли
    if (allowedRoles && allowedRoles.length > 0) {
        const hasRequiredRole = allowedRoles.some(role => user.role === role);
        
        // Если роль пользователя не входит в список разрешенных, перенаправляем на главную
        if (!hasRequiredRole) {
            console.log(`Доступ запрещен: Роль пользователя ${user.role} не входит в список разрешенных ролей [${allowedRoles.join(', ')}]`);
            return <Navigate to="/" replace />;
        }
    }
    
    // Если все проверки пройдены, рендерим дочерние компоненты
    return children;
}; 