/**
 * Script to assign admin role to a specific user
 * Run with: node makeAdmin.js
 */

require('dotenv').config({ path: '../../.env' });
const pool = require('../config/database');

async function makeUserAdmin() {
  try {
    console.log('Connecting to database...');
    
    // First, check if the user exists
    const [userRows] = await pool.execute(
      'SELECT * FROM users WHERE id = ? AND email = ?',
      [1, 'admin@yandex.ru']
    );
    
    if (userRows.length === 0) {
      console.error('User not found! Make sure the ID and email are correct.');
      process.exit(1);
    }
    
    const user = userRows[0];
    console.log(`Found user: ${user.name} (${user.email}), current role: ${user.role}`);
    
    // Update the user role to admin
    await pool.execute(
      'UPDATE users SET role = ? WHERE id = ?',
      ['admin', 1]
    );
    
    console.log(`Success! User ${user.name} has been updated to role: admin`);
    
    // Verify the update
    const [updatedRows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [1]
    );
    
    if (updatedRows.length > 0) {
      console.log(`Verification: User now has role: ${updatedRows[0].role}`);
    }
    
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    // Close the connection pool
    pool.end();
    process.exit(0);
  }
}

// Run the function
makeUserAdmin(); 