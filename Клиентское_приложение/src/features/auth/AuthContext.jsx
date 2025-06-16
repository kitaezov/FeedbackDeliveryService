import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import api from '../../utils/api';
import { API_URL } from '../../config';

// Create the auth context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if the user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/profile');
          
          console.log('Получен ответ профиля:', response.data);
          
          if (response.data && response.data.user) {
            // Обработка пути к аватару
            let avatar = response.data.user.avatar;
            
            // Обновляем состояние пользователя
            setUser({
              ...response.data.user,
              token: token,
              avatar: avatar // сохраняем путь к аватару
            });
            setIsAuthenticated(true);
            
            // Предзагрузка изображения аватара для кэширования
            if (avatar) {
              // Процесс предзагрузки аватара
              const fullAvatarUrl = getAvatarUrl(avatar);
              if (fullAvatarUrl) {
                const img = new Image();
                img.src = fullAvatarUrl;
              }
            }
          }
        } catch (error) {
          console.error('Authentication error:', error);
          // If token is invalid, remove it
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    /**
     * Получает полный URL аватара пользователя
     * 
     * @param {string} avatarPath - Путь к файлу аватара
     * @returns {string|null} - Полный URL или null при отсутствии аватара
     */
    const getAvatarUrl = (avatarPath) => {
      if (!avatarPath) return null;
      
      // Добавляем временную метку для обхода кэша браузера
      const cacheParam = `?t=${new Date().getTime()}`;
      
      // If the avatar path is already a full URL, return it
      if (avatarPath.startsWith('http')) {
        // Если URL уже содержит параметры запроса, добавляем к ним временную метку
        if (avatarPath.includes('?')) {
          return `${avatarPath}&_=${new Date().getTime()}`;
        }
        // Иначе добавляем параметр с новой временной меткой
        return `${avatarPath}${cacheParam}`;
      }
      
      // For paths starting with /uploads, add the server base URL
      if (avatarPath.startsWith('/uploads')) {
        return `${API_URL}${avatarPath}${cacheParam}`;
      }
      
      // For paths without leading slash
      if (!avatarPath.startsWith('/')) {
        return `${API_URL}/${avatarPath}${cacheParam}`;
      }
      
      // Otherwise, prepend the server base URL
      return `${API_URL}${avatarPath}${cacheParam}`;
    };

    checkAuth();
  }, []);

  // Listen for auth changes from other components
  useEffect(() => {
    const handleAuthChange = (event) => {
      if (event.detail.isAuthenticated) {
        setUser(event.detail.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    document.addEventListener('auth-changed', handleAuthChange);
    return () => {
      document.removeEventListener('auth-changed', handleAuthChange);
    };
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      console.log('Отправка запроса на вход в систему:', credentials);
      const response = await api.post('auth/login', credentials);
      
      const { token, user: userData } = response.data;
      
      // Check if the user is blocked
      if (response.data.blocked) {
        return { 
          success: false, 
          error: 'Аккаунт заблокирован', 
          isBlocked: true,
          blockedReason: response.data.blocked_reason
        };
      }
      
      // Always save token to localStorage for session persistence
      localStorage.setItem('token', token);
      
      // Update state
      setUser({
        ...userData,
        token
      });
      setIsAuthenticated(true);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      
      // Check if the error is due to blocked account
      if (error.response?.status === 403 && error.response?.data?.blocked) {
        return { 
          success: false, 
          error: 'Аккаунт заблокирован', 
          isBlocked: true,
          blockedReason: error.response.data.blocked_reason
        };
      }
      
      return { 
        success: false, 
        error: error.response?.data?.message || 'Ошибка входа' 
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    
    // Dispatch event for other components
    const authEvent = new CustomEvent('auth-changed', { 
      detail: { 
        isAuthenticated: false
      } 
    });
    document.dispatchEvent(authEvent);
  };

  // Update user function
  const updateAuthUser = (userData) => {
    if (!userData) return;
    
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
    
    // Dispatch event for other components
    const authEvent = new CustomEvent('auth-changed', { 
      detail: { 
        isAuthenticated: true,
        user: userData
      } 
    });
    document.dispatchEvent(authEvent);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        isLoading,
        login,
        logout,
        setUser,
        updateAuthUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 