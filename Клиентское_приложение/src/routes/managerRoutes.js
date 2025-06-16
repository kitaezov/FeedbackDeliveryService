import React from 'react';
import { ProtectedRoute } from './ProtectedRoute';
import ManagerDashboard from '../features/manager/ManagerDashboard';

/**
 * Routes accessible to users with manager role
 */
export const managerRoutes = [
    {
        path: '/manager',
        element: (
            <ProtectedRoute allowedRoles={['manager', 'admin', 'head_admin']}>
                <ManagerDashboard />
            </ProtectedRoute>
        )
    }
]; 