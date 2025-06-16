/**
 * Migration script to add restaurant_id to users table
 */

require('dotenv').config();
const pool = require('../config/database');

async function addRestaurantToUsers() {
    try {
        console.log('Starting migration: Adding restaurant_id to users table...');

        // Check if restaurant_id column exists
        const [columns] = await pool.query(`
            SHOW COLUMNS FROM users LIKE 'restaurant_id'
        `);

        if (columns.length === 0) {
            // Add restaurant_id column
            await pool.query(`
                ALTER TABLE users 
                ADD COLUMN restaurant_id INT,
                ADD FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL
            `);

            console.log('Added restaurant_id column to users table');
        } else {
            console.log('restaurant_id column already exists');
        }

        // Reset restaurant_id for non-manager users
        await pool.query(`
            UPDATE users 
            SET restaurant_id = NULL 
            WHERE role != 'manager'
        `);

        console.log('Reset restaurant_id for non-manager users');
        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error during migration:', error);
        process.exit(1);
    }
}

addRestaurantToUsers(); 