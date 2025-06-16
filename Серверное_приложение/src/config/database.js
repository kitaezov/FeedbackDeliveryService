/**
 * База данных конфигурация
 * Обрабатывает настройку пула подключений к MySQL
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Отладочная информация о подключении к базе данных
console.log('Информация о подключении к базе данных:');
console.log('Хост:', process.env.DB_HOST || 'localhost');
console.log('Пользователь:', process.env.DB_USER || 'root');
console.log('База данных:', process.env.DB_NAME || 'feedback');

// Создаем пул подключений
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123123',
    database: process.env.DB_NAME || 'feedback',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    debug: false,
    multipleStatements: true
});

// Тестирование подключения к базе данных
(async () => {
    try {
        console.log('Тестирование подключения к базе данных...');
        const connection = await pool.getConnection();
        console.log('Подключение к базе данных успешно!');
        
        // Проверяем существование базы данных без вывода в консоль
        const [databases] = await connection.query('SHOW DATABASES');
        
        // Проверяем существование таблиц без вывода в консоль
        const [tables] = await connection.query('SHOW TABLES');
        
        connection.release();
    } catch (error) {
        console.error('Ошибка подключения к базе данных:', error);
        // Пробуем создать базу данных, если она не существует
        try {
            const rootPool = mysql.createPool({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '123123',
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });
            
            await rootPool.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'feedback'}`);
            console.log('База данных создана успешно');
            
            // Переподключаемся к созданной базе данных
            const connection = await pool.getConnection();
            console.log('Повторное подключение успешно');
            connection.release();
        } catch (createError) {
            console.error('Ошибка создания базы данных:', createError);
        }
    }
})();

module.exports = pool; 