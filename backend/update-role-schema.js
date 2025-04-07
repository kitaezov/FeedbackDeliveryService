require('dotenv').config();
const pool = require('./src/config/database');

async function updateRoleSchema() {
  try {
    console.log('Starting database update...');
    
    // Check if we can connect to the database
    const [testConnection] = await pool.query('SELECT 1 as test');
    console.log('Database connection successful:', testConnection);
    
    try {
      // First check the current schema
      const [describeResult] = await pool.query('DESCRIBE users');
      const roleColumn = describeResult.find(col => col.Field === 'role');
      console.log('Current users table columns:', describeResult.map(col => col.Field).join(', '));
      
      if (roleColumn) {
        console.log('Current role column definition:', roleColumn);
        
        // Alter the table to support all necessary roles
        console.log('Updating role column...');
        await pool.query(`
          ALTER TABLE users 
          MODIFY COLUMN role ENUM('user', 'manager', 'admin', 'head_admin', 'moderator', 'super_admin', 'глав_админ', 'менеджер', 'модератор') 
          NOT NULL DEFAULT 'user'
        `);
        
        console.log('Role column updated successfully!');
        
        // Verify the updated schema
        const [verifyResult] = await pool.query('DESCRIBE users');
        const updatedRoleColumn = verifyResult.find(col => col.Field === 'role');
        console.log('New role column definition:', updatedRoleColumn);
      } else {
        console.error('Role column not found in users table!');
      }
    } catch (error) {
      console.error('Error accessing users table:', error.message);
    }
    
    console.log('Update process completed.');
  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    console.log('Closing database connection...');
    pool.end().then(() => {
      console.log('Database connection closed.');
      process.exit(0);
    }).catch(err => {
      console.error('Error closing connection:', err);
      process.exit(1);
    });
  }
}

console.log('Script started...');
updateRoleSchema(); 