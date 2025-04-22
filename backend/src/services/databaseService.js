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
                role ENUM('user', 'moderator', 'admin', 'head_admin') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                total_likes INT DEFAULT 0
            )
        `);
        
        // Check if role column exists, add if it doesn't
        const [roleColumns] = await pool.query(`
            SHOW COLUMNS FROM users LIKE 'role'
        `);
        
        if (roleColumns.length === 0) {
            console.log('Добавление столбца role в таблицу пользователей...');
            await pool.query(`
                ALTER TABLE users 
                ADD COLUMN role ENUM('user', 'moderator', 'admin', 'head_admin') DEFAULT 'user'
            `);
            console.log('Столбец role успешно добавлен');
        } else {
            // Make sure the role column includes 'head_admin'
            const [roleEnum] = await pool.query(`
                SHOW COLUMNS FROM users WHERE Field = 'role'
            `);
            
            if (!roleEnum[0].Type.includes('head_admin')) {
                console.log('Обновление перечисления role для добавления head_admin...');
                await pool.query(`
                    ALTER TABLE users 
                    MODIFY COLUMN role ENUM('user', 'moderator', 'admin', 'head_admin') DEFAULT 'user'
                `);
                console.log('Перечисление role успешно обновлено');
            }
        }

        // Check if total_likes column exists, add if it doesn't
        const [likesColumns] = await pool.query(`
            SHOW COLUMNS FROM users LIKE 'total_likes'
        `);
        
        if (likesColumns.length === 0) {
            console.log('Добавление столбца total_likes в таблицу пользователей...');
            await pool.query(`
                ALTER TABLE users 
                ADD COLUMN total_likes INT DEFAULT 0
            `);
            console.log('Столбец total_likes успешно добавлен');
        }
        
        // Check if updated_at column exists, add if it doesn't
        const [updatedAtColumns] = await pool.query(`
            SHOW COLUMNS FROM users LIKE 'updated_at'
        `);
        
        if (updatedAtColumns.length === 0) {
            console.log('Добавление столбца updated_at в таблицу пользователей...');
            await pool.query(`
                ALTER TABLE users 
                ADD COLUMN updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
            `);
            console.log('Столбец updated_at успешно добавлен');
        }
        
        console.log('Таблица пользователей создана или уже существует');
    } catch (error) {
        console.error('Ошибка инициализации таблицы пользователей:', error);
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
                user_id INT NOT NULL,
                restaurant_name VARCHAR(100) NOT NULL,
                rating DECIMAL(2,1) NOT NULL,
                comment TEXT NOT NULL,
                date DATE NOT NULL,
                food_rating DECIMAL(2,1) DEFAULT 0,
                service_rating DECIMAL(2,1) DEFAULT 0,
                atmosphere_rating DECIMAL(2,1) DEFAULT 0,
                price_rating DECIMAL(2,1) DEFAULT 0,
                cleanliness_rating DECIMAL(2,1) DEFAULT 0,
                likes INT DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        
        // Check if likes column exists, add if it doesn't
        const [columns] = await pool.query(`
            SHOW COLUMNS FROM reviews LIKE 'likes'
        `);
        
        if (columns.length === 0) {
            console.log('Добавление столбца likes в таблицу отзывов...');
            await pool.query(`
                ALTER TABLE reviews 
                ADD COLUMN likes INT DEFAULT 0
            `);
            console.log('Столбец likes успешно добавлен');
        }
        
        console.log('Таблица отзывов создана или уже существует');
    } catch (error) {
        console.error('Ошибка инициализации таблицы отзывов:', error);
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
                review_id INT NOT NULL,
                user_id INT NOT NULL,
                restaurant_name VARCHAR(100) NOT NULL,
                rating DECIMAL(2,1) NOT NULL,
                comment TEXT,
                date DATE,
                food_rating DECIMAL(2,1),
                service_rating DECIMAL(2,1),
                atmosphere_rating DECIMAL(2,1),
                price_rating DECIMAL(2,1),
                cleanliness_rating DECIMAL(2,1),
                deleted_by INT NOT NULL,
                deletion_reason TEXT NOT NULL,
                deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                user_name VARCHAR(100),
                admin_name VARCHAR(100),
                INDEX (review_id),
                INDEX (user_id),
                INDEX (deleted_by)
            )
        `);
        
        console.log('Таблица удаленных отзывов создана или уже существует');
    } catch (error) {
        console.error('Ошибка инициализации таблицы удаленных отзывов:', error);
        throw error;
    }
}

/**
 * Initialize error reports table
 */
async function initializeErrorReportTables() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS error_reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                review_id INT NOT NULL,
                reason ENUM('spam', 'offensive', 'irrelevant', 'other') NOT NULL,
                description TEXT,
                status ENUM('pending', 'resolved', 'rejected') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
            )
        `);
        
        console.log('Таблица отчетов об ошибках создана или уже существует');
    } catch (error) {
        console.error('Ошибка инициализации таблицы отчетов об ошибках:', error);
        throw error;
    }
}

/**
 * Initialize restaurants table
 */
async function initializeRestaurantsTable() {
    try {
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
                criteria JSON,
                slug VARCHAR(100)
            )
        `);
        
        console.log('Таблица ресторанов создана или уже существует');
    } catch (error) {
        console.error('Ошибка инициализации таблицы ресторанов:', error);
        throw error;
    }
}

/**
 * Run SQL migrations from files
 */
async function runMigrations() {
    try {
        console.log('Запуск SQL миграций...');
        const migrationsDir = path.join(__dirname, '../db/migrations');
        
        if (fs.existsSync(migrationsDir)) {
            const files = fs.readdirSync(migrationsDir);
            const sqlFiles = files.filter(file => file.endsWith('.sql'));
            
            for (const file of sqlFiles) {
                console.log(`Применение миграции: ${file}`);
                const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
                const statements = sql.split(';').filter(statement => statement.trim() !== '');
                
                for (const statement of statements) {
                    if (statement.trim() === '') continue;
                    
                    try {
                        await pool.query(statement);
                    } catch (error) {
                        // Игнорируем ошибки о дублировании столбцов (код 1060)
                        if (error.errno === 1060) {
                            console.log(`Внимание: Столбец уже существует, пропускаем: ${error.message}`);
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
        
        await initializeUserTables();
        await initializeReviewsTable();
        await initializeDeletedReviewsTable();
        await initializeErrorReportTables();
        await initializeRestaurantsTable();
        await runMigrations();
        
        console.log('Инициализация базы данных завершена успешно');
    } catch (error) {
        console.error('Критическая ошибка инициализации базы данных:', error);
        process.exit(1);
    }
}

module.exports = {
    initializeDatabase
}; 