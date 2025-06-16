const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function fixCategories() {
    try {
        console.log('Начинаем исправление категорий ресторанов...');
        
        // Читаем SQL файл
        const sqlPath = path.join(__dirname, '../db/migrations/fix_restaurant_categories.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Выполняем каждый запрос отдельно
        const queries = sql.split(';').filter(query => query.trim());
        
        for (const query of queries) {
            if (query.trim()) {
                await pool.query(query);
                console.log('Успешно выполнен запрос:', query.trim().split('\n')[0]);
            }
        }
        
        console.log('Категории ресторанов успешно исправлены!');
        process.exit(0);
    } catch (error) {
        console.error('Ошибка при исправлении категорий:', error);
        process.exit(1);
    }
}

fixCategories(); 