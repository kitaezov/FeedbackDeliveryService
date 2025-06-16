require('dotenv').config();
const pool = require('./src/config/database');

async function standardizeRoles() {
  try {
    console.log('Начало процесса стандартизации ролей...');
    
    // Определяем стандартные роли
    const standardRoles = ['user', 'manager', 'admin', 'head_admin'];
    
    // Получаем текущее определение столбца роли
    const [columns] = await pool.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'
    `, [process.env.DB_NAME || 'feedback']);
    
    if (columns.length > 0) {
      console.log('Текущее определение столбца роли:', columns[0].COLUMN_TYPE);
      
      // Получаем список пользователей с нестандартными ролями
      const [users] = await pool.query(`
        SELECT id, name, email, role 
        FROM users 
        WHERE role NOT IN (?, ?, ?, ?)
      `, standardRoles);
      
      if (users.length > 0) {
        console.log('Найдены пользователи с нестандартными ролями:');
        console.table(users);
        
        // Сопоставляем нестандартные роли с стандартными
        const roleMapping = {
          'moderator': 'manager',
          'super_admin': 'admin',
          'глав_админ': 'head_admin',
          'менеджер': 'manager',
          'модератор': 'manager'
        };
        
        // Обновляем каждого пользователя до стандартной роли
        for (const user of users) {
          const standardRole = roleMapping[user.role] || 'user';
          console.log(`Обновление пользователя ${user.id} (${user.email}) с '${user.role}' на '${standardRole}'`);
          
          await pool.query('UPDATE users SET role = ? WHERE id = ?', [standardRole, user.id]);
        }
        
        console.log('Все роли пользователей стандартизированы.');
      } else {
        console.log('Не найдены пользователи с нестандартными ролями.');
      }
      
      // Теперь обновляем столбец роли, чтобы разрешить только стандартные роли
      await pool.query(`
        ALTER TABLE users 
        MODIFY COLUMN role ENUM('user', 'manager', 'admin', 'head_admin') NOT NULL DEFAULT 'user'
      `);
      
      console.log('Столбец роли обновлен для разрешения только стандартных ролей.');
      
      // Проверяем изменения
      const [updatedColumns] = await pool.query(`
        SELECT COLUMN_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'
      `, [process.env.DB_NAME || 'feedback']);
      
      console.log('New role column definition:', updatedColumns[0].COLUMN_TYPE);
      
      // Проверяем, остались ли какие-либо пользователи с нестандартными ролями
      const [remainingNonStandard] = await pool.query(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE role NOT IN (?, ?, ?, ?)
      `, standardRoles);
      
      console.log(`Пользователи с нестандартными ролями после обновления: ${remainingNonStandard[0].count}`);
    } else {
      console.error('Столбец роли не найден!');
    }
    
    console.log('Стандартизация ролей завершена.');
  } catch (error) {
    console.error('Ошибка при стандартизации ролей:', error);
  } finally {
    await pool.end();
    console.log('Соединение с базой данных закрыто.');
  }
}

standardizeRoles(); 