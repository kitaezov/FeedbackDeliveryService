-- Disable foreign key checks to avoid constraint issues
-- SET FOREIGN_KEY_CHECKS = 0;

-- Drop dependent tables first
-- DROP TABLE IF EXISTS deleted_reviews;
-- DROP TABLE IF EXISTS review_votes;
-- DROP TABLE IF EXISTS review_photos;
-- DROP TABLE IF EXISTS manager_responses;
-- DROP TABLE IF EXISTS error_reports;
-- DROP TABLE IF EXISTS reviews;

-- Drop and recreate the restaurants table with the correct structure
-- DROP TABLE IF EXISTS restaurants;

-- Create the restaurants table with all required columns
CREATE TABLE IF NOT EXISTS restaurants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category ENUM('italian', 'asian', 'russian', 'seafood', 'french', 'georgian', 'mexican', 'american') NOT NULL DEFAULT 'russian',
    cuisine_type VARCHAR(100),
    address VARCHAR(255),
    description TEXT,
    image_url VARCHAR(255),
    website VARCHAR(255),
    contact_phone VARCHAR(20),
    hours VARCHAR(100),
    price_range VARCHAR(10),
    min_price DECIMAL(10,2),
    delivery_time VARCHAR(20),
    rating DECIMAL(3,2) DEFAULT 0,
    criteria JSON,
    slug VARCHAR(255) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for better performance (проверка существования через условие)
-- MySQL не поддерживает синтаксис IF NOT EXISTS для индексов, поэтому используем условную логику

-- Проверяем существование индекса idx_restaurants_name
SET @index_exists_name = (SELECT COUNT(1) FROM INFORMATION_SCHEMA.STATISTICS 
                         WHERE table_schema = DATABASE() 
                         AND table_name = 'restaurants' 
                         AND index_name = 'idx_restaurants_name');
                         
SET @create_index_name = IF(@index_exists_name = 0, 
                         'CREATE INDEX idx_restaurants_name ON restaurants(name)', 
                         'SELECT 1');
PREPARE stmt_name FROM @create_index_name;
EXECUTE stmt_name;
DEALLOCATE PREPARE stmt_name;

-- Проверяем существование индекса idx_restaurants_category
SET @index_exists_category = (SELECT COUNT(1) FROM INFORMATION_SCHEMA.STATISTICS 
                             WHERE table_schema = DATABASE() 
                             AND table_name = 'restaurants' 
                             AND index_name = 'idx_restaurants_category');

-- Проверяем существование колонки category
SET @column_exists_category = (SELECT COUNT(1) FROM INFORMATION_SCHEMA.COLUMNS
                              WHERE table_schema = DATABASE()
                              AND table_name = 'restaurants'
                              AND column_name = 'category');
                             
SET @create_index_category = IF(@index_exists_category = 0 AND @column_exists_category > 0, 
                             'CREATE INDEX idx_restaurants_category ON restaurants(category)', 
                             'SELECT 1');
PREPARE stmt_category FROM @create_index_category;
EXECUTE stmt_category;
DEALLOCATE PREPARE stmt_category;

-- Проверяем существование индекса idx_restaurants_slug
SET @index_exists_slug = (SELECT COUNT(1) FROM INFORMATION_SCHEMA.STATISTICS 
                         WHERE table_schema = DATABASE() 
                         AND table_name = 'restaurants' 
                         AND index_name = 'idx_restaurants_slug');
                         
SET @create_index_slug = IF(@index_exists_slug = 0, 
                         'CREATE INDEX idx_restaurants_slug ON restaurants(slug)', 
                         'SELECT 1');
PREPARE stmt_slug FROM @create_index_slug;
EXECUTE stmt_slug;
DEALLOCATE PREPARE stmt_slug;

-- Add column comments
-- First, add any missing columns
SET @hours_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'restaurants' AND COLUMN_NAME = 'hours');
SET @cuisine_type_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'restaurants' AND COLUMN_NAME = 'cuisine_type');
SET @rating_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'restaurants' AND COLUMN_NAME = 'rating');
SET @deleted_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'restaurants' AND COLUMN_NAME = 'deleted');
SET @price_range_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'restaurants' AND COLUMN_NAME = 'price_range');
SET @min_price_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'restaurants' AND COLUMN_NAME = 'min_price');
SET @delivery_time_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'restaurants' AND COLUMN_NAME = 'delivery_time');
SET @category_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'restaurants' AND COLUMN_NAME = 'category');

-- Add missing columns if they don't exist
SET @add_hours = IF(@hours_exists = 0, 'ALTER TABLE restaurants ADD COLUMN hours VARCHAR(100)', 'SELECT 1');
SET @add_cuisine_type = IF(@cuisine_type_exists = 0, 'ALTER TABLE restaurants ADD COLUMN cuisine_type VARCHAR(100)', 'SELECT 1');
SET @add_rating = IF(@rating_exists = 0, 'ALTER TABLE restaurants ADD COLUMN rating DECIMAL(3,2) DEFAULT 0', 'SELECT 1');
SET @add_deleted = IF(@deleted_exists = 0, 'ALTER TABLE restaurants ADD COLUMN deleted BOOLEAN DEFAULT false', 'SELECT 1');
SET @add_price_range = IF(@price_range_exists = 0, 'ALTER TABLE restaurants ADD COLUMN price_range VARCHAR(10)', 'SELECT 1');
SET @add_min_price = IF(@min_price_exists = 0, 'ALTER TABLE restaurants ADD COLUMN min_price DECIMAL(10,2)', 'SELECT 1');
SET @add_delivery_time = IF(@delivery_time_exists = 0, 'ALTER TABLE restaurants ADD COLUMN delivery_time VARCHAR(20)', 'SELECT 1');
SET @add_category = IF(@category_exists = 0, "ALTER TABLE restaurants ADD COLUMN category ENUM('italian', 'asian', 'russian', 'seafood', 'french', 'georgian', 'mexican', 'american') NOT NULL DEFAULT 'russian'", 'SELECT 1');

PREPARE stmt_add_hours FROM @add_hours;
PREPARE stmt_add_cuisine_type FROM @add_cuisine_type;
PREPARE stmt_add_rating FROM @add_rating;
PREPARE stmt_add_deleted FROM @add_deleted;
PREPARE stmt_add_price_range FROM @add_price_range;
PREPARE stmt_add_min_price FROM @add_min_price;
PREPARE stmt_add_delivery_time FROM @add_delivery_time;
PREPARE stmt_add_category FROM @add_category;

EXECUTE stmt_add_hours;
EXECUTE stmt_add_cuisine_type;
EXECUTE stmt_add_rating;
EXECUTE stmt_add_deleted;
EXECUTE stmt_add_price_range;
EXECUTE stmt_add_min_price;
EXECUTE stmt_add_delivery_time;
EXECUTE stmt_add_category;

DEALLOCATE PREPARE stmt_add_hours;
DEALLOCATE PREPARE stmt_add_cuisine_type;
DEALLOCATE PREPARE stmt_add_rating;
DEALLOCATE PREPARE stmt_add_deleted;
DEALLOCATE PREPARE stmt_add_price_range;
DEALLOCATE PREPARE stmt_add_min_price;
DEALLOCATE PREPARE stmt_add_delivery_time;
DEALLOCATE PREPARE stmt_add_category;

-- Now proceed with the ALTER TABLE to add comments
ALTER TABLE restaurants
MODIFY COLUMN id INT AUTO_INCREMENT COMMENT 'Уникальный идентификатор ресторана',
MODIFY COLUMN name VARCHAR(100) NOT NULL COMMENT 'Название ресторана',
MODIFY COLUMN category ENUM('italian', 'asian', 'russian', 'seafood', 'french', 'georgian', 'mexican', 'american') NOT NULL DEFAULT 'russian' COMMENT 'Категория ресторана',
MODIFY COLUMN cuisine_type VARCHAR(100) COMMENT 'Тип кухни',
MODIFY COLUMN address VARCHAR(255) COMMENT 'Адрес ресторана',
MODIFY COLUMN description TEXT COMMENT 'Описание ресторана',
MODIFY COLUMN image_url VARCHAR(255) COMMENT 'URL изображения ресторана',
MODIFY COLUMN website VARCHAR(255) COMMENT 'Веб-сайт ресторана',
MODIFY COLUMN contact_phone VARCHAR(20) COMMENT 'Контактный телефон ресторана',
MODIFY COLUMN hours VARCHAR(100) COMMENT 'Часы работы',
MODIFY COLUMN price_range VARCHAR(10) COMMENT 'Ценовой диапазон',
MODIFY COLUMN min_price DECIMAL(10,2) COMMENT 'Минимальная цена',
MODIFY COLUMN delivery_time VARCHAR(20) COMMENT 'Время доставки',
MODIFY COLUMN rating DECIMAL(3,2) DEFAULT 0 COMMENT 'Рейтинг ресторана',
MODIFY COLUMN criteria JSON COMMENT 'Критерии оценки ресторана',
MODIFY COLUMN slug VARCHAR(255) COMMENT 'URL-дружественный идентификатор',
MODIFY COLUMN is_active BOOLEAN DEFAULT true COMMENT 'Активен ли ресторан',
MODIFY COLUMN deleted BOOLEAN DEFAULT false COMMENT 'Удален ли ресторан',
MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Дата создания',
MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Дата обновления';

-- Recreate the reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    restaurant_id INT,
    restaurant_name VARCHAR(100) NOT NULL,
    rating INT NOT NULL,
    comment TEXT NOT NULL,
    food_rating INT DEFAULT 0,
    service_rating INT DEFAULT 0,
    atmosphere_rating INT DEFAULT 0,
    price_rating INT DEFAULT 0,
    cleanliness_rating INT DEFAULT 0,
    likes INT DEFAULT 0,
    has_receipt BOOLEAN DEFAULT FALSE,
    receipt_photo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for the reviews table (проверка существования через условие)
-- Проверяем существование индекса idx_reviews_user_id
SET @index_exists_user = (SELECT COUNT(1) FROM INFORMATION_SCHEMA.STATISTICS 
                         WHERE table_schema = DATABASE() 
                         AND table_name = 'reviews' 
                         AND index_name = 'idx_reviews_user_id');
                         
SET @create_index_user = IF(@index_exists_user = 0, 
                         'CREATE INDEX idx_reviews_user_id ON reviews(user_id)', 
                         'SELECT 1');
PREPARE stmt_user FROM @create_index_user;
EXECUTE stmt_user;
DEALLOCATE PREPARE stmt_user;

-- Проверяем существование индекса idx_reviews_restaurant_id
SET @index_exists_rest = (SELECT COUNT(1) FROM INFORMATION_SCHEMA.STATISTICS 
                         WHERE table_schema = DATABASE() 
                         AND table_name = 'reviews' 
                         AND index_name = 'idx_reviews_restaurant_id');
                         
SET @create_index_rest = IF(@index_exists_rest = 0, 
                         'CREATE INDEX idx_reviews_restaurant_id ON reviews(restaurant_id)', 
                         'SELECT 1');
PREPARE stmt_rest FROM @create_index_rest;
EXECUTE stmt_rest;
DEALLOCATE PREPARE stmt_rest;

-- Проверяем существование индекса idx_reviews_restaurant_name
SET @index_exists_rest_name = (SELECT COUNT(1) FROM INFORMATION_SCHEMA.STATISTICS 
                              WHERE table_schema = DATABASE() 
                              AND table_name = 'reviews' 
                              AND index_name = 'idx_reviews_restaurant_name');
                              
SET @create_index_rest_name = IF(@index_exists_rest_name = 0, 
                              'CREATE INDEX idx_reviews_restaurant_name ON reviews(restaurant_name)', 
                              'SELECT 1');
PREPARE stmt_rest_name FROM @create_index_rest_name;
EXECUTE stmt_rest_name;
DEALLOCATE PREPARE stmt_rest_name;

-- Insert sample restaurants
INSERT IGNORE INTO restaurants (name, category, cuisine_type, address, description, image_url, rating, slug, is_active)
VALUES 
    ('Итальянский дворик', 'italian', 'Итальянская кухня', 'ул. Гастрономическая, 12', 'Уютный ресторан итальянской кухни с аутентичными рецептами', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4', 4.8, 'italyanskiy-dvorik', true),
    ('Азиатский бриз', 'asian', 'Азиатская кухня', 'пр. Кулинаров, 45', 'Ресторан паназиатской кухни с широким выбором суши и вок', 'https://images.unsplash.com/photo-1552566626-52f8b828add9', 4.7, 'aziatskiy-briz', true),
    ('У Михалыча', 'russian', 'Русская кухня', 'ул. Домашняя, 8', 'Традиционная русская кухня в домашней атмосфере', 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d', 4.9, 'u-mihalycha', true),
    ('Морской причал', 'seafood', 'Морепродукты', 'наб. Речная, 15', 'Ресторан морепродуктов с видом на реку', 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62', 4.4, 'morskoy-prichal', true),
    ('Французская лавка', 'french', 'Французская кухня', 'ул. Парижская, 23', 'Изысканная французская кухня и богатая винная карта', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0', 4.6, 'francuzskaya-lavka', true),
    ('Грузинский дворик', 'georgian', 'Грузинская кухня', 'пр. Руставели, 7', 'Аутентичная грузинская кухня и гостеприимная атмосфера', 'https://images.unsplash.com/photo-1559058789-672da06263d8', 4.7, 'gruzinskiy-dvorik', true),
    ('Мексиканский уголок', 'mexican', 'Мексиканская кухня', 'ул. Острая, 16', 'Острые блюда мексиканской кухни и текила', 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b', 4.5, 'meksikanskiy-ugolok', true),
    ('Американский бургер', 'american', 'Американская кухня', 'пр. Свободы, 28', 'Сочные бургеры и настоящая американская атмосфера', 'https://images.unsplash.com/photo-1550547660-d9450f859349', 4.6, 'amerikanskiy-burger', true)
ON DUPLICATE KEY UPDATE
    category = VALUES(category),
    cuisine_type = VALUES(cuisine_type),
    address = VALUES(address),
    description = VALUES(description),
    image_url = VALUES(image_url),
    rating = VALUES(rating),
    is_active = VALUES(is_active);

-- Re-enable foreign key checks
-- SET FOREIGN_KEY_CHECKS = 1; 