/**
 * Role System Update Script
 * 
 * This script:
 * 1. Updates the user schema to support the new role hierarchy
 * 2. Makes sure admin@yandex.ru is head_admin
 * 3. Migrates any existing users with legacy roles to the new role system
 */

require('dotenv').config({ path: '../../.env' });
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function updateRoles() {
    try {
        console.log('Starting role system update...');
        
        // 1. Обновляем схему пользователей для поддержки иерархии ролей
        console.log('Updating user schema...');
        await pool.query(`
            ALTER TABLE users 
            MODIFY COLUMN role ENUM('user', 'manager', 'admin', 'head_admin') NOT NULL DEFAULT 'user'
        `);
        
        // 2. Убеждаемся, что head_admin существует
        console.log('Ensuring head_admin exists...');
        const [headAdminRows] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            ['ajdasjd@gamail.com']
        );
        
        if (headAdminRows.length === 0) {
            // Создаем head admin
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            await pool.query(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                ['Head Admin', 'ajdasjd@gamail.com', hashedPassword, 'head_admin']
            );
            
            console.log('Created head_admin user: ajdasjd@gamail.com');
        } else if (headAdminRows[0].role !== 'head_admin') {
            // Обновляем существующего admin@yandex.ru до head_admin
            await pool.query(
                'UPDATE users SET role = ? WHERE email = ?',
                ['head_admin', 'ajdasjd@gamail.com']
            );
            
            console.log('Updated admin@yandex.ru to head_admin role');
        } else {
            console.log('head_admin already exists and has correct role');
        }
        
        // 3. Мигрируем устаревшие роли
        console.log('Migrating legacy roles...');
        
        // Сопоставляем устаревшие роли с новыми ролями
        const legacyRoleMappings = {
            'глав_админ': 'head_admin',
            'модератор': 'manager',
            'менеджер': 'manager',
            'администратор': 'admin'
        };
        
        // Обновляем каждую устаревшую роль
        for (const [legacyRole, newRole] of Object.entries(legacyRoleMappings)) {
            const [result] = await pool.query(
                'UPDATE users SET role = ? WHERE role = ?',
                [newRole, legacyRole]
            );
            
            if (result.affectedRows > 0) {
                console.log(`Migrated ${result.affectedRows} users from '${legacyRole}' to '${newRole}'`);
            }
        }
        
        // Устанавливаем любые оставшиеся нестандартные роли в 'user'
        const [cleanupResult] = await pool.query(`
            UPDATE users 
            SET role = 'user'
            WHERE role NOT IN ('user', 'manager', 'admin', 'head_admin')
        `);
        
        if (cleanupResult.affectedRows > 0) {
            console.log(`Reset ${cleanupResult.affectedRows} users with non-standard roles to 'user'`);
        }
        
        console.log('Ролевая система обновлена успешно!');
        process.exit(0);
    } catch (error) {
        console.error('Ошибка при обновлении ролевой системы:', error);
        process.exit(1);
    }
}

updateRoles(); 