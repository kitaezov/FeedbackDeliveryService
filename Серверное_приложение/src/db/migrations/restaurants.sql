-- Создание базовой таблицы ресторанов
CREATE TABLE IF NOT EXISTS restaurants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    description TEXT,
    image_url VARCHAR(255),
    website VARCHAR(255),
    contact_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='Рестораны в системе';

-- Добавляем все необходимые колонки
SET @exist_is_active := (SELECT COUNT(1) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'restaurants' AND column_name = 'is_active' AND table_schema = DATABASE());
SET @exist_criteria := (SELECT COUNT(1) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'restaurants' AND column_name = 'criteria' AND table_schema = DATABASE());
SET @exist_slug := (SELECT COUNT(1) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'restaurants' AND column_name = 'slug' AND table_schema = DATABASE());

SET @add_is_active := IF(@exist_is_active = 0, 'ALTER TABLE restaurants ADD COLUMN is_active BOOLEAN DEFAULT TRUE', 'SELECT 1');
SET @add_criteria := IF(@exist_criteria = 0, 'ALTER TABLE restaurants ADD COLUMN criteria JSON', 'SELECT 1');
SET @add_slug := IF(@exist_slug = 0, 'ALTER TABLE restaurants ADD COLUMN slug VARCHAR(100)', 'SELECT 1');

PREPARE stmt_is_active FROM @add_is_active;
PREPARE stmt_criteria FROM @add_criteria;
PREPARE stmt_slug FROM @add_slug;

EXECUTE stmt_is_active;
EXECUTE stmt_criteria;
EXECUTE stmt_slug;

DEALLOCATE PREPARE stmt_is_active;
DEALLOCATE PREPARE stmt_criteria;
DEALLOCATE PREPARE stmt_slug;

-- Добавляем индексы (с проверкой существования)
SET @exist_name_idx := (SELECT COUNT(1) FROM INFORMATION_SCHEMA.STATISTICS WHERE table_name = 'restaurants' AND index_name = 'restaurants_name_idx' AND table_schema = DATABASE());
SET @exist_slug_idx := (SELECT COUNT(1) FROM INFORMATION_SCHEMA.STATISTICS WHERE table_name = 'restaurants' AND index_name = 'restaurants_slug_idx' AND table_schema = DATABASE());

SET @create_name_idx := IF(@exist_name_idx = 0, 'CREATE INDEX restaurants_name_idx ON restaurants(name)', 'SELECT 1');
SET @create_slug_idx := IF(@exist_slug_idx = 0, 'CREATE INDEX restaurants_slug_idx ON restaurants(slug)', 'SELECT 1');

PREPARE stmt_name_idx FROM @create_name_idx;
PREPARE stmt_slug_idx FROM @create_slug_idx;

EXECUTE stmt_name_idx;
EXECUTE stmt_slug_idx;

DEALLOCATE PREPARE stmt_name_idx;
DEALLOCATE PREPARE stmt_slug_idx;

-- Добавляем уникальные ограничения
ALTER TABLE restaurants
ADD CONSTRAINT restaurants_name_unique UNIQUE (name),
ADD CONSTRAINT restaurants_slug_unique UNIQUE (slug);

-- Добавляем комментарии к столбцам
ALTER TABLE restaurants
MODIFY COLUMN id INT AUTO_INCREMENT COMMENT 'Уникальный идентификатор ресторана',
MODIFY COLUMN name VARCHAR(100) NOT NULL COMMENT 'Название ресторана',
MODIFY COLUMN address VARCHAR(255) COMMENT 'Адрес ресторана',
MODIFY COLUMN description TEXT COMMENT 'Описание ресторана',
MODIFY COLUMN image_url VARCHAR(255) COMMENT 'URL изображения ресторана',
MODIFY COLUMN website VARCHAR(255) COMMENT 'Веб-сайт ресторана',
MODIFY COLUMN contact_phone VARCHAR(20) COMMENT 'Контактный телефон ресторана',
MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Дата и время создания записи',
MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Дата и время последнего обновления записи',
MODIFY COLUMN is_active BOOLEAN DEFAULT TRUE COMMENT 'Активен ли ресторан',
MODIFY COLUMN criteria JSON COMMENT 'JSON с критериями оценки ресторана',
MODIFY COLUMN slug VARCHAR(100) COMMENT 'URL-дружественный идентификатор для страницы ресторана';

-- Проверяем, существует ли столбец restaurant_id в таблице reviews
SET @exist_col := (SELECT COUNT(1) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'reviews' AND column_name = 'restaurant_id' AND table_schema = DATABASE());
SET @sqlstmt_col := IF(@exist_col = 0, 'ALTER TABLE reviews ADD COLUMN restaurant_id INT', 'SELECT 1');
PREPARE stmt_col FROM @sqlstmt_col;
EXECUTE stmt_col;
DEALLOCATE PREPARE stmt_col;

-- Проверяем, существует ли ограничение внешнего ключа для restaurant_id
SET @exist_fk := (SELECT COUNT(1) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE table_name = 'reviews' AND constraint_name = 'fk_reviews_restaurants' AND table_schema = DATABASE());
SET @sqlstmt_fk := IF(@exist_fk = 0, 'ALTER TABLE reviews ADD CONSTRAINT fk_reviews_restaurants FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL', 'SELECT 1');
PREPARE stmt_fk FROM @sqlstmt_fk;
EXECUTE stmt_fk;
DEALLOCATE PREPARE stmt_fk; 