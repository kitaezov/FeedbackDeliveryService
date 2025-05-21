/**
 * База данных конфигурация
 * Обрабатывает настройку пула подключений к MySQL
 */

    const mysql = require('mysql2/promise');
    require('dotenv').config();

    // Отладочная информация о подключении к базе данных
    if (process.env.DEBUG === 'true') {
        console.log('Информация о подключении к базе данных:');
        console.log('Хост:', process.env.DB_HOST || 'localhost');
        console.log('Пользователь:', process.env.DB_USER || 'root');
        console.log('База данных:', process.env.DB_NAME || 'feedback');
    }

    // Создаем пул подключений
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '123123',
        database: process.env.DB_NAME || 'feedback',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    // Тестирование подключения к базе данных
    (async () => {
        try {
            if (process.env.DEBUG === 'true') {
                console.log('Тестирование подключения к базе данных...');
                const connection = await pool.getConnection();
                console.log('Подключение к базе данных успешно!');
                connection.release();
            }
        } catch (error) {
            console.error('Ошибка подключения к базе данных:', error);
        }
    })();

    module.exports = pool; 