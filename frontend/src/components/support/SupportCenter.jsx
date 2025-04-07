import React from 'react';
import { useAuth } from '../../features/auth/authContext';
import UserSupportTickets from './UserSupportTickets';
import AdminSupportTickets from './AdminSupportTickets';

/**
 * Компонент центра поддержки
 * Отображает соответствующий интерфейс в зависимости от роли пользователя
 */
const SupportCenter = () => {
  const { user } = useAuth();
  
  // Проверяем, является ли пользователь менеджером или администратором
  const isStaff = user && ['manager', 'admin', 'head_admin'].includes(user.role);
  
  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="container mx-auto">
        {isStaff ? (
          // Административный интерфейс для сотрудников
          <AdminSupportTickets />
        ) : (
          // Пользовательский интерфейс для обычных пользователей
          <UserSupportTickets />
        )}
      </div>
    </div>
  );
};

export default SupportCenter; 