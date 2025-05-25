-- Отключаем проверку внешних ключей
SET FOREIGN_KEY_CHECKS = 0;

-- Удаляем таблицы в обратном порядке их создания
DROP TABLE IF EXISTS error_reports;
DROP TABLE IF EXISTS deleted_reviews;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS restaurants;
DROP TABLE IF EXISTS users;

-- Включаем проверку внешних ключей
SET FOREIGN_KEY_CHECKS = 1; 