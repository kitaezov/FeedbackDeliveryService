import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '../../../common/components/ui/Card';
import { StarRating } from './StarRating';
import { Button } from '../../../common/components/ui/Button';
import { LoadingSpinner } from '../../../common/components/ui/LoadingSpinner';
import { PlusCircle, Edit, Trash } from 'lucide-react';
import { User } from 'lucide-react';

/**
 * Компонент карточки отзыва
 */
const ReviewCard = ({ review, onDelete, canDelete, isDeleting }) => {
    const { author, date, rating, comment, id } = review;
    
    // Форматируем дату
    const formattedDate = new Date(date).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    return (
        <Card className="overflow-hidden">
            <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                            {author.name || 'Анонимный пользователь'}
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {formattedDate}
                        </div>
                    </div>
                    
                    <StarRating 
                        rating={rating}
                        className="text-yellow-500"
                        showValue={true}
                    />
                </div>
                
                <div className="mt-3 text-gray-700 dark:text-gray-300">
                    {comment}
                </div>
                
                {canDelete && (
                    <div className="mt-4 flex justify-end">
                        <Button
                            variant="danger"
                            size="small"
                            onClick={() => onDelete(id)}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Удаление...' : 'Удалить'}
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
};

ReviewCard.propTypes = {
    review: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        author: PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            name: PropTypes.string
        }),
        date: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]).isRequired,
        rating: PropTypes.number.isRequired,
        comment: PropTypes.string.isRequired
    }).isRequired,
    onDelete: PropTypes.func,
    canDelete: PropTypes.bool,
    isDeleting: PropTypes.bool
};

/**
 * Компонент списка отзывов
 * 
 * @param {Object} props - Свойства компонента
 * @param {Array} props.reviews - Массив отзывов
 * @param {boolean} [props.isLoading=false] - Индикатор загрузки
 * @param {string} [props.error] - Сообщение об ошибке
 * @param {Function} [props.onDelete] - Функция удаления отзыва
 * @param {Object} [props.currentUser] - Текущий пользователь
 * @param {string|number} [props.deletingReviewId] - ID отзыва, который удаляется
 * @returns {JSX.Element} React-компонент
 */
export const ReviewList = ({ 
    reviews = [], 
    isLoading = false, 
    error,
    onDelete,
    currentUser,
    deletingReviewId
}) => {
    // Вычисляем средний рейтинг
    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : 0;
    
    // Сортируем отзывы по дате (сначала новые)
    const sortedReviews = [...reviews].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Группировка отзывов по рейтингу для статистики
    const ratingStats = reviews.reduce((stats, review) => {
        const rating = Math.floor(review.rating);
        stats[rating] = (stats[rating] || 0) + 1;
        return stats;
    }, {});
    
    // Расчет процентов для статистики
    const getRatingPercent = (rating) => {
        if (!reviews.length) return 0;
        return ((ratingStats[rating] || 0) / reviews.length) * 100;
    };
    
    // Сообщение, если нет отзывов
    const noReviewsMessage = !isLoading && reviews.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 w-full transition-all duration-300">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Отзывов пока нет</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
                Будьте первым, кто оставит отзыв об этом ресторане!
            </p>
        </div>
    ) : null;
    
    // Сообщение об ошибке
    const errorMessage = error ? (
        <div className="text-center py-10 text-red-500">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium">Ошибка при загрузке отзывов</h3>
            <p className="mt-1">{error}</p>
        </div>
    ) : null;
    
    if (isLoading) {
        return (
            <div className="flex justify-center py-10">
                <LoadingSpinner size="large" />
            </div>
        );
    }
    
    if (error) {
        return errorMessage;
    }
    
    if (reviews.length === 0) {
        return noReviewsMessage;
    }
    
    return (
        <div className="space-y-3 sm:space-y-4 w-full max-w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 w-full">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Отзывы {reviews.length > 0 ? `(${reviews.length})` : ''}
                </h2>
                {currentUser && (
                    <button
                        onClick={() => {}}
                        className="flex items-center text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm transition-all w-full sm:w-auto justify-center sm:justify-start"
                    >
                        <PlusCircle size={16} className="mr-1.5" />
                        <span>Добавить отзыв</span>
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="py-8 flex justify-center w-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700 dark:border-gray-300"></div>
                </div>
            ) : reviews.length === 0 ? (
                <div className="py-6 sm:py-8 text-center text-sm sm:text-base text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg w-full">
                    {noReviewsMessage || 'Отзывов пока нет. Будьте первым, кто оставит отзыв!'}
                </div>
            ) : (
                <div className="space-y-3 sm:space-y-4 w-full max-w-full">
                    {sortedReviews.map((review) => (
                        <div 
                            key={review.id} 
                            className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 w-full transition-all duration-200"
                        >
                            <div className="p-3 sm:p-4 sm:pb-3 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                                <div className="flex items-center w-full sm:w-auto">
                                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                        {review.author?.avatar ? (
                                            <img 
                                                src={review.author.avatar} 
                                                alt={review.author.name} 
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <User size={16} className="text-gray-500 dark:text-gray-400" />
                                        )}
                                    </div>
                                    <div className="ml-2 sm:ml-3 flex-grow">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                            <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
                                                {review.author?.name || 'Анонимный пользователь'}
                                            </h3>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(review.date).toLocaleDateString('ru-RU', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center mt-1">
                                            <div className="flex items-center">
                                                {Array.from({ length: 5 }).map((_, index) => (
                                                    <Star 
                                                        key={index}
                                                        size={14} 
                                                        className={`${
                                                            index < review.rating 
                                                                ? 'text-yellow-400 fill-yellow-400' 
                                                                : 'text-gray-300 dark:text-gray-600'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="ml-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {review.rating.toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {currentUser && (currentUser.isAdmin || currentUser.id === review.author.id) && (
                                    <div className="flex mt-2 sm:mt-0 w-full sm:w-auto justify-end">
                                        <button
                                            onClick={() => {}}
                                            className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-all mr-2"
                                        >
                                            <div className="flex items-center">
                                                <Edit size={14} className="mr-1" />
                                                <span>Изменить</span>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => onDelete(review.id)}
                                            className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-md transition-all"
                                        >
                                            <div className="flex items-center">
                                                <Trash size={14} className="mr-1" />
                                                <span>Удалить</span>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="p-3 sm:p-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                <p>{review.comment}</p>
                                
                                {review.criteria && review.criteria.length > 0 && (
                                    <div className="mt-3 sm:mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                        {review.criteria.map((item, index) => (
                                            <div key={index} className="flex flex-col p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                                                <span className="text-xs text-gray-600 dark:text-gray-400">{item.name}</span>
                                                <div className="flex items-center mt-1">
                                                    <div className="flex items-center">
                                                        {Array.from({ length: 5 }).map((_, idx) => (
                                                            <Star 
                                                                key={idx}
                                                                size={12} 
                                                                className={`${
                                                                    idx < item.value 
                                                                        ? 'text-yellow-400 fill-yellow-400' 
                                                                        : 'text-gray-300 dark:text-gray-600'
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="ml-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                                        {item.value}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {review.images && review.images.length > 0 && (
                                    <div className="mt-3 sm:mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {review.images.map((image, index) => (
                                            <div key={index} className="relative pt-[100%] bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                                                <img 
                                                    src={image.url || image} 
                                                    alt={`Фото #${index + 1}`}
                                                    className="absolute top-0 left-0 w-full h-full object-cover cursor-pointer"
                                                    onClick={() => {}}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

ReviewList.propTypes = {
    reviews: PropTypes.array,
    isLoading: PropTypes.bool,
    error: PropTypes.string,
    onDelete: PropTypes.func,
    currentUser: PropTypes.object,
    deletingReviewId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}; 