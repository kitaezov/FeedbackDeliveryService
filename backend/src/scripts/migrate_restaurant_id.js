const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function runMigration() {
    try {
        console.log('Starting migration: adding restaurant_id to reviews...');

        // Читаем SQL файл
        const sqlPath = path.join(__dirname, '../db/migrations/add_restaurant_id_to_reviews.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Разделяем SQL на отдельные команды
        const commands = sql.split(';').filter(cmd => cmd.trim());

        // Выполняем каждую команду
        for (const command of commands) {
            if (command.trim()) {
                await pool.execute(command);
                console.log('Executed command:', command.trim().split('\n')[0]);
            }
        }

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Error running migration:', error);
        throw error;
    }
}

// Запускаем миграцию
runMigration()
    .then(() => {
        console.log('Migration script finished.');
        process.exit(0);
    })
    .catch(error => {
        console.error('Migration failed:', error);
        process.exit(1);
    }); 