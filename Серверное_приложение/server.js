/**
 * FeedbackDeliveryService - Точка входа серверной части
 * 
 * Этот файл является основной точкой входа для серверного приложения.
 * Он выполняет следующие задачи:
 * - Загружает переменные окружения
 * - Инициализирует соединение с базой данных
 * - Проверяет наличие главного администратора
 * - Инициализирует таблицы для центра поддержки
 * - Запускает HTTP и WebSocket серверы
 */

// Загрузка переменных окружения из файла .env
require('dotenv').config();

// Импорт основных компонентов приложения
const { app, server } = require('./src/app');
const { initializeDatabase } = require('./src/services/databaseService');
const userModel = require('./src/models/userModel');
const setupSupportTables = require('./src/scripts/setup_support');
const setupManagerTables = require('./src/scripts/setup_manager');

// Инициализация базы данных перед запуском сервера
(async () => {
    try {
        // Инициализация структуры базы данных и соединений
        await initializeDatabase();
        
        // Инициализация таблиц для центра поддержки
        await setupSupportTables();
        
        // Инициализация таблиц для управления отзывами менеджерами
        await setupManagerTables();
        
        // Настройка порта для HTTP и WebSocket серверов
        const PORT = process.env.PORT || 5000;
        
        // Проверка существования и создание главного администратора системы
        await userModel.ensureHeadAdmin();
        
        // Создание демонстрационных пользователей, если база данных пуста
        await userModel.ensureDefaultUsers();
        
        // Запуск серверов после успешной инициализации базы данных
        server.listen(PORT, () => {
            console.log(`Сервер запущен на порту ${PORT}`);
            console.log(`WebSocket сервер доступен на ws://localhost:${PORT}`);
        });
    } catch (error) {
        // Обработка критических ошибок при запуске
        console.error('Ошибка запуска сервера:', error);
        process.exit(1); // Выход из процесса в случае критической ошибки
    }
})(); 