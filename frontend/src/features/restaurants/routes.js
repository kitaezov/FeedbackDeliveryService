import React from 'react';
import { RestaurantsListPage, RestaurantDetailsPage, UserReviewsPage } from './pages';
import RestaurantRatingsPage from './pages/RestaurantRatingsPage';

/**
 * Маршруты для функциональности "Рестораны"
 * 
 * @typedef {Object} RouteConfig
 * @property {string} path - Путь маршрута
 * @property {React.ReactNode} element - Компонент для рендеринга
 * @property {boolean} [exact=false] - Точное совпадение пути
 * @property {boolean} [requireAuth=false] - Требуется ли авторизация
 */

/**
 * Конфигурация маршрутов ресторанов
 * @type {RouteConfig[]}
 */
export const restaurantRoutes = [
    {
        path: '/restaurants',
        element: <RestaurantsListPage />,
        exact: true,
    },
    {
        path: '/restaurants/:id',
        element: <RestaurantDetailsPage />,
        exact: true,
    },
    {
        path: '/restaurant-ratings',
        element: <RestaurantRatingsPage />,
        exact: true,
    },
    {
        path: '/profile/reviews',
        element: <UserReviewsPage />,
        exact: true,
        requireAuth: true,
    },
]; 