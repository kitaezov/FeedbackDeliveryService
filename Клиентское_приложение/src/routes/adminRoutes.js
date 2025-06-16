import { AdminLayout } from '../layouts/AdminLayout';
import { RestaurantManagement } from '../features/admin/RestaurantManagement';
import { ProtectedRoute } from './ProtectedRoute';

export const adminRoutes = [
    {
        path: '/admin',
        element: (
            <ProtectedRoute allowedRoles={['admin', 'head_admin', 'moderator', 'super_admin', 'глав_админ', 'модератор']}>
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