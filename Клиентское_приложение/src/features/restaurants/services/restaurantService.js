/**
 * Сервис для работы с данными ресторанов через API
 */
import { apiService } from '../../../services/apiService';
import api from '../../../utils/api';
import { API_URL } from '../../../config';

// Базовый путь к API ресторанов
const API_PATH = '/restaurants';

/**
 * Сервис для работы с ресторанами
 */
export const restaurantService = {
    /**
     * Получает список ресторанов с возможностью фильтрации
     * 
     * @param {Object} filters - Фильтры для поиска
     * @param {string} filters.query - Поисковый запрос
     * @param {string} filters.cuisine - Тип кухни
     * @param {number} filters.rating - Минимальный рейтинг
     * @param {string} filters.priceRange - Диапазон цен
     * @param {number} filters.page - Номер страницы
     * @param {number} filters.limit - Количество элементов на странице
     * @returns {Promise<Object>} Данные с ресторанами и метаданными
     */
    getRestaurants: async (params = {}) => {
        try {
            const response = await api.get('/restaurants', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            throw error;
        }
    },
    
    /**
     * Получает детальную информацию о ресторане по ID
     * 
     * @param {string|number} id - ID ресторана
     * @returns {Promise<Object>} Данные ресторана
     */
    getRestaurantById: async (id) => {
        try {
            const response = await api.get(`/restaurants/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching restaurant with ID ${id}:`, error);
            throw error;
        }
    },
    
    /**
     * Получает отзывы для ресторана
     * 
     * @param {string|number} restaurantId - ID ресторана
     * @param {Object} params - Параметры запроса
     * @param {number} params.page - Номер страницы
     * @param {number} params.limit - Количество элементов на странице
     * @param {string} params.sortBy - Поле для сортировки
     * @param {string} params.sortOrder - Порядок сортировки (asc, desc)
     * @returns {Promise<Object>} Отзывы с метаданными
     */
    getRestaurantReviews: async (restaurantId, params = {}) => {
        try {
            console.log(`Fetching reviews for restaurant ${restaurantId} with params:`, params);
            
            if (!restaurantId) {
                console.error('Restaurant ID is missing or invalid');
                return { reviews: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
            }
            
            // Используем ID ресторана для получения отзывов
            const response = await api.get(`/reviews`, { 
                params: { 
                    ...params,
                    restaurantId: restaurantId 
                } 
            });
            console.log('Restaurant reviews raw response:', response);
            
            // Normalize response format - try to handle different API response structures
            let normalizedResponse = { reviews: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
            
            if (response.data && Array.isArray(response.data)) {
                // Если сервер вернул массив отзывов напрямую
                normalizedResponse.reviews = response.data;
                console.log('Server returned direct array of reviews');
            } else if (response.data && response.data.reviews && Array.isArray(response.data.reviews)) {
                // Если сервер вернул объект с массивом отзывов
                normalizedResponse = response.data;
                console.log('Server returned object with reviews array');
            } else if (response.data && typeof response.data === 'object') {
                // Попытка найти массив отзывов в любом объекте
                console.log('Trying to find reviews in response object');
                for (const key in response.data) {
                    if (Array.isArray(response.data[key])) {
                        normalizedResponse.reviews = response.data[key];
                        console.log(`Found reviews array in response.data.${key}`);
                        break;
                    }
                }
            } else {
                console.warn('Unexpected API response format:', response.data);
            }
            
            // Make sure we have a valid array of reviews
            if (!Array.isArray(normalizedResponse.reviews)) {
                console.error('Reviews is not an array:', normalizedResponse.reviews);
                normalizedResponse.reviews = [];
            }
            
            // Filter out deleted reviews
            normalizedResponse.reviews = normalizedResponse.reviews.filter(review => !review.deleted);
            
            // Log the normalized response
            console.log('Normalized restaurant reviews response:', normalizedResponse);
            console.log(`Found ${normalizedResponse.reviews.length} non-deleted reviews`);
            
            return normalizedResponse;
        } catch (error) {
            console.error(`Error fetching reviews for restaurant ${restaurantId}:`, error);
            // Return empty data structure instead of throwing
            return { reviews: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
        }
    },
    
    /**
     * Добавляет новый отзыв к ресторану
     * 
     * @param {Object} reviewData - Данные отзыва
     * @param {number} reviewData.rating - Рейтинг (1-5)
     * @param {string} reviewData.comment - Текст отзыва
     * @param {string} reviewData.restaurantName - Название ресторана
     * @returns {Promise<Object>} Созданный отзыв
     */
    addReview: async (reviewData) => {
        try {
            console.log('Sending review data to API:', reviewData);
            
            // Make sure we have the required fields
            if (!reviewData.rating || !reviewData.comment || !reviewData.restaurantName) {
                throw new Error('Не все обязательные поля заполнены');
            }
            
            // Call the reviews API endpoint directly
            const response = await api.post('/reviews', reviewData);
            console.log('Review creation response:', response);
            
            if (!response || !response.data) {
                throw new Error('Получен пустой ответ от API');
            }
            
            return response.data;
        } catch (error) {
            console.error('Error adding review:', error);
            throw error;
        }
    },
    
    /**
     * Получает рейтинги и статистику ресторана
     * 
     * @param {string|number} restaurantId - ID ресторана
     * @returns {Promise<Object>} Данные статистики
     */
    getRestaurantStats: (restaurantId) => {
        return apiService.get(`${API_PATH}/${restaurantId}/stats`);
    },
    
    /**
     * Получает популярные рестораны
     * 
     * @param {number} limit - Количество ресторанов
     * @returns {Promise<Array>} Список популярных ресторанов
     */
    getPopularRestaurants: (limit = 5) => {
        return apiService.get(`${API_PATH}/popular`, { limit });
    },
    
    /**
     * Получает рекомендуемые рестораны для пользователя
     * 
     * @param {number} limit - Количество ресторанов
     * @returns {Promise<Array>} Список рекомендуемых ресторанов
     */
    getRecommendedRestaurants: (limit = 3) => {
        return apiService.get(`${API_PATH}/recommended`, { limit });
    },
    
    /**
     * Получает список кухонь ресторанов
     * 
     * @returns {Promise<Array>} Список типов кухонь
     */
    getCuisines: () => {
        return apiService.get(`${API_PATH}/cuisines`);
    },
    
    /**
     * Получает отзывы пользователя
     * 
     * @param {number} userId - ID пользователя
     * @param {Object} params - Параметры запроса (page, limit)
     * @returns {Promise<Object>} Отзывы пользователя с метаданными
     */
    getUserReviews: (userId, params = {}) => {
        return api.get('/reviews', { params: { ...params, userId } });
    },
    
    /**
     * Обновляет отзыв пользователя
     * 
     * @param {string|number} reviewId - ID отзыва
     * @param {Object} reviewData - Данные отзыва
     * @param {number} reviewData.rating - Рейтинг (1-5)
     * @param {string} reviewData.text - Текст отзыва
     * @returns {Promise<Object>} Обновленный отзыв
     */
    updateReview: (reviewId, reviewData) => {
        return apiService.put(`/reviews/${reviewId}`, reviewData);
    },
    
    /**
     * Удаляет отзыв пользователя
     * 
     * @param {string|number} reviewId - ID отзыва
     * @returns {Promise<Object>} Результат операции
     */
    deleteReview: (reviewId) => {
        return apiService.delete(`/reviews/${reviewId}`);
    },
    
    /**
     * Получить меню ресторана в формате PDF
     * 
     * @param {string|number} restaurantId - ID ресторана
     * @returns {string} - URL для загрузки меню в формате PDF
     */
    getRestaurantMenu: (restaurantId) => {
        // Всегда возвращаем URL для меню, даже если оно может не существовать
        // Это нормально для маршрутизации, серверная часть должна обрабатывать отсутствие файла
        return `${API_URL}/menus/${restaurantId}.pdf`;
    },
    
    /**
     * Проверяет, есть ли у ресторана меню
     * 
     * @param {string|number} restaurantId - ID ресторана
     * @returns {Promise<boolean>} - Promise, который разрешается в true, если у ресторана есть меню
     */
    checkMenuExists: async (restaurantId) => {
        try {
            // Отправляем HEAD запрос, чтобы проверить существование файла без его загрузки
            await api.head(`/menus/${restaurantId}.pdf`);
            return true;
        } catch (error) {
            // Если файл не найден, возвращаем false
            return false;
        }
    },
    
    /**
     * Открывает меню ресторана в новой вкладке, с проверкой наличия меню
     * 
     * @param {string|number} restaurantId - ID ресторана
     * @param {Function} onError - Функция обратного вызова в случае отсутствия меню
     * @returns {Promise<void>}
     */
    openRestaurantMenu: async (restaurantId, onError) => {
        try {
            const hasMenu = await restaurantService.checkMenuExists(restaurantId);
            
            if (hasMenu) {
                // Если меню существует, открываем его в новой вкладке
                window.open(restaurantService.getRestaurantMenu(restaurantId), '_blank');
            } else if (onError && typeof onError === 'function') {
                // Если меню не существует и передан обработчик ошибки, вызываем его
                onError();
            } else {
                // Если обработчик ошибки не передан, открываем меню-заглушку
                window.open(`${API_URL}/menus/default-menu.pdf`, '_blank');
            }
        } catch (error) {
            console.error('Error checking menu existence:', error);
            // В случае ошибки открываем меню-заглушку
            window.open(`${API_URL}/menus/default-menu.pdf`, '_blank');
        }
    },
    
    /**
     * Загружает новое меню ресторана в формате PDF
     * 
     * @param {string|number} restaurantId - ID ресторана
     * @param {File} menuFile - Файл меню в формате PDF
     * @returns {Promise<Object>} - Результат операции
     */
    uploadRestaurantMenu: async (restaurantId, menuFile) => {
        try {
            // Создаем FormData для загрузки файла
            const formData = new FormData();
            formData.append('menu', menuFile);
            
            const response = await api.post(`/restaurants/${restaurantId}/menu`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            return response.data;
        } catch (error) {
            console.error(`Error uploading menu for restaurant ${restaurantId}:`, error);
            throw error;
        }
    },
    
    /**
     * Загружает изображение ресторана
     * 
     * @param {string|number} restaurantId - ID ресторана
     * @param {File} imageFile - Файл изображения
     * @returns {Promise<Object>} - Результат операции с URL загруженного изображения
     */
    uploadRestaurantImage: async (restaurantId, imageFile) => {
        try {
            // Создаем FormData для загрузки файла
            const formData = new FormData();
            formData.append('image', imageFile);
            
            const response = await api.post(`/restaurants/${restaurantId}/image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            // Убедитесь, что мы возвращаем правильный формат ответа с полем imageUrl
            if (response.data && !response.data.imageUrl && response.data.image_url) {
                response.data.imageUrl = response.data.image_url;
            }
            
            return response.data;
        } catch (error) {
            console.error(`Error uploading image for restaurant ${restaurantId}:`, error);
            throw error;
        }
    }
}; 