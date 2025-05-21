require('dotenv').config();
const pool = require('./src/config/database');

async function testRoleUpdate() {
  try {
    console.log('Тестирование функционала обновления ролей...');
    
    // Создаем тестового пользователя
    const [testUserResult] = await pool.query(`
      INSERT INTO users (name, email, password, role) 
      VALUES (?, ?, ?, ?)
    `, ['Role Test User', 'roletest_' + Date.now() + '@example.com', 'password123', 'user']);
    
    const testUserId = testUserResult.insertId;
    console.log(`Created test user with ID ${testUserId}`);
    
    // Проверяем начальную роль
    const [initialUser] = await pool.query('SELECT id, role FROM users WHERE id = ?', [testUserId]);
    console.log('Начальная роль пользователя:', initialUser[0].role);
    
    // Тестируем каждую роль
    const roles = ['manager', 'admin', 'head_admin', 'user'];
    
    for (const role of roles) {
      try {
        console.log(`\nПытаемся обновить роль пользователя ${testUserId} на "${role}"...`);
        
        // Обновляем роль
        await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, testUserId]);
        
        // Проверяем, что роль была обновлена
        const [updatedUser] = await pool.query('SELECT id, role FROM users WHERE id = ?', [testUserId]);
        console.log('Обновленная роль пользователя:', updatedUser[0].role);
        
        if (updatedUser[0].role === role) {
          console.log(`✅ Успешно обновлено до "${role}"`);
        } else {
          console.log(`❌ Не удалось обновить до "${role}"`);
        }
      } catch (error) {
        console.error(`❌ Ошибка при обновлении до "${role}":`, error.message);
      }
    }
    
    // Очищаем тестовый пользователь
    await pool.query('DELETE FROM users WHERE id = ?', [testUserId]);
    console.log(`\nУдален тестовый пользователь ${testUserId}`);
    
    console.log('\nТесты обновления ролей завершены успешно.');
  } catch (error) {
    console.error('Ошибка при тестировании обновления ролей:', error);
  } finally {
    await pool.end();
    console.log('Соединение с базой данных закрыто.');
  }
}

testRoleUpdate(); 