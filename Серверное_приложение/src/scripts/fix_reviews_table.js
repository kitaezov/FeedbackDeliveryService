/**
 * Fix Reviews Table Script
 * This script recreates the reviews table with the correct structure
 */

const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function fixReviewsTable() {
    try {
        console.log('Fixing reviews table structure...');
        
        // Читаем SQL файл миграции
        const migrationPath = path.join(__dirname, '../db/migrations/fix_reviews_table.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');
        
        // Разделяем SQL файл на отдельные операторы
        const statements = migrationSql
            .split(';')
            .filter(statement => statement.trim() !== '');
        
        // Выполняем каждый оператор
        for (let statement of statements) {
            statement = statement.trim();
            if (statement) {
                try {
                    await pool.query(statement);
                    console.log('Оператор выполнен успешно');
                } catch (err) {
                    console.error('Ошибка выполнения оператора:', err.message);
                    console.error('Оператор:', statement);
                    throw err;
                }
            }
        }
        
        console.log('Структура таблицы reviews успешно исправлена.');
        process.exit(0);
    } catch (error) {
        console.error('Ошибка исправления таблицы reviews:', error);
        process.exit(1);
    }
}

// Запускаем скрипт
fixReviewsTable(); 