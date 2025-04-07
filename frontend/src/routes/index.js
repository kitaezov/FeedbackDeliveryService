import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { NotFoundPage } from '../common/pages/NotFoundPage';
import { HomePage } from '../features/home/pages/HomePage';
import { LoginPage, RegisterPage } from '../features/auth/pages';
import { restaurantRoutes } from '../features/restaurants/routes';
import { supportRoutes } from './supportRoutes';
import { ProfilePage } from '../features/profile/pages/ProfilePage';
import { ProtectedRoute } from './ProtectedRoute';

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
                // Добавляем проверку авторизации для маршрутов, требующих авторизации
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
                path: '/profile',
                element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
            },
        ],
    },
    
    // Лэйаут для страниц авторизации
    {
        path: '/',
        element: <AuthLayout />,
        children: [
            {
                path: '/login',
                element: <LoginPage />,
            },
            {
                path: '/register',
                element: <RegisterPage />,
            },
        ],
    },
]); 