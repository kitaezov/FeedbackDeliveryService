import React from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { ShieldAlert, LogOut } from 'lucide-react';

/**
 * Компонент для отображения информации о блокировке аккаунта
 * 
 * @param {Object} props - Свойства компонента
 * @param {string} props.reason - Причина блокировки аккаунта
 * @returns {JSX.Element} React-компонент
 */
const BlockedAccountPage = ({ reason }) => {
  const { logout } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 mb-4">
        <div className="flex items-center justify-center mb-6">
          <ShieldAlert className="h-16 w-16 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Аккаунт заблокирован
        </h1>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800 font-medium mb-2">Причина блокировки:</p>
          <p className="text-gray-700">{reason || 'Причина не указана'}</p>
        </div>
        
        <p className="text-gray-600 text-center mb-6">
          Если вы считаете, что ваш аккаунт был заблокирован по ошибке,
          пожалуйста, свяжитесь с администрацией сайта для выяснения обстоятельств.
        </p>
        
        <button
          onClick={logout}
          className="w-full flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition-colors"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Выйти из аккаунта
        </button>
      </div>
      
      <p className="text-sm text-gray-500">
        © {new Date().getFullYear()} FeedbackDeliveryService | Все права защищены
      </p>
    </div>
  );
};

export default BlockedAccountPage; 