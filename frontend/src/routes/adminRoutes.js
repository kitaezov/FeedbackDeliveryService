import { AdminLayout } from '../layouts/AdminLayout';
import { RestaurantManagement } from '../features/admin/RestaurantManagement';
import { ProtectedRoute } from './ProtectedRoute';

export const adminRoutes = [
    {
        path: '/admin',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: 'restaurants',
                element: <RestaurantManagement />
            }
        ]
    }
]; 