import React from 'react';
import PropTypes from 'prop-types';
import { Star, ThumbsUp } from 'lucide-react';

/**
 * Компонент карточки отзыва для отображения информации о ресторане
 * @component
 * @param {Object} props - Свойства компонента
 * @param {Object} props.review - Объект с данными отзыва
 * @param {string} props.review.id - Уникальный идентификатор отзыва
 * @param {string} props.review.userName - Имя пользователя
 * @param {string} props.review.avatar - URL аватара пользователя
 * @param {string} props.review.date - Дата отзыва
 * @param {number} props.review.rating - Рейтинг (от 0 до 5)
 * @param {string} props.review.comment - Текст комментария
 * @param {number} props.review.likes - Количество лайков
 * @param {string} props.review.restaurantName - Название ресторана
 */
const ReviewCard = ({ review }) => {
    try {
        // Функция для генерации звёзд рейтинга
        const renderStars = () => {
            try {
                return [...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`h-4 w-4 ${
                            i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                        data-testid={`star-${i}`}
                    />
                ));
            } catch (error) {
                console.error('Ошибка при рендеринге звезд:', error);
                return null;
            }
        };

        // Обработчик ошибок загрузки изображения
        const handleImageError = (e) => {
            try {
                e.currentTarget.src = '/default-avatar.png';
                console.warn('Ошибка загрузки изображения. Установлено изображение по умолчанию.');
            } catch (error) {
                console.error('Ошибка при обработке ошибки загрузки изображения:', error);
            }
        };

        return (
            <div
                className="p-4 border-b dark:border-gray-700 transform transition-all duration-200 dark:hover:bg-gray-750"
                data-testid="review-card"
            >
                <div className="flex items-start space-x-4">
                    <img
                        src={review.avatar}
                        alt={`${review.userName}'s avatar`}
                        className="w-10 h-10 rounded-full shadow-md"
                        onError={handleImageError}
                        data-testid="avatar-image"
                    />
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{review.userName}</h3>
                            <span className="text-sm text-gray-500">{review.date}</span>
                        </div>

                        <div className="flex items-center space-x-1 my-1" data-testid="rating-stars">
                            {renderStars()}
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {review.comment}
                        </p>

                        <div className="flex items-center space-x-4 mt-2">
                            <button
                                className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
                                data-testid="like-button"
                            >
                                <ThumbsUp className="h-4 w-4" />
                                <span>{review.likes}</span>
                            </button>
                            <span className="text-gray-500 italic">
                                {review.restaurantName}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('Ошибка при рендеринге ReviewCard:', error);
        return null;
    }
};

ReviewCard.propTypes = {
    review: PropTypes.shape({
        id: PropTypes.string.isRequired,
        userName: PropTypes.string.isRequired,
        avatar: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        rating: PropTypes.number.isRequired,
        comment: PropTypes.string.isRequired,
        likes: PropTypes.number.isRequired,
        restaurantName: PropTypes.string.isRequired
    }).isRequired
};

export { ReviewCard };