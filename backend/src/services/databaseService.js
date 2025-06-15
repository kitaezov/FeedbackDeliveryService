/**
 * Database Service
 * Handles database initialization and migrations
 */

const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

/**
 * Initialize user tables
 */
async function initializeUserTables() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(15) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('user', 'manager', 'moderator', 'admin', 'head_admin') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                total_likes INT DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        // Check if role column exists, add if it doesn't
        const [roleColumns] = await pool.query(`
            SHOW COLUMNS FROM users LIKE 'role'
        `);
        
        if (roleColumns.length === 0) {
            await pool.query(`
                ALTER TABLE users 
                ADD COLUMN role ENUM('user', 'manager', 'moderator', 'admin', 'head_admin') DEFAULT 'user'
            `);
        }

        // Get current role enum type
        const [roleTypeResult] = await pool.query(`
            SHOW COLUMNS FROM users WHERE Field = 'role'
        `);
        
        if (roleTypeResult.length > 0) {
            console.log('Current role enum type:', roleTypeResult[0].Type);
        }

        // Check if updated_at column exists
        const [updatedAtColumns] = await pool.query(`
            SHOW COLUMNS FROM users LIKE 'updated_at'
        `);

        if (updatedAtColumns.length === 0) {
            console.log('Добавление столбца updated_at в таблицу пользователей...');
            await pool.query(`
                ALTER TABLE users 
                ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            `);
            console.log('Столбец updated_at успешно добавлен');
        }

        console.log('Таблица пользователей создана или уже существует');
    } catch (error) {
        console.error('Error initializing user tables:', error);
        throw error;
    }
}

/**
 * Initialize restaurants table
 */
async function initializeRestaurantsTable() {
    try {
        // Сначала создаем базовую структуру таблицы
        await pool.query(`
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
                criteria JSON
            )
        `);

        // Проверяем наличие столбца slug
        const [slugColumn] = await pool.query(`
            SHOW COLUMNS FROM restaurants LIKE 'slug'
        `);

        // Если столбец slug не существует, добавляем его
        if (slugColumn.length === 0) {
            await pool.query(`
                ALTER TABLE restaurants 
                ADD COLUMN slug VARCHAR(100)
            `);
        }

        // Добавляем уникальные индексы
        try {
            await pool.query(`
                ALTER TABLE restaurants 
                ADD UNIQUE KEY restaurants_name_unique (name),
                ADD UNIQUE KEY restaurants_slug_unique (slug)
            `);
        } catch (error) {
            if (error.code !== 'ER_DUP_KEYNAME') {
                throw error;
            }
        }

        console.log('Таблица ресторанов создана или уже существует');
    } catch (error) {
        console.error('Error initializing restaurants table:', error);
        throw error;
    }
}

/**
 * Initialize reviews table
 */
async function initializeReviewsTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                restaurant_id INT,
                content TEXT NOT NULL,
                rating INT CHECK (rating >= 1 AND rating <= 5),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
            )
        `);
        console.log('Таблица отзывов создана или уже существует');
    } catch (error) {
        console.error('Error initializing reviews table:', error);
        throw error;
    }
}

/**
 * Initialize deleted reviews table
 */
async function initializeDeletedReviewsTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS deleted_reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                original_id INT,
                user_id INT,
                restaurant_id INT,
                content TEXT NOT NULL,
                rating INT,
                created_at TIMESTAMP,
                deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_by INT,
                deletion_reason TEXT,
                FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL,
                FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL
            )
        `);
        console.log('Таблица удаленных отзывов создана или уже существует');
    } catch (error) {
        console.error('Error initializing deleted reviews table:', error);
        throw error;
    }
}

/**
 * Initialize error report tables
 */
async function initializeErrorReportTables() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS error_reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                review_id INT,
                reporter_id INT,
                reason TEXT NOT NULL,
                status ENUM('pending', 'resolved', 'rejected') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolved_at TIMESTAMP,
                resolved_by INT,
                resolution_notes TEXT,
                FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
                FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL,
                FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
            )
        `);
        console.log('Таблица отчетов об ошибках создана или уже существует');
    } catch (error) {
        console.error('Error initializing error report tables:', error);
        throw error;
    }
}

/**
 * Run SQL migrations from files in a specific order
 */
async function runMigrations() {
    try {
        console.log('Запуск SQL миграций...');
        const migrationsDir = path.join(__dirname, '../db/migrations');
        
        if (fs.existsSync(migrationsDir)) {
            // Определяем порядок выполнения миграций
            const migrationOrder = [
                'users.sql',
                'add_profile_columns.sql',
                'fix_restaurants_table.sql',
                'restaurants.sql',
                'add_restaurant_columns.sql',
                'add_likes_columns.sql',
                'deleted_reviews.sql',
                'notifications.sql'
            ];
            
            for (const filename of migrationOrder) {
                const filePath = path.join(migrationsDir, filename);
                if (!fs.existsSync(filePath)) {
                    console.log(`Миграция ${filename} не найдена, пропускаем`);
                    continue;
                }

                console.log(`Применение миграции: ${filename}`);
                const sql = fs.readFileSync(filePath, 'utf8');
                const statements = sql.split(';').filter(statement => statement.trim() !== '');
                
                for (const statement of statements) {
                    if (statement.trim() === '') continue;
                    
                    try {
                        await pool.query(statement);
                    } catch (error) {
                        // Игнорируем ошибки о дублировании столбцов (код 1060)
                        if (error.errno === 1060) {
                            console.log(`Внимание: Столбец уже существует, пропускаем: ${error.message}`);
                        } else if (error.code === 'ER_DUP_KEYNAME') {
                            console.log(`Внимание: Индекс уже существует, пропускаем: ${error.message}`);
                        } else {
                            throw error;
                        }
                    }
                }
            }
            
            console.log('Миграции SQL выполнены успешно');
        } else {
            console.log('Директория миграций не найдена, пропуск');
        }
    } catch (error) {
        console.error('Ошибка выполнения SQL миграций:', error);
        throw error;
    }
}

/**
 * Initialize all database tables
 */
async function initializeDatabase() {
    try {
        console.log('Начало инициализации базы данных...');
        
        // Создаем таблицы в правильном порядке
        await initializeUserTables();
        await initializeRestaurantsTable();
        await initializeReviewsTable();
        await initializeDeletedReviewsTable();
        await initializeErrorReportTables();
        
        // Запускаем миграции после создания всех таблиц
        await runMigrations();
        
        console.log('Инициализация базы данных завершена успешно');
    } catch (error) {
        console.error('Критическая ошибка инициализации базы данных:', error);
        throw error;
    }
}

module.exports = {
    initializeDatabase
}; 