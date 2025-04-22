require('dotenv').config();
const pool = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function checkAdmin() {
    try {
        console.log('Checking admin credentials...');
        
        // Get admin user
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            ['admin@yandex.ru']
        );
        
        if (rows.length === 0) {
            console.log('Admin user not found in database!');
            
            // Create a new admin user
            console.log('Creating new admin user...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            const [result] = await pool.execute(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                ['Head Admin', 'admin@yandex.ru', hashedPassword, 'head_admin']
            );
            
            console.log('New admin user created with ID:', result.insertId);
        } else {
            const admin = rows[0];
            console.log('Admin user found:');
            console.log('ID:', admin.id);
            console.log('Name:', admin.name);
            console.log('Email:', admin.email);
            console.log('Role:', admin.role);
            console.log('Is Blocked:', admin.is_blocked);
            
            // Let's test the password
            const testPassword = 'admin123';
            const isPasswordValid = await bcrypt.compare(testPassword, admin.password);
            console.log('Password "admin123" is valid:', isPasswordValid);
            
            if (!isPasswordValid) {
                console.log('Resetting admin password to admin123...');
                const hashedPassword = await bcrypt.hash('admin123', 10);
                
                await pool.execute(
                    'UPDATE users SET password = ? WHERE id = ?',
                    [hashedPassword, admin.id]
                );
                
                console.log('Admin password has been reset');
            }
        }
    } catch (error) {
        console.error('Error checking admin:', error);
    } finally {
        // Close the database connection pool
        await pool.end();
    }
}

checkAdmin(); 