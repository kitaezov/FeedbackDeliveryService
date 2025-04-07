import React from 'react';
import SupportCenter from '../components/support/SupportCenter';
import TicketDetail from '../components/support/TicketDetail';
import { ProtectedRoute } from './ProtectedRoute';

/**
 * Маршруты для функциональности "Центр поддержки"
 * 
 * @typedef {Object} RouteConfig
 * @property {string} path - Путь маршрута
 * @property {React.ReactNode} element - Компонент для рендеринга
 * @property {boolean} [exact=false] - Точное совпадение пути
 * @property {boolean} [requireAuth=false] - Требуется ли авторизация
 */

/**
 * Конфигурация маршрутов центра поддержки
 * @type {RouteConfig[]}
 */
export const supportRoutes = [
    {
        path: '/support',
        element: (
            <ProtectedRoute>
                <SupportCenter />
            </ProtectedRoute>
        ),
        exact: true,
        requireAuth: true,
    },
    {
        path: '/support/tickets/:id',
        element: (
            <ProtectedRoute>
                <TicketDetail />
            </ProtectedRoute>
        ),
        exact: true,
        requireAuth: true,
    },
]; 