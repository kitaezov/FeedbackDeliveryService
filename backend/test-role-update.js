require('dotenv').config();
const pool = require('./src/config/database');

async function testRoleUpdate() {
  try {
    console.log('Testing role update functionality...');
    
    // Create a test user
    const [testUserResult] = await pool.query(`
      INSERT INTO users (name, email, password, role) 
      VALUES (?, ?, ?, ?)
    `, ['Role Test User', 'roletest_' + Date.now() + '@example.com', 'password123', 'user']);
    
    const testUserId = testUserResult.insertId;
    console.log(`Created test user with ID ${testUserId}`);
    
    // Verify initial role
    const [initialUser] = await pool.query('SELECT id, role FROM users WHERE id = ?', [testUserId]);
    console.log('Initial user role:', initialUser[0].role);
    
    // Test each role update
    const roles = ['manager', 'admin', 'head_admin', 'user'];
    
    for (const role of roles) {
      try {
        console.log(`\nAttempting to update user ${testUserId} to role "${role}"...`);
        
        // Update role
        await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, testUserId]);
        
        // Verify role was updated
        const [updatedUser] = await pool.query('SELECT id, role FROM users WHERE id = ?', [testUserId]);
        console.log('Updated user role:', updatedUser[0].role);
        
        if (updatedUser[0].role === role) {
          console.log(`✅ Successfully updated to "${role}"`);
        } else {
          console.log(`❌ Failed to update to "${role}"`);
        }
      } catch (error) {
        console.error(`❌ Error updating to "${role}":`, error.message);
      }
    }
    
    // Clean up test user
    await pool.query('DELETE FROM users WHERE id = ?', [testUserId]);
    console.log(`\nDeleted test user ${testUserId}`);
    
    console.log('\nRole update tests completed successfully.');
  } catch (error) {
    console.error('Error during role update testing:', error);
  } finally {
    await pool.end();
    console.log('Database connection closed.');
  }
}

testRoleUpdate(); 