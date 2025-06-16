/**
 * Обновляем схему пользователей
 * Расширяем колонку роли в таблице users, чтобы поддерживать все роли: 'user', 'manager', 'admin', 'head_admin'
 * Добавляем колонки для функциональности блокировки пользователей
 */

require('dotenv').config({ path: '../../.env' });
const pool = require('../config/database');

async function updateUserSchema() {
    try {
        console.log('Checking user schema...');
        
        // Проверяем определение текущей колонки роли
        const [columns] = await pool.query(`
            SELECT COLUMN_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'
        `, [process.env.DB_NAME]);
        
        if (columns.length > 0) {
            const currentType = columns[0].COLUMN_TYPE;
            console.log(`Current role column type: ${currentType}`);
            
            // Проверяем, является ли это ENUM и содержит ли он все необходимые роли
            if (currentType.includes('enum') && 
                (!currentType.includes('manager') || !currentType.includes('head_admin'))) {
                console.log('Modifying role column to support all roles...');
                
                await pool.query(`
                    ALTER TABLE users 
                    MODIFY COLUMN role ENUM('user', 'manager', 'admin', 'head_admin') NOT NULL DEFAULT 'user'
                `);
                
                console.log('Role column updated successfully!');
            } else if (currentType.includes('varchar') && parseInt(currentType.match(/varchar\((\d+)\)/)[1]) < 20) {
                // Если это VARCHAR, но слишком короткий
                console.log('Expanding the size of role column...');
                
                await pool.query(`
                    ALTER TABLE users 
                    MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user'
                `);
                
                console.log('Role column expanded successfully!');
            } else {
                console.log('Role column already supports all necessary roles or is properly sized.');
            }
            
            // Иначе обновляем любые устаревшие роли, чтобы соответствовать новой иерархии 
            console.log('Updating any legacy role values...');
            
            await pool.query(`
                UPDATE users
                SET role = 'user'
                WHERE role NOT IN ('user', 'manager', 'admin', 'head_admin')
            `);
            
            console.log('Legacy roles updated successfully!');
        } else {
            console.error('Could not find role column in users table.');
        }
        
        // Проверяем наличие колонок для блокировки пользователей  
        console.log('Checking for user blocking columns...');
        
        // Проверяем наличие колонки is_blocked  
        const [hasBlockedColumn] = await pool.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'is_blocked'
        `, [process.env.DB_NAME]);
        
        // Если колонки нет, добавляем её 
        if (hasBlockedColumn.length === 0) {
            console.log('Adding is_blocked column to users table...');
            
            await pool.query(`
                ALTER TABLE users 
                ADD COLUMN is_blocked TINYINT(1) DEFAULT 0
            `);
            
            console.log('is_blocked column added successfully!');
        } else {
            console.log('is_blocked column already exists.');
        }
        
        // Проверяем наличие колонки blocked_reason ( 
        const [hasReasonColumn] = await pool.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'blocked_reason'
        `, [process.env.DB_NAME]);
        
        // Если колонки нет, добавляем её      
        if (hasReasonColumn.length === 0) {
            console.log('Adding blocked_reason column to users table...');
            
            await pool.query(`
                ALTER TABLE users 
                ADD COLUMN blocked_reason VARCHAR(255) DEFAULT NULL
            `);
            
            console.log('blocked_reason column added successfully!');
        } else {
            console.log('blocked_reason column already exists.');
        }
        
        console.log('User schema update completed.');
        process.exit(0);
    } catch (error) {
        console.error('Error updating user schema:', error);
        process.exit(1);
    }
}

updateUserSchema(); 