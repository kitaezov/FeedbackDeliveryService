-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'manager', 'admin', 'head_admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_blocked TINYINT(1) DEFAULT 0,
    blocked_reason VARCHAR(255) DEFAULT NULL
);

-- Добавление колонки is_blocked, если её еще нет
SELECT COUNT(*) INTO @exist FROM information_schema.columns 
WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'is_blocked';

SET @query = IF(@exist = 0, 
    'ALTER TABLE users ADD COLUMN is_blocked TINYINT(1) DEFAULT 0', 
    'SELECT "Column is_blocked already exists" as message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Добавление колонки blocked_reason, если её еще нет
SELECT COUNT(*) INTO @exist FROM information_schema.columns 
WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'blocked_reason';

SET @query = IF(@exist = 0, 
    'ALTER TABLE users ADD COLUMN blocked_reason VARCHAR(255) DEFAULT NULL', 
    'SELECT "Column blocked_reason already exists" as message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Make sure the role values are correct for existing users
-- This will convert any invalid roles to 'user'
UPDATE users 
SET role = 'user' 
WHERE role NOT IN ('user', 'manager', 'admin', 'head_admin');

-- Ensure there is at least one head_admin account (admin@yandex.ru)
INSERT INTO users (name, email, password, role)
SELECT 'Head Admin', 'admin@yandex.ru', '$2a$10$aBcDeFgHiJkLmNoPqRsTuVwXyZ', 'head_admin'
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@yandex.ru');

-- Make sure admin@yandex.ru is always a head_admin
UPDATE users 
SET role = 'head_admin' 
WHERE email = 'admin@yandex.ru' AND role != 'head_admin'; 