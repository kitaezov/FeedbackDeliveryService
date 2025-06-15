-- Добавляем столбец restaurant_id в таблицу reviews
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS restaurant_id INT;

-- Создаем временную таблицу для хранения соответствий имен ресторанов и их ID
CREATE TEMPORARY TABLE temp_restaurant_ids AS
SELECT id, name FROM restaurants;

-- Обновляем restaurant_id в таблице reviews
UPDATE reviews r
JOIN temp_restaurant_ids t ON r.restaurant_name = t.name
SET r.restaurant_id = t.id
WHERE r.restaurant_id IS NULL;

-- Добавляем внешний ключ
ALTER TABLE reviews
ADD CONSTRAINT fk_reviews_restaurant
FOREIGN KEY (restaurant_id) REFERENCES restaurants(id); 