import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { NotFoundPage } from '../common/pages/NotFoundPage';
import { HomePage } from '../features/home/pages/HomePage';
import { LoginPage, RegisterPage } from '../features/auth/pages';
import { restaurantRoutes } from '../features/restaurants/routes';
import { supportRoutes } from './supportRoutes';
import { adminRoutes } from './adminRoutes';
import { ProfilePage } from '../features/profile/pages/ProfilePage';
import { ProtectedRoute } from './ProtectedRoute';
import ManagerDashboard from '../features/manager/ManagerDashboard';

/**
 * Создание роутера приложения
 */
export const router = createBrowserRouter([
    // Основной лэйаут с хедером и футером
    {
        path: '/',
        element: <MainLayout />,
        errorElement: <NotFoundPage />,
        children: [
            // Главная страница
            {
                index: true,
                element: <HomePage />,
            },
            
            // Маршруты для фичи "Рестораны"
            ...restaurantRoutes.map(route => {
                if (route.requireAuth) {
                    return {
                        ...route,
                        element: <ProtectedRoute>{route.element}</ProtectedRoute>,
                    };
                }
                return route;
            }),
            
            // Маршруты для центра поддержки
            ...supportRoutes,
            
            // Профиль пользователя
            {
                path: 'profile',
                element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
            },
        ],
    },
    
    // Маршрут панели менеджера (отдельный корневой путь)
    {
        path: '/manager',
        element: (
            <ProtectedRoute allowedRoles={['manager', 'admin', 'head_admin']}>
                <MainLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <ManagerDashboard />,  
            },
        ],
    },
    
    // Лэйаут для страниц авторизации
    {
        path: 'auth',
        element: <AuthLayout />,
        children: [
            {
                path: 'login',
                element: <LoginPage />,
            },
            {
                path: 'register',
                element: <RegisterPage />,
            },
        ],
    },

    // Админ-панель
    ...adminRoutes,
    
    // Note: Admin routes use AdminLayout which does not include a footer component
]); 