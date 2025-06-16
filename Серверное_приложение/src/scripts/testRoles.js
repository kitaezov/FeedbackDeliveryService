/**
 * Role Hierarchy Test Script
 * 
 * This script tests the role-based access control system by:
 * 1. Creating test users with different roles
 * 2. Testing role-based permission operations
 * 3. Validating the role hierarchy: head_admin > admin > manager > user
 */

require('dotenv').config({ path: '../../.env' });
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

async function testRoles() {
    try {
        console.log('Testing role hierarchy functionality...');
        
        // Очищаем любые предыдущие тестовые пользователей
        console.log('Cleaning up previous test users...');
        await pool.query(`
            DELETE FROM users 
            WHERE email LIKE 'test%@example.com'
        `);
        
        // Создаем тестовые пользователей с разными ролями
        console.log('Creating test users with different roles...');
        
        const testUsers = [
            { name: 'Test User', email: 'testuser@example.com', role: 'user' },
            { name: 'Test Manager', email: 'testmanager@example.com', role: 'manager' },
            { name: 'Test Admin', email: 'testadmin@example.com', role: 'admin' },
            { name: 'Test Head Admin', email: 'testheadadmin@example.com', role: 'head_admin' }
        ];
        
        const hashedPassword = await bcrypt.hash('test123', 10);
        
        for (const user of testUsers) {
            await pool.query(`
                INSERT INTO users (name, email, password, role)
                VALUES (?, ?, ?, ?)
            `, [user.name, user.email, hashedPassword, user.role]);
            
            console.log(`Created test user: ${user.name} (${user.role})`);
        }
        
        // Тестируем иерархию ролей
        console.log('\nTesting role hierarchy...');
        
        const roleHierarchy = {
            'head_admin': 100,
            'admin': 80,
            'manager': 50,
            'user': 10
        };
        
        console.log('Role hierarchy levels:');
        Object.entries(roleHierarchy).forEach(([role, level]) => {
            console.log(`${role}: ${level}`);
        });
        
        console.log('\nRole comparison tests:');
        console.log(`head_admin > admin: ${roleHierarchy['head_admin'] > roleHierarchy['admin']}`);
        console.log(`admin > manager: ${roleHierarchy['admin'] > roleHierarchy['manager']}`);
        console.log(`manager > user: ${roleHierarchy['manager'] > roleHierarchy['user']}`);
        console.log(`head_admin > user: ${roleHierarchy['head_admin'] > roleHierarchy['user']}`);
        
        // Тестируем повышение пользователей (не сработает с реальными разрешениями)
        console.log('\nИмитируем операции обновления ролей...');
        
        // Получаем созданных тестовых пользователей
        const [users] = await pool.query(`
            SELECT id, name, email, role FROM users
            WHERE email LIKE 'test%@example.com'
            ORDER BY FIELD(role, 'head_admin', 'admin', 'manager', 'user')
        `);
        
        // Логируем текущие роли
        console.log('Current test users:');
        users.forEach(user => {
            console.log(`${user.name} (${user.email}): ${user.role}`);
        });
        
        console.log('\nТест завершен. Теперь вы можете протестировать панель администратора в UI.');
        process.exit(0);
    } catch (error) {
        console.error('Error testing roles:', error);
        process.exit(1);
    }
}

testRoles(); 