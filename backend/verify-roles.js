require('dotenv').config();
const pool = require('./src/config/database');

async function verifyRoles() {
  try {
    console.log('Starting role verification...');
    
    // Get current role column definition
    const [columns] = await pool.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'
    `, [process.env.DB_NAME || 'feedback']);
    
    if (columns.length > 0) {
      console.log('Current role column definition:', columns[0].COLUMN_TYPE);
      
      // Test each valid role value
      const validRoles = ['user', 'manager', 'admin', 'head_admin'];
      console.log('\nTesting each valid role value:');
      
      // Create a test user
      const [testUserResult] = await pool.query(`
        INSERT INTO users (name, email, password, role) 
        VALUES (?, ?, ?, ?)
      `, ['Test User', 'testuser_' + Date.now() + '@example.com', 'password123', 'user']);
      
      const testUserId = testUserResult.insertId;
      console.log(`Created test user with ID ${testUserId}`);
      
      // Try updating to each role
      for (const role of validRoles) {
        try {
          await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, testUserId]);
          console.log(`✅ Successfully set role to "${role}"`);
        } catch (error) {
          console.error(`❌ Error setting role to "${role}":`, error.message);
        }
      }
      
      // Check if any non-standard role is in the column definition
      const columnType = columns[0].COLUMN_TYPE;
      const enumValues = columnType.substring(columnType.indexOf('(') + 1, columnType.lastIndexOf(')')).split(',');
      
      console.log('\nAll defined enum values:');
      enumValues.forEach(val => {
        const cleanVal = val.replace(/^'|'$/g, '');
        console.log(`- ${cleanVal}`);
        
        if (!validRoles.includes(cleanVal)) {
          console.log(`  ⚠️ Warning: "${cleanVal}" is not in the standard roles list`);
        }
      });
      
      // Clean up test user
      await pool.query('DELETE FROM users WHERE id = ?', [testUserId]);
      console.log(`\nDeleted test user ${testUserId}`);
    } else {
      console.error('Role column not found!');
    }
    
    console.log('\nVerification completed.');
  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await pool.end();
    console.log('Database connection closed.');
  }
}

verifyRoles(); 