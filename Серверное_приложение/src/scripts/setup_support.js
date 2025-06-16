/**
 * Support DB Setup Script
 * Initializes support ticket tables in the database
 */

const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function setupSupportTables() {
    try {
        console.log('Initializing support ticket tables...');
        
        // Читаем SQL скрипт
        const sqlScript = fs.readFileSync(
            path.join(__dirname, '../db/support_schema.sql'),
            'utf8'
        );
        
        // Разделяем скрипт на отдельные операторы
        const statements = sqlScript
            .split(';')
            .filter(statement => statement.trim() !== '');
        
        // Выполняем каждый оператор
        for (const statement of statements) {
            try {
                await pool.query(statement + ';');
            } catch (err) {
                // Игнорируем ошибки дублирования ключей для индексов
                if (err.code === 'ER_DUP_KEYNAME') {
                    console.log(`Index already exists: ${err.sqlMessage}`);
                } else {
                    throw err;
                }
            }
        }
        
        console.log('Support ticket tables initialized successfully!');
    } catch (error) {
        console.error('Error initializing support ticket tables:', error);
        throw error;
    }
}

// Если этот скрипт запускается напрямую (не импортируется)
if (require.main === module) {
    setupSupportTables()
        .then(() => {
            console.log('Support tables setup complete.');
            process.exit(0);
        })
        .catch(error => {
            console.error('Support tables setup failed:', error);
            process.exit(1);
        });
} else {
    // Экспорт для использования в других скриптах
    module.exports = setupSupportTables;
} 