import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserReviews } from '../hooks';
import { useAuth } from '../../../common/hooks/useAuth';
import { 
    Container, 
    Breadcrumbs,
    Heading,
    Card,
    Button,
    LoadingSpinner,
    Alert,
    Select,
    Pagination
} from '../../../common/components/ui';
import { StarRating } from '../components';

/**
 * Страница с отзывами пользователя
 */
export const UserReviewsPage = () => {
    const { user } = useAuth();
    const [sortOption, setSortOption] = useState('createdAt:desc');
    
    const {
        reviews,
        isLoading,
        error,
        metadata,
        deletingReviewId,
        goToPage,
        deleteReview,
        sortReviews
    } = useUserReviews({ sortBy: sortOption });
    
    // Обработчик удаления отзыва
    const handleDeleteReview = (review) => {
        if (window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
            deleteReview(review);
        }
    };
    
    // Обработчик изменения сортировки
    const handleSortChange = (e) => {
        const value = e.target.value;
        setSortOption(value);
        sortReviews(value);
    };
    
    // Если пользователь не авторизован
    if (!user) {
        return (
            <Container>
                <div className="py-20 text-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Необходима авторизация
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Для просмотра ваших отзывов необходимо войти в аккаунт.
                    </p>
                    <Link to="/login">
                        <Button variant="primary">
                            Войти
                        </Button>
                    </Link>
                </div>
            </Container>
        );
    }
    
    return (
        <Container size="xl" className="py-6 review-section">
            {/* Хлебные крошки */}
            <Breadcrumbs className="mb-6">
                <Breadcrumbs.Item href="/">Главная</Breadcrumbs.Item>
                <Breadcrumbs.Item href="/profile">Профиль</Breadcrumbs.Item>
                <Breadcrumbs.Item isCurrentPage>Мои отзывы</Breadcrumbs.Item>
            </Breadcrumbs>
            
            {/* Заголовок страницы */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <Heading level={1} className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
                    Мои отзывы о ресторанах
                </Heading>
                
                {/* Выпадающий список для сортировки */}
                <div className="w-full md:w-auto">
                    <Select
                        value={sortOption}
                        onChange={handleSortChange}
                        className="w-full md:w-64"
                    >
                        <option value="createdAt:desc">Сначала новые</option>
                        <option value="createdAt:asc">Сначала старые</option>
                        <option value="rating:desc">По убыванию рейтинга</option>
                        <option value="rating:asc">По возрастанию рейтинга</option>
                    </Select>
                </div>
            </div>
            
            {/* Опции сортировки */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {metadata.totalCount > 0 ? (
                            <span>Всего отзывов: {metadata.totalCount}</span>
                        ) : !isLoading && (
                            <span>У вас пока нет отзывов</span>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Индикатор загрузки */}
            {isLoading && (
                <div className="flex justify-center py-10">
                    <LoadingSpinner size="large" />
                </div>
            )}
            
            {/* Сообщение об ошибке */}
            {error && !isLoading && (
                <Alert 
                    type="error" 
                    title="Ошибка загрузки" 
                    message={error}
                    className="mb-6"
                />
            )}
            
            {/* Список отзывов */}
            {!isLoading && !error && reviews.length > 0 && (
                <div className="space-y-6 mb-8">
                    {reviews.map(review => (
                        <Card key={review.id} className="p-6">
                            <div className="flex justify-between mb-4">
                                <div>
                                    <Link 
                                        to={`/restaurants/${review.restaurantId}`}
                                        className="text-xl font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-500 transition-colors"
                                    >
                                        {review.restaurant?.name || 'Ресторан'}
                                    </Link>
                                    <div className="flex items-center gap-2 mt-1">
                                        <StarRating 
                                            rating={review.rating} 
                                            showValue={true}
                                            className="text-yellow-500"
                                        />
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    variant="danger-outline"
                                    size="sm"
                                    onClick={() => handleDeleteReview(review)}
                                    isLoading={deletingReviewId === review.id}
                                    disabled={deletingReviewId === review.id}
                                >
                                    Удалить
                                </Button>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                                {review.comment}
                            </p>
                        </Card>
                    ))}
                </div>
            )}
            
            {/* Сообщение, если нет отзывов */}
            {!isLoading && !error && reviews.length === 0 && (
                <Card className="p-6 text-center">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        У вас пока нет отзывов
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Посетите страницы ресторанов, чтобы оставить свой первый отзыв
                    </p>
                    <Link to="/restaurants">
                        <Button variant="primary">
                            Посмотреть рестораны
                        </Button>
                    </Link>
                </Card>
            )}
            
            {/* Пагинация */}
            {metadata.totalPages > 1 && (
                <Pagination
                    currentPage={metadata.currentPage}
                    totalPages={metadata.totalPages}
                    onPageChange={(page) => goToPage(page)}
                    className="mt-8"
                />
            )}
        </Container>
    );
}; 