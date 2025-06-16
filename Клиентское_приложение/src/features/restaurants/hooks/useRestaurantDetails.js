import { useState, useEffect, useCallback } from 'react';
import { restaurantService } from '../services/restaurantService';
import { useToast } from '../../../common/hooks/useToast';
import { useAuth } from '../../../common/hooks/useAuth';

/**
 * Хук для получения детальной информации о ресторане и управления отзывами
 * 
 * @param {string|number} restaurantId - ID ресторана
 * @returns {Object} - Объект с данными и методами для работы с рестораном
 */
export const useRestaurantDetails = (restaurantId) => {
    // Данные ресторана
    const [restaurant, setRestaurant] = useState(null);
    // Отзывы ресторана
    const [reviews, setReviews] = useState([]);
    // Состояние загрузки
    const [isLoading, setIsLoading] = useState(true);
    // Состояние загрузки отзывов
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);
    // Состояние ошибки
    const [error, setError] = useState(null);
    // Мета-данные для отзывов
    const [reviewsMeta, setReviewsMeta] = useState({
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        itemsPerPage: 5
    });
    const [reviewsError, setReviewsError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingReviewId, setDeletingReviewId] = useState(null);
    
    const { showToast } = useToast();
    const { user } = useAuth();
    
    /**
     * Получить информацию о ресторане
     */
    const fetchRestaurant = useCallback(async () => {
        if (!restaurantId) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const data = await restaurantService.getRestaurantById(restaurantId);
            setRestaurant(data);
        } catch (err) {
            setError(err.message || 'Не удалось загрузить информацию о ресторане');
            setRestaurant(null);
            showToast({
                title: 'Ошибка',
                description: 'Не удалось загрузить данные ресторана',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    }, [restaurantId, showToast]);
    
    /**
     * Получить отзывы о ресторане
     */
    const fetchReviews = useCallback(async (params = { page: 1, limit: 5 }) => {
        if (!restaurantId) return;
        
        setIsLoadingReviews(true);
        setReviewsError(null);
        
        try {
            const result = await restaurantService.getRestaurantReviews(restaurantId, params);
            
            setReviews(result.data || []);
            setReviewsMeta(result.meta || {
                totalItems: 0,
                totalPages: 0,
                currentPage: params.page,
                itemsPerPage: params.limit
            });
        } catch (err) {
            setReviewsError(err.message || 'Не удалось загрузить отзывы');
            setReviews([]);
            showToast({
                title: 'Ошибка',
                description: 'Не удалось загрузить отзывы',
                type: 'error'
            });
        } finally {
            setIsLoadingReviews(false);
        }
    }, [restaurantId, showToast]);
    
    /**
     * Добавить новый отзыв
     * 
     * @param {Object} reviewData - Данные отзыва
     * @param {number} reviewData.rating - Рейтинг (от 1 до 5)
     * @param {string} reviewData.comment - Текст отзыва
     * @returns {Promise<boolean>} - Результат операции
     */
    const addReview = useCallback(async (reviewData) => {
        if (!restaurantId || !user) return false;
        
        setIsSubmitting(true);
        
        try {
            const newReview = await restaurantService.addReview(restaurantId, reviewData);
            
            // Обновляем список отзывов
            setReviews(prev => [newReview, ...prev]);
            
            // Обновляем рейтинг ресторана
            if (restaurant) {
                const totalReviews = restaurant.reviewCount + 1;
                const newRating = ((restaurant.rating * restaurant.reviewCount) + reviewData.rating) / totalReviews;
                
                setRestaurant(prev => ({
                    ...prev,
                    rating: newRating,
                    reviewCount: totalReviews
                }));
            }
            
            showToast({
                title: 'Успех',
                description: 'Отзыв успешно добавлен',
                type: 'success'
            });
            
            return true;
        } catch (err) {
            showToast({
                title: 'Ошибка',
                description: err.message || 'Не удалось добавить отзыв',
                type: 'error'
            });
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [restaurantId, restaurant, user, showToast]);
    
    /**
     * Удалить отзыв
     * 
     * @param {string|number} reviewId - ID отзыва
     * @returns {Promise<boolean>} - Результат операции
     */
    const deleteReview = useCallback(async (reviewId) => {
        if (!restaurantId || !reviewId) return false;
        
        setDeletingReviewId(reviewId);
        
        try {
            // Находим отзыв для обновления статистики ресторана
            const reviewToDelete = reviews.find(rev => rev.id == reviewId);
            
            await restaurantService.deleteReview(restaurantId, reviewId);
            
            // Обновляем список отзывов
            setReviews(prev => prev.filter(review => review.id != reviewId));
            
            // Обновляем рейтинг ресторана
            if (restaurant && reviewToDelete) {
                const totalReviews = restaurant.reviewCount - 1;
                
                if (totalReviews > 0) {
                    const newRating = ((restaurant.rating * restaurant.reviewCount) - reviewToDelete.rating) / totalReviews;
                    
                    setRestaurant(prev => ({
                        ...prev,
                        rating: newRating,
                        reviewCount: totalReviews
                    }));
                } else {
                    setRestaurant(prev => ({
                        ...prev,
                        rating: 0,
                        reviewCount: 0
                    }));
                }
            }
            
            showToast({
                title: 'Успех',
                description: 'Отзыв успешно удален',
                type: 'success'
            });
            
            return true;
        } catch (err) {
            showToast({
                title: 'Ошибка',
                description: err.message || 'Не удалось удалить отзыв',
                type: 'error'
            });
            return false;
        } finally {
            setDeletingReviewId(null);
        }
    }, [restaurantId, restaurant, reviews, showToast]);
    
    /**
     * Проверить, оставил ли текущий пользователь отзыв
     * 
     * @returns {Object|null} - Объект отзыва или null
     */
    const getUserReview = useCallback(() => {
        if (!user || !reviews.length) return null;
        return reviews.find(review => review.author?.id === user.id);
    }, [user, reviews]);
    
    /**
     * Переход на определенную страницу отзывов
     * 
     * @param {number} page - Номер страницы
     */
    const goToReviewsPage = useCallback((page) => {
        if (page >= 1 && page <= reviewsMeta.totalPages) {
            fetchReviews({ page, limit: reviewsMeta.itemsPerPage });
        }
    }, [fetchReviews, reviewsMeta.totalPages, reviewsMeta.itemsPerPage]);
    
    // Загружаем данные ресторана и отзывы при монтировании и изменении ID
    useEffect(() => {
        if (restaurantId) {
            fetchRestaurant();
            fetchReviews();
        }
    }, [restaurantId, fetchRestaurant, fetchReviews]);
    
    return {
        restaurant,
        reviews,
        isLoading,
        isLoadingReviews,
        error,
        reviewsError,
        isSubmitting,
        deletingReviewId,
        reviewsMeta,
        addReview,
        deleteReview,
        getUserReview,
        goToReviewsPage,
        refetchRestaurant: fetchRestaurant,
        refetchReviews: fetchReviews,
    };
}; 