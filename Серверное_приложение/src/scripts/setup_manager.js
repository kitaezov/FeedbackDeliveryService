/**
 * Setup Manager Tables
 * 
 * This script creates the necessary database tables for manager functionality:
 * - manager_responses: for storing manager responses to user reviews
 * - manager_analytics: for storing analytics data
 */

const pool = require('../config/database');

async function setupManagerTables() {
    try {
        console.log('Setting up manager tables...');
        
        // Создаем таблицу manager_responses, если она не существует
        await pool.query(`
            CREATE TABLE IF NOT EXISTS manager_responses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                review_id INT NOT NULL,
                manager_id INT NOT NULL,
                response_text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
                FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_review (review_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // Проверяем и добавляем столбцы в таблицу reviews
        const [reviewColumns] = await pool.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'reviews' 
            AND TABLE_SCHEMA = DATABASE()
        `);
        
        const reviewColumnNames = reviewColumns.map(col => col.COLUMN_NAME);
        
        if (!reviewColumnNames.includes('deleted')) {
            await pool.query(`ALTER TABLE reviews ADD COLUMN deleted BOOLEAN DEFAULT FALSE`);
        }
        
        if (!reviewColumnNames.includes('type')) {
            await pool.query(`
                ALTER TABLE reviews 
                ADD COLUMN type ENUM('inRestaurant', 'delivery') DEFAULT 'inRestaurant'
            `);
        }

        // Проверяем и добавляем столбцы в таблицу restaurants
        const [restaurantColumns] = await pool.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'restaurants' 
            AND TABLE_SCHEMA = DATABASE()
        `);
        
        const restaurantColumnNames = restaurantColumns.map(col => col.COLUMN_NAME);
        
        if (!restaurantColumnNames.includes('deleted')) {
            await pool.query(`ALTER TABLE restaurants ADD COLUMN deleted BOOLEAN DEFAULT FALSE`);
        }
        
        if (!restaurantColumnNames.includes('image_url')) {
            await pool.query(`ALTER TABLE restaurants ADD COLUMN image_url VARCHAR(255)`);
        }

        // Проверяем и добавляем столбцы в таблицу users
        const [userColumns] = await pool.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'users' 
            AND TABLE_SCHEMA = DATABASE()
        `);
        
        const userColumnNames = userColumns.map(col => col.COLUMN_NAME);
        
        if (!userColumnNames.includes('is_active')) {
            await pool.query(`ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE`);
        }
        
        console.log('Менеджерские таблицы успешно установлены');
        return true;
    } catch (error) {
        console.error('Ошибка установки менеджерских таблиц:', error);
        throw error;
    }
}

module.exports = setupManagerTables; 