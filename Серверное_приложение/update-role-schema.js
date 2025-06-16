require('dotenv').config();
const pool = require('./src/config/database');

async function updateRoleSchema() {
  try {
    console.log('Начало обновления базы данных...');
    
    // Проверяем, можем ли мы подключиться к базе данных
    const [testConnection] = await pool.query('SELECT 1 as test');
    console.log('Успешное подключение к базе данных:', testConnection);
    
    try {
      // Проверяем текущую схему
      const [describeResult] = await pool.query('DESCRIBE users');
      const roleColumn = describeResult.find(col => col.Field === 'role');
      console.log('Текущие столбцы таблицы users:', describeResult.map(col => col.Field).join(', '));
      
      if (roleColumn) {
        console.log('Текущее определение столбца роли:', roleColumn);
        
        // Помещаем в таблицу все необходимые роли
        console.log('Обновление столбца роли...');
        await pool.query(`
          ALTER TABLE users 
          MODIFY COLUMN role ENUM('user', 'manager', 'admin', 'head_admin', 'moderator', 'super_admin', 'глав_админ', 'менеджер', 'модератор') 
          NOT NULL DEFAULT 'user'
        `);
        
        console.log('Столбец роли обновлен успешно!');
        
        // Проверяем обновленную схему
        const [verifyResult] = await pool.query('DESCRIBE users');
        const updatedRoleColumn = verifyResult.find(col => col.Field === 'role');
        console.log('Новое определение столбца роли:', updatedRoleColumn);
      } else {
        console.error('Столбец роли не найден в таблице users!');
      }
    } catch (error) {
      console.error('Ошибка доступа к таблице users:', error.message);
    }
    
    console.log('Обновление процесса завершено.');
  } catch (error) {
    console.error('Ошибка базы данных:', error.message);
  } finally {
    console.log('Закрытие соединения с базой данных...');
    pool.end().then(() => {
      console.log('Соединение с базой данных закрыто.');
      process.exit(0);
    }).catch(err => {
      console.error('Ошибка закрытия соединения:', err);
      process.exit(1);
    });
  }
}

console.log('Скрипт запущен...');
updateRoleSchema(); 