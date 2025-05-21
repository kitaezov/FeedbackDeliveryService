const fs = require('fs');
const path = require('path');
const pool = require('./database');

async function initializeDatabase() {
    try {
        console.log('Starting database initialization...');

        // Чтение SQL файла
        const sqlPath = path.join(__dirname, 'init.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Разделение SQL файла на отдельные команды
        const commands = sql.split(';').filter(cmd => cmd.trim());

        // Выполнение каждой команды последовательно
        for (const command of commands) {
            if (command.trim()) {
                await pool.execute(command);
                console.log('Successfully executed SQL command');
            }
        }

        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

// Экспорт функции для использования в других файлах
module.exports = initializeDatabase;

// Если скрипт запущен напрямую, выполняем инициализацию
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log('Database initialization completed');
            process.exit(0);
        })
        .catch(error => {
            console.error('Database initialization failed:', error);
            process.exit(1);
        });
} 