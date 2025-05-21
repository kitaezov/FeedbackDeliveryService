-- Создание таблицы ресторанов
CREATE TABLE IF NOT EXISTS restaurants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    description TEXT,
    image_url VARCHAR(255),
    website VARCHAR(255),
    contact_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    criteria JSON,
    slug VARCHAR(100) NOT NULL
) COMMENT='Рестораны в системе';

-- Индекс для поиска ресторанов по названию
SET @exist_name_idx := (SELECT COUNT(1) FROM INFORMATION_SCHEMA.STATISTICS WHERE table_name = 'restaurants' AND index_name = 'restaurants_name_idx' AND table_schema = DATABASE());
SET @sqlstmt_name := IF(@exist_name_idx = 0, 'CREATE INDEX restaurants_name_idx ON restaurants(name)', 'SELECT 1');
PREPARE stmt_name FROM @sqlstmt_name;
EXECUTE stmt_name;
DEALLOCATE PREPARE stmt_name;

-- Индекс для поиска ресторанов по слагу
SET @exist_slug_idx := (SELECT COUNT(1) FROM INFORMATION_SCHEMA.STATISTICS WHERE table_name = 'restaurants' AND index_name = 'restaurants_slug_idx' AND table_schema = DATABASE());
SET @sqlstmt_slug := IF(@exist_slug_idx = 0, 'CREATE INDEX restaurants_slug_idx ON restaurants(slug)', 'SELECT 1');
PREPARE stmt_slug FROM @sqlstmt_slug;
EXECUTE stmt_slug;
DEALLOCATE PREPARE stmt_slug;

-- Добавление комментариев к столбцам
ALTER TABLE restaurants MODIFY COLUMN id INT AUTO_INCREMENT COMMENT 'Уникальный идентификатор ресторана';
ALTER TABLE restaurants MODIFY COLUMN name VARCHAR(100) NOT NULL COMMENT 'Название ресторана';
ALTER TABLE restaurants MODIFY COLUMN address VARCHAR(255) COMMENT 'Адрес ресторана';
ALTER TABLE restaurants MODIFY COLUMN description TEXT COMMENT 'Описание ресторана';
ALTER TABLE restaurants MODIFY COLUMN image_url VARCHAR(255) COMMENT 'URL изображения ресторана';
ALTER TABLE restaurants MODIFY COLUMN website VARCHAR(255) COMMENT 'Веб-сайт ресторана';
ALTER TABLE restaurants MODIFY COLUMN contact_phone VARCHAR(20) COMMENT 'Контактный телефон ресторана';
ALTER TABLE restaurants MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Дата и время создания записи';
ALTER TABLE restaurants MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Дата и время последнего обновления записи';
ALTER TABLE restaurants MODIFY COLUMN is_active BOOLEAN DEFAULT TRUE COMMENT 'Активен ли ресторан';
ALTER TABLE restaurants MODIFY COLUMN criteria JSON COMMENT 'JSON с критериями оценки ресторана';
ALTER TABLE restaurants MODIFY COLUMN slug VARCHAR(100) NOT NULL COMMENT 'URL-дружественный идентификатор для страницы ресторана';

-- Добавление уникального ограничения на имя ресторана
SET @exist_name_unq := (SELECT COUNT(1) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE table_name = 'restaurants' AND constraint_name = 'restaurants_name_unique' AND table_schema = DATABASE());
SET @sqlstmt_name_unq := IF(@exist_name_unq = 0, 'ALTER TABLE restaurants ADD CONSTRAINT restaurants_name_unique UNIQUE (name)', 'SELECT 1');
PREPARE stmt_name_unq FROM @sqlstmt_name_unq;
EXECUTE stmt_name_unq;
DEALLOCATE PREPARE stmt_name_unq;

-- Добавление уникального ограничения на slug ресторана
SET @exist_slug_unq := (SELECT COUNT(1) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE table_name = 'restaurants' AND constraint_name = 'restaurants_slug_unique' AND table_schema = DATABASE());
SET @sqlstmt_slug_unq := IF(@exist_slug_unq = 0, 'ALTER TABLE restaurants ADD CONSTRAINT restaurants_slug_unique UNIQUE (slug)', 'SELECT 1');
PREPARE stmt_slug_unq FROM @sqlstmt_slug_unq;
EXECUTE stmt_slug_unq;
DEALLOCATE PREPARE stmt_slug_unq;

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