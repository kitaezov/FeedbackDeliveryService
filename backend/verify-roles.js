require('dotenv').config();
const pool = require('./src/config/database');

async function verifyRoles() {
  try {
    console.log('Начало проверки ролей...');
    
    // Получаем текущее определение столбца роли
    const [columns] = await pool.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'
    `, [process.env.DB_NAME || 'feedback']);
    
    if (columns.length > 0) {
      console.log('Текущее определение столбца роли:', columns[0].COLUMN_TYPE);
      
      // Проверяем каждое допустимое значение роли
      const validRoles = ['user', 'manager', 'admin', 'head_admin'];
      console.log('\nТестирование каждого допустимого значения роли:');
      
      // Создаем тестового пользователя
      const [testUserResult] = await pool.query(`
        INSERT INTO users (name, email, password, role) 
        VALUES (?, ?, ?, ?)
      `, ['Test User', 'testuser_' + Date.now() + '@example.com', 'password123', 'user']);
      
      const testUserId = testUserResult.insertId;
      console.log(`Создан тестовый пользователь с ID ${testUserId}`);
      
      // Пытаемся обновить до каждой роли
      for (const role of validRoles) {
        try {
          await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, testUserId]);
          console.log(`✅ Успешно установлена роль "${role}"`);
        } catch (error) {
          console.error(`❌ Ошибка установки роли "${role}":`, error.message);
        }
      }
      
      // Проверяем, есть ли в определении столбца роли нестандартные роли
      const columnType = columns[0].COLUMN_TYPE;
      const enumValues = columnType.substring(columnType.indexOf('(') + 1, columnType.lastIndexOf(')')).split(',');
      
      console.log('\nВсе определенные значения перечисления:');
      enumValues.forEach(val => {
        const cleanVal = val.replace(/^'|'$/g, '');
        console.log(`- ${cleanVal}`);
        
        if (!validRoles.includes(cleanVal)) {
          console.log(`  ⚠️ Предупреждение: "${cleanVal}" не входит в список стандартных ролей`);
        }
      });
      
      // Очистка тестового пользователя
      await pool.query('DELETE FROM users WHERE id = ?', [testUserId]);
      console.log(`\nУдален тестовый пользователь ${testUserId}`);
    } else {
      console.error('Столбец роли не найден!');
    }
    
    console.log('\nПроверка завершена.');
  } catch (error) {
    console.error('Ошибка при проверке:', error);
  } finally {
    await pool.end();
    console.log('Соединение с базой данных закрыто.');
  }
}

verifyRoles(); 