require('dotenv').config();
const pool = require('./src/config/database');

async function standardizeRoles() {
  try {
    console.log('Starting role standardization process...');
    
    // Define standard roles
    const standardRoles = ['user', 'manager', 'admin', 'head_admin'];
    
    // Get current role column definition
    const [columns] = await pool.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'
    `, [process.env.DB_NAME || 'feedback']);
    
    if (columns.length > 0) {
      console.log('Current role column definition:', columns[0].COLUMN_TYPE);
      
      // Get list of users with non-standard roles
      const [users] = await pool.query(`
        SELECT id, name, email, role 
        FROM users 
        WHERE role NOT IN (?, ?, ?, ?)
      `, standardRoles);
      
      if (users.length > 0) {
        console.log('Found users with non-standard roles:');
        console.table(users);
        
        // Map non-standard roles to standard ones
        const roleMapping = {
          'moderator': 'manager',
          'super_admin': 'admin',
          'глав_админ': 'head_admin',
          'менеджер': 'manager',
          'модератор': 'manager'
        };
        
        // Update each user with a standard role
        for (const user of users) {
          const standardRole = roleMapping[user.role] || 'user';
          console.log(`Updating user ${user.id} (${user.email}) from '${user.role}' to '${standardRole}'`);
          
          await pool.query('UPDATE users SET role = ? WHERE id = ?', [standardRole, user.id]);
        }
        
        console.log('All user roles have been standardized.');
      } else {
        console.log('No users with non-standard roles found.');
      }
      
      // Now update the role column to only allow standard roles
      await pool.query(`
        ALTER TABLE users 
        MODIFY COLUMN role ENUM('user', 'manager', 'admin', 'head_admin') NOT NULL DEFAULT 'user'
      `);
      
      console.log('Role column has been updated to only allow standard roles.');
      
      // Verify the changes
      const [updatedColumns] = await pool.query(`
        SELECT COLUMN_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'
      `, [process.env.DB_NAME || 'feedback']);
      
      console.log('New role column definition:', updatedColumns[0].COLUMN_TYPE);
      
      // Check if there are any users left with non-standard roles
      const [remainingNonStandard] = await pool.query(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE role NOT IN (?, ?, ?, ?)
      `, standardRoles);
      
      console.log(`Users with non-standard roles after update: ${remainingNonStandard[0].count}`);
    } else {
      console.error('Role column not found!');
    }
    
    console.log('Role standardization completed.');
  } catch (error) {
    console.error('Error during role standardization:', error);
  } finally {
    await pool.end();
    console.log('Database connection closed.');
  }
}

standardizeRoles(); 