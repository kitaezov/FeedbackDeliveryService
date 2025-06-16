const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function fixRestaurantsTable() {
    try {
        console.log('Starting restaurants table fix...');

        // Читаем SQL файл
        const sqlPath = path.join(__dirname, '../db/migrations/fix_restaurants_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Разделяем SQL на отдельные команды
        const commands = sql.split(';').filter(cmd => cmd.trim());

        // Выполняем каждую команду
        for (const command of commands) {
            if (command.trim()) {
                try {
                    await pool.execute(command);
                    console.log('Команда выполнена успешно:', command.trim().split('\n')[0]);
                } catch (error) {
                    console.error('Ошибка выполнения команды:', error.message);
                    console.error('Command:', command.trim());
                    throw error;
                }
            }
        }

        console.log('Исправление таблицы restaurants завершено успешно!');
        process.exit(0);
    } catch (error) {
        console.error('Ошибка исправления таблицы restaurants:', error);
        process.exit(1);
    }
}

// Запускаем скрипт
fixRestaurantsTable(); 