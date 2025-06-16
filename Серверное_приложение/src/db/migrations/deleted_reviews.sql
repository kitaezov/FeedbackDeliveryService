-- Создание таблицы удаленных отзывов
CREATE TABLE IF NOT EXISTS deleted_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    user_id INT NOT NULL,
    restaurant_name VARCHAR(100) NOT NULL,
    rating DECIMAL(2, 1) NOT NULL,
    comment TEXT,
    date DATE,
    food_rating DECIMAL(2, 1),
    service_rating DECIMAL(2, 1),
    atmosphere_rating DECIMAL(2, 1),
    price_rating DECIMAL(2, 1),
    cleanliness_rating DECIMAL(2, 1),
    deleted_by INT NOT NULL,
    deletion_reason TEXT NOT NULL,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_name VARCHAR(100),
    admin_name VARCHAR(100),
    INDEX deleted_reviews_review_id_idx (review_id),
    INDEX deleted_reviews_user_id_idx (user_id),
    INDEX deleted_reviews_deleted_by_idx (deleted_by)
);

-- Комментарии к таблице в формате комментариев MySQL
-- Таблица: Удаленные отзывы с причинами удаления
-- Колонка id: Уникальный идентификатор записи
-- Колонка review_id: ID оригинального отзыва
-- Колонка user_id: ID пользователя, оставившего отзыв
-- Колонка restaurant_name: Название ресторана, к которому относился отзыв
-- Колонка rating: Общая оценка отзыва
-- Колонка comment: Текст отзыва
-- Колонка date: Дата публикации отзыва
-- Колонка food_rating: Оценка еды
-- Колонка service_rating: Оценка обслуживания
-- Колонка atmosphere_rating: Оценка атмосферы
-- Колонка price_rating: Оценка цены
-- Колонка cleanliness_rating: Оценка чистоты
-- Колонка deleted_by: ID администратора, удалившего отзыв
-- Колонка deletion_reason: Причина удаления отзыва
-- Колонка deleted_at: Дата и время удаления отзыва
-- Колонка user_name: Имя пользователя, оставившего отзыв
-- Колонка admin_name: Имя администратора, удалившего отзыв 