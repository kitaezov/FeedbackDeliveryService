const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function cleanDatabase() {
    try {
        console.log('Начало очистки базы данных...');
        
        const sqlPath = path.join(__dirname, '../db/clean-db.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        const statements = sql.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
            await pool.query(statement);
            console.log('Выполнен SQL запрос:', statement.trim());
        }
        
        console.log('База данных успешно очищена');
        process.exit(0);
    } catch (error) {
        console.error('Ошибка при очистке базы данных:', error);
        process.exit(1);
    }
}

cleanDatabase(); 