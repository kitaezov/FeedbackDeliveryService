/**
 * Утилиты для работы с авторизацией и токенами
 */

// Константы для ключей localStorage
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_DATA_KEY = 'user_data';

/**
 * Сохранение токена доступа в localStorage
 * 
 * @param {string} token - Токен доступа
 */
export const setAccessToken = (token) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

/**
 * Получение токена доступа из localStorage
 * 
 * @returns {string|null} - Токен доступа или null
 */
export const getAccessToken = () => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Удаление токена доступа из localStorage
 */
export const removeAccessToken = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
};

/**
 * Сохранение refresh токена в localStorage
 * 
 * @param {string} token - Refresh токен
 */
export const setRefreshToken = (token) => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

/**
 * Получение refresh токена из localStorage
 * 
 * @returns {string|null} - Refresh токен или null
 */
export const getRefreshToken = () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Удаление refresh токена из localStorage
 */
export const removeRefreshToken = () => {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Сохранение данных пользователя в localStorage
 * 
 * @param {Object} userData - Данные пользователя
 */
export const setUserData = (userData) => {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
};

/**
 * Получение данных пользователя из localStorage
 * 
 * @returns {Object|null} - Данные пользователя или null
 */
export const getUserData = () => {
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
};

/**
 * Удаление данных пользователя из localStorage
 */
export const removeUserData = () => {
    localStorage.removeItem(USER_DATA_KEY);
};

/**
 * Проверка, авторизован ли пользователь
 * 
 * @returns {boolean} - true, если есть токен доступа
 */
export const isAuthenticated = () => {
    return !!getAccessToken();
};

/**
 * Полный выход из системы с удалением всех данных
 */
export const logout = () => {
    removeAccessToken();
    removeRefreshToken();
    removeUserData();
}; 