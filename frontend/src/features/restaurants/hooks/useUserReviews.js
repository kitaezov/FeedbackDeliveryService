import { useState, useEffect, useCallback } from 'react';
import { restaurantService } from '../services/restaurantService';
import { useToast } from '../../../common/hooks/useToast';
import { useAuth } from '../../../common/hooks/useAuth';

/**
 * Хук для получения и управления отзывами текущего пользователя
 * 
 * @param {Object} initialParams - Начальные параметры запроса
 * @returns {Object} Объект с данными и методами для работы с отзывами пользователя
 */
export const useUserReviews = (initialParams = { page: 1, limit: 10 }) => {
    // Отзывы пользователя
    const [reviews, setReviews] = useState([]);
    // Состояние загрузки
    const [isLoading, setIsLoading] = useState(false);
    // Состояние ошибки
    const [error, setError] = useState(null);
    // Параметры запроса
    const [params, setParams] = useState(initialParams);
    // Мета-данные для пагинации
    const [meta, setMeta] = useState({
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        itemsPerPage: 10
    });
    // Состояние операции редактирования
    const [isEditing, setIsEditing] = useState(false);
    // Состояние операции удаления
    const [isDeleting, setIsDeleting] = useState(false);
    
    const { showToast } = useToast();
    const { user } = useAuth();
    
    /**
     * Загрузка отзывов пользователя
     */
    const fetchUserReviews = useCallback(async () => {
        if (!user) {
            setReviews([]);
            return;
        }
        
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await restaurantService.getUserReviews(user.id, params);
            
            setReviews(result.data || []);
            setMeta(result.meta || {
                totalItems: 0,
                totalPages: 0,
                currentPage: params.page,
                itemsPerPage: params.limit
            });
        } catch (err) {
            setError(err.message || 'Не удалось загрузить ваши отзывы');
            setReviews([]);
            showToast({
                title: 'Ошибка',
                description: 'Не удалось загрузить ваши отзывы',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    }, [user, params, showToast]);
    
    /**
     * Обновление отзыва пользователя
     * 
     * @param {string|number} reviewId - ID отзыва
     * @param {Object} reviewData - Данные отзыва
     * @param {number} reviewData.rating - Рейтинг (1-5)
     * @param {string} reviewData.text - Текст отзыва
     * @returns {Promise<Object>} Обновленный отзыв
     */
    const updateReview = useCallback(async (reviewId, reviewData) => {
        if (!reviewId) {
            throw new Error('ID отзыва не указан');
        }
        
        try {
            setIsEditing(true);
            
            const updatedReview = await restaurantService.updateReview(reviewId, reviewData);
            
            // Обновляем список отзывов
            await fetchUserReviews();
            
            return updatedReview;
        } catch (err) {
            throw err;
        } finally {
            setIsEditing(false);
        }
    }, [fetchUserReviews]);
    
    /**
     * Удаление отзыва пользователя
     * 
     * @param {string|number} reviewId - ID отзыва
     * @returns {Promise<void>}
     */
    const deleteReview = useCallback(async (reviewId) => {
        if (!reviewId) {
            throw new Error('ID отзыва не указан');
        }
        
        try {
            setIsDeleting(true);
            
            await restaurantService.deleteReview(user.id, reviewId);
            
            // Обновляем список отзывов
            await fetchUserReviews();
            
            showToast({
                title: 'Успех',
                description: 'Отзыв успешно удален',
                type: 'success'
            });
        } catch (err) {
            throw err;
        } finally {
            setIsDeleting(false);
        }
    }, [user.id, fetchUserReviews, showToast]);
    
    /**
     * Переход на определенную страницу
     * 
     * @param {number} page - Номер страницы
     */
    const goToPage = useCallback((page) => {
        if (page >= 1 && page <= meta.totalPages) {
            setParams(prev => ({ ...prev, page }));
        }
    }, [meta.totalPages]);
    
    /**
     * Изменение размера страницы
     * 
     * @param {number} limit - Количество элементов на странице
     */
    const changePageSize = useCallback((limit) => {
        setParams(prev => ({ ...prev, limit, page: 1 }));
    }, []);
    
    // Загружаем отзывы при монтировании и изменении параметров
    useEffect(() => {
        fetchUserReviews();
    }, [fetchUserReviews]);
    
    return {
        reviews,
        isLoading,
        error,
        params,
        meta,
        isEditing,
        isDeleting,
        updateReview,
        deleteReview,
        goToPage,
        changePageSize,
        refetch: fetchUserReviews
    };
}; 