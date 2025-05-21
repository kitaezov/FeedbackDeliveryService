require('dotenv').config();
const pool = require('./src/config/database');

async function fixRoleUpdate() {
  try {
    console.log('Начинаем исправление проблемы с обновлением роли...');
    
    // Проверяем значения ролей в таблице users
    const [users] = await pool.query('SELECT id, role FROM users');
    console.log('Текущие пользователи и их роли:');
    console.table(users);
    
    // Проверяем конкретного пользователя с ID 7
    const [user7] = await pool.query('SELECT id, role FROM users WHERE id = 7');
    if (user7.length > 0) {
      console.log('Пользователь с ID 7:', user7[0]);
      
      // Попробуем обновить до роли manager
      try {
        await pool.query('UPDATE users SET role = ? WHERE id = ?', ['manager', 7]);
        console.log('Успешно обновлен пользователь 7 до роли manager');
      } catch (error) {
        console.error('Ошибка обновления до роли manager:', error.message);
        
        // Проверяем допустимые значения в схеме базы данных
        const [columns] = await pool.query(`
          SELECT COLUMN_TYPE 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'
        `, [process.env.DB_NAME || 'feedback']);
        
        if (columns.length > 0) {
          console.log('Определение столбца роли:', columns[0].COLUMN_TYPE);
          
          // Убеждаемся, что столбец роли поддерживает все необходимые роли
          await pool.query(`
            ALTER TABLE users 
            MODIFY COLUMN role ENUM('user', 'manager', 'admin', 'head_admin') NOT NULL DEFAULT 'user'
          `);
          
          console.log('Столбец роли обновлен для поддержки стандартных ролей');
          
          // Попробуем обновить снова
          await pool.query('UPDATE users SET role = ? WHERE id = ?', ['manager', 7]);
          console.log('Успешно обновлен пользователь 7 до роли manager после исправления схемы');
        }
      }
    } else {
      console.log('Пользователь с ID 7 не найден');
    }
    
    console.log('Исправление завершено.');
  } catch (error) {
    console.error('Ошибка при исправлении:', error);
  } finally {
    await pool.end();
    console.log('Соединение с базой данных закрыто.');
  }
}

fixRoleUpdate(); 