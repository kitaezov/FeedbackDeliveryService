require('dotenv').config();
const pool = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function checkAdmin() {
    try {
        console.log('Проверка учетных данных администратора...');
        
        // Получаем администратора пользователя
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            ['admin@yandex.ru']
        );
        
        if (rows.length === 0) {
            console.log('Администратор пользователя не найден в базе данных!');
            
            // Создаем нового администратора пользователя
            console.log('Создаем нового администратора пользователя...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            const [result] = await pool.execute(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                ['Head Admin', 'admin@yandex.ru', hashedPassword, 'head_admin']
            );
            
            console.log('Новый администратор пользователя создан с ID:', result.insertId);
        } else {
            const admin = rows[0];
            console.log('Администратор пользователя найден:');
            console.log('ID:', admin.id);
            console.log('Имя:', admin.name);
            console.log('Email:', admin.email);
            console.log('Роль:', admin.role);
            console.log('Блокировка:', admin.is_blocked);
            
            // Давайте протестируем пароль
            const testPassword = 'admin123';
            const isPasswordValid = await bcrypt.compare(testPassword, admin.password);
            console.log('Пароль "admin123" действителен:', isPasswordValid);
            
            if (!isPasswordValid) {
                console.log('Сброс пароля администратора на admin123...');
                const hashedPassword = await bcrypt.hash('admin123', 10);
                
                await pool.execute(
                    'UPDATE users SET password = ? WHERE id = ?',
                    [hashedPassword, admin.id]
                );
                
                console.log('Пароль администратора сброшен');
            }
        }
    } catch (error) {
        console.error('Ошибка проверки администратора:', error);
    } finally {
        // Закрываем пул соединений с базой данных
        await pool.end();
    }
}

checkAdmin(); 