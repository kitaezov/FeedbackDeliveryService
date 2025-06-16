/**
 * Migration script to add restaurant_id to users table
 */

require('dotenv').config();
const pool = require('../config/database');

async function addRestaurantToUsers() {
    try {
        console.log('Starting migration: Adding restaurant_id to users table...');

        // Проверяем, существует ли столбец restaurant_id
        const [columns] = await pool.query(`
            SHOW COLUMNS FROM users LIKE 'restaurant_id'
        `);

        if (columns.length === 0) {
            // Добавляем столбец restaurant_id
            await pool.query(`
                ALTER TABLE users 
                ADD COLUMN restaurant_id INT,
                ADD FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL
            `);

            console.log('Добавлен столбец restaurant_id в таблицу users');
        } else {
            console.log('Столбец restaurant_id уже существует');
        }

        // Сбрасываем restaurant_id для не менеджеров
        await pool.query(`
            UPDATE users 
            SET restaurant_id = NULL 
            WHERE role != 'manager'
        `);

        console.log('Сброс restaurant_id для не менеджеров');
        console.log('Миграция завершена успешно!');
        process.exit(0);
    } catch (error) {
        console.error('Ошибка во время миграции:', error);
        process.exit(1);
    }
}

addRestaurantToUsers(); 