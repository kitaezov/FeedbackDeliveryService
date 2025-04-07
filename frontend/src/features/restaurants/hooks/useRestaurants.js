import { useState, useEffect, useCallback } from 'react';
import { restaurantService } from '../services/restaurantService';
import { useToast } from '../../../common/hooks/useToast';

/**
 * Хук для получения и фильтрации ресторанов
 * 
 * @param {Object} initialFilters - Начальные фильтры
 * @returns {Object} Данные и функции для работы с ресторанами
 */
export const useRestaurants = (initialFilters = {}) => {
    // Состояние для ресторанов
    const [restaurants, setRestaurants] = useState([]);
    // Состояние для фильтров
    const [filters, setFilters] = useState(initialFilters);
    // Состояние загрузки
    const [isLoading, setIsLoading] = useState(false);
    // Состояние ошибки
    const [error, setError] = useState(null);
    // Мета-данные пагинации и т.д.
    const [meta, setMeta] = useState({
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        itemsPerPage: 10
    });
    
    const { showToast } = useToast();
    
    /**
     * Загрузка ресторанов с учетом фильтров
     */
    const fetchRestaurants = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const result = await restaurantService.getRestaurants(filters);
            
            setRestaurants(result.data || []);
            setMeta(result.meta || {
                totalItems: 0,
                totalPages: 0,
                currentPage: 1,
                itemsPerPage: 10
            });
        } catch (err) {
            setError(err.message || 'Не удалось загрузить рестораны');
            setRestaurants([]);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);
    
    /**
     * Загрузка ресторанов при изменении фильтров
     */
    useEffect(() => {
        fetchRestaurants();
    }, [fetchRestaurants]);
    
    /**
     * Обновление фильтров
     * 
     * @param {Object} newFilters - Новые фильтры для применения
     */
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters,
            page: newFilters.hasOwnProperty('page') ? newFilters.page : 1 // При изменении фильтров сбрасываем страницу
        }));
    }, []);
    
    /**
     * Сброс всех фильтров
     */
    const resetFilters = useCallback(() => {
        setFilters({ page: 1, limit: meta.itemsPerPage });
    }, [meta.itemsPerPage]);
    
    /**
     * Переход на определенную страницу
     * 
     * @param {number} page - Номер страницы
     */
    const goToPage = useCallback((page) => {
        if (page >= 1 && page <= meta.totalPages) {
            updateFilters({ page });
        }
    }, [meta.totalPages, updateFilters]);
    
    /**
     * Изменение размера страницы
     * 
     * @param {number} limit - Количество элементов на странице
     */
    const changePageSize = useCallback((limit) => {
        updateFilters({ limit, page: 1 });
    }, [updateFilters]);
    
    /**
     * Получение статистики ресторанов
     */
    const fetchStats = useCallback(async () => {
        try {
            const statsData = await restaurantService.getRestaurantStats();
            // Здесь можно добавить обновление состояния stats
        } catch (err) {
            console.error('Ошибка при загрузке статистики:', err);
            // Не показываем уведомление, так как это не критичная ошибка
        }
    }, []);
    
    // Загружаем статистику один раз при монтировании
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);
    
    // Возвращаем все данные и функции
    return {
        restaurants,
        filters,
        isLoading,
        error,
        meta,
        updateFilters,
        resetFilters,
        goToPage,
        changePageSize,
        refetch: fetchRestaurants
    };
}; 