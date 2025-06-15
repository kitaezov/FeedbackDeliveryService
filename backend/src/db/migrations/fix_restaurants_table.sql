-- Disable foreign key checks to avoid constraint issues
SET FOREIGN_KEY_CHECKS = 0;

-- Drop dependent tables first
DROP TABLE IF EXISTS deleted_reviews;
DROP TABLE IF EXISTS review_votes;
DROP TABLE IF EXISTS review_photos;
DROP TABLE IF EXISTS manager_responses;
DROP TABLE IF EXISTS error_reports;
DROP TABLE IF EXISTS reviews;

-- Drop and recreate the restaurants table with the correct structure
DROP TABLE IF EXISTS restaurants;

-- Create the restaurants table with all required columns
CREATE TABLE restaurants (
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

-- Add indexes for better performance
CREATE INDEX idx_restaurants_name ON restaurants(name);
CREATE INDEX idx_restaurants_category ON restaurants(category);
CREATE INDEX idx_restaurants_slug ON restaurants(slug);

-- Add column comments
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
CREATE TABLE reviews (
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

-- Create indexes for the reviews table
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX idx_reviews_restaurant_name ON reviews(restaurant_name);

-- Insert sample restaurants
INSERT INTO restaurants (name, category, cuisine_type, address, description, image_url, rating, slug, is_active)
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
SET FOREIGN_KEY_CHECKS = 1; 