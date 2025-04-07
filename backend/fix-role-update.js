require('dotenv').config();
const pool = require('./src/config/database');

async function fixRoleUpdate() {
  try {
    console.log('Starting to fix role update issue...');
    
    // Check role values in users table
    const [users] = await pool.query('SELECT id, role FROM users');
    console.log('Current users and their roles:');
    console.table(users);
    
    // Check specific user with ID 7
    const [user7] = await pool.query('SELECT id, role FROM users WHERE id = 7');
    if (user7.length > 0) {
      console.log('User with ID 7:', user7[0]);
      
      // Try updating to manager
      try {
        await pool.query('UPDATE users SET role = ? WHERE id = ?', ['manager', 7]);
        console.log('Successfully updated user 7 to manager role');
      } catch (error) {
        console.error('Error updating to manager:', error.message);
        
        // Check for valid enum values in the database schema
        const [columns] = await pool.query(`
          SELECT COLUMN_TYPE 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'
        `, [process.env.DB_NAME || 'feedback']);
        
        if (columns.length > 0) {
          console.log('Role column definition:', columns[0].COLUMN_TYPE);
          
          // Ensure the role column allows all needed roles
          await pool.query(`
            ALTER TABLE users 
            MODIFY COLUMN role ENUM('user', 'manager', 'admin', 'head_admin') NOT NULL DEFAULT 'user'
          `);
          
          console.log('Role column updated to support standard roles');
          
          // Try update again
          await pool.query('UPDATE users SET role = ? WHERE id = ?', ['manager', 7]);
          console.log('Successfully updated user 7 to manager role after schema fix');
        }
      }
    } else {
      console.log('User with ID 7 not found');
    }
    
    console.log('Fix completed.');
  } catch (error) {
    console.error('Error during fix process:', error);
  } finally {
    await pool.end();
    console.log('Database connection closed.');
  }
}

fixRoleUpdate(); 