/**
 * Хук для работы с аутентификацией
 * 
 * Предоставляет функции для авторизации, регистрации и выхода из системы,
 * а также информацию о текущем пользователе.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { STORAGE_KEYS } from '../constants/config';
import { useNotification } from './useNotification';
import { 
    isAuthenticated, 
    setAccessToken, 
    setRefreshToken, 
    setUserData, 
    getUserData, 
    logout as logoutUtils 
} from '../utils/authUtils';
import { useToast } from './useToast';

/**
 * Хук для работы с аутентификацией пользователя
 * 
 * @returns {Object} Объект с методами и данными для аутентификации
 */
export const useAuth = () => {
    // Состояние текущего пользователя
    const [user, setUser] = useState(getUserData());
    
    // Состояние загрузки
    const [isLoading, setIsLoading] = useState(true);
    
    // Флаг авторизации пользователя
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(isAuthenticated());
    
    // Хук для навигации
    const navigate = useNavigate();
    
    // Хук для уведомлений
    const notification = useNotification();
    
    // Хук для тостов
    const { showToast } = useToast();
    
    /**
     * Загружает пользователя из localStorage или с сервера
     */
    const loadUser = useCallback(async () => {
        try {
            setIsLoading(true);
            
            // Проверяем наличие токена
            const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
            
            if (!token) {
                setUser(null);
                setIsUserAuthenticated(false);
                setIsLoading(false);
                return;
            }
            
            // Пытаемся получить данные пользователя из локального хранилища
            const cachedUser = localStorage.getItem(STORAGE_KEYS.USER);
            
            if (cachedUser) {
                const userData = JSON.parse(cachedUser);
                setUser(userData);
                setIsUserAuthenticated(true);
            }
            
            // В любом случае запрашиваем актуальные данные с сервера
            const { data } = await api.get('auth/profile');
            
            // Сохраняем данные в localStorage и устанавливаем в состояние
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
            setUser(data.user);
            setIsUserAuthenticated(true);
        } catch (error) {
            // В случае ошибки (особенно 401) - выполняем выход
            if (error.code === 401 || error.code === 'AUTH_ERROR') {
                logout();
            } else {
                console.error('Ошибка при загрузке пользователя:', error);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    // Загружаем пользователя при монтировании компонента
    useEffect(() => {
        loadUser();
    }, [loadUser]);
    
    /**
     * Регистрация нового пользователя
     * 
     * @param {Object} registerData - Данные для регистрации
     * @returns {Promise<boolean>} - Успех операции
     */
    const register = useCallback(async (registerData) => {
        setIsLoading(true);
        
        try {
            const response = await api.post('auth/register', registerData);
            const { user, accessToken, refreshToken } = response.data;
            
            // Сохраняем данные в localStorage
            setAccessToken(accessToken);
            setRefreshToken(refreshToken);
            setUserData(user);
            
            // Обновляем состояние
            setUser(user);
            setIsUserAuthenticated(true);
            
            showToast({
                title: 'Успешная регистрация',
                description: 'Вы успешно зарегистрировались в системе',
                type: 'success'
            });
            
            return true;
        } catch (error) {
            showToast({
                title: 'Ошибка регистрации',
                description: error.message || 'Произошла ошибка при регистрации',
                type: 'error'
            });
            
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);
    
    /**
     * Авторизация пользователя
     * 
     * @param {Object} loginData - Данные для авторизации
     * @returns {Promise<boolean>} - Успех операции
     */
    const login = useCallback(async (loginData) => {
        setIsLoading(true);
        
        try {
            const response = await api.post('auth/login', loginData);
            const { user, accessToken, refreshToken } = response.data;
            
            // Сохраняем данные в localStorage
            setAccessToken(accessToken);
            setRefreshToken(refreshToken);
            setUserData(user);
            
            // Обновляем состояние
            setUser(user);
            setIsUserAuthenticated(true);
            
            showToast({
                title: 'Успешная авторизация',
                description: `Добро пожаловать, ${user.name || 'пользователь'}!`,
                type: 'success'
            });
            
            return true;
        } catch (error) {
            showToast({
                title: 'Ошибка авторизации',
                description: error.message || 'Неверные учетные данные',
                type: 'error'
            });
            
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);
    
    /**
     * Выход из системы
     */
    const logout = useCallback(() => {
        setIsLoading(true);
        
        try {
            // Удаляем данные из localStorage
            logoutUtils();
            
            // Обновляем состояние
            setUser(null);
            setIsUserAuthenticated(false);
            
            showToast({
                title: 'Выход из системы',
                description: 'Вы успешно вышли из системы',
                type: 'info'
            });
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);
    
    /**
     * Обновление профиля пользователя
     * 
     * @param {Object} profileData - Новые данные профиля
     * @returns {Promise<boolean>} - Успех операции
     */
    const updateProfile = useCallback(async (profileData) => {
        setIsLoading(true);
        
        try {
            const response = await api.put('user/profile', profileData);
            const updatedUser = response.data;
            
            // Обновляем данные в localStorage
            setUserData(updatedUser);
            
            // Обновляем состояние
            setUser(updatedUser);
            
            showToast({
                title: 'Профиль обновлен',
                description: 'Ваш профиль успешно обновлен',
                type: 'success'
            });
            
            return true;
        } catch (error) {
            showToast({
                title: 'Ошибка обновления',
                description: error.message || 'Не удалось обновить профиль',
                type: 'error'
            });
            
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);
    
    return {
        user,
        isLoading,
        isAuthenticated: isUserAuthenticated,
        login,
        register,
        logout,
        updateProfile,
        loadUser
    };
}; 