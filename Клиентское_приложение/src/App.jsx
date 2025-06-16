import React, { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { ToastProvider } from './common/context/ToastContext';
import { AuthProvider, useAuth } from './common/context/AuthContext';
import { ThemeProvider } from './common/context/ThemeContext';
import { initCopyProtection } from './utils/copyProtection';
import { Toaster } from 'react-hot-toast';
import RestaurantManagement from './features/admin/RestaurantManagement';
import { FooterStyle } from './components/Footer';
import BlockedAccountPage from './components/BlockedAccountPage';
import BackgroundParticles from './components/BackgroundParticles';

/**
 * Внутренний компонент приложения, который проверяет блокировку
 */
const AppContent = () => {
  const { user, isAuthenticated } = useAuth();
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedReason, setBlockedReason] = useState('');

  useEffect(() => {
    // Проверяем, заблокирован ли аккаунт
    if (isAuthenticated && user && user.is_blocked) {
      setIsBlocked(true);
      setBlockedReason(user.blocked_reason || 'Причина не указана');
    } else {
      setIsBlocked(false);
      setBlockedReason('');
    }
  }, [isAuthenticated, user]);

  // Если аккаунт заблокирован, показываем страницу блокировки
  if (isBlocked) {
    return <BlockedAccountPage reason={blockedReason} />;
  }

  // Иначе показываем обычное содержимое приложения
  return (
    <div className="relative min-h-screen">
      <BackgroundParticles />
      <div className="relative z-10">
        <RouterProvider router={router} />
      </div>
    </div>
  );
};

/**
 * Корневой компонент приложения
 */
const App = () => {
  useEffect(() => {
    // Инициализируем защиту от Ctrl+A при монтировании компонента
    initCopyProtection();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <FooterStyle />
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-3)',
                fontSize: 'var(--font-size-sm)',
              },
              success: {
                style: {
                  background: 'rgb(22, 163, 74)',
                },
              },
              error: {
                style: {
                  background: 'rgb(220, 38, 38)',
                },
              },
            }}
          />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 