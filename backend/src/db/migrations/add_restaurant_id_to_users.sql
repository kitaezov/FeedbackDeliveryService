-- Добавление столбца restaurant_id в таблицу пользователей для менеджеров ресторанов

-- Проверяем, существует ли столбец restaurant_id
SET @column_exists = (
    SELECT COUNT(1) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() 
    AND table_name = 'users' 
    AND column_name = 'restaurant_id'
);

-- Если столбец не существует, добавляем его
SET @add_column_sql = IF(@column_exists = 0, 
    'ALTER TABLE users ADD COLUMN restaurant_id INT NULL, ADD INDEX idx_restaurant_id (restaurant_id)',
    'SELECT "Column restaurant_id already exists in users table"');

PREPARE stmt FROM @add_column_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Добавляем внешний ключ, если он еще не существует
SET @fk_exists = (
    SELECT COUNT(1) 
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE table_schema = DATABASE() 
    AND table_name = 'users' 
    AND constraint_name = 'fk_users_restaurant_id'
);

SET @add_fk_sql = IF(@fk_exists = 0,
    'ALTER TABLE users ADD CONSTRAINT fk_users_restaurant_id FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL',
    'SELECT "Foreign key fk_users_restaurant_id already exists"');

PREPARE stmt FROM @add_fk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt; 