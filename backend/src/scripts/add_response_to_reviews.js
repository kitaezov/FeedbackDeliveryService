/**
 * Migration script to add response columns to reviews table
 */

require('dotenv').config();
const pool = require('../config/database');

async function addResponseToReviews() {
    try {
        console.log('Starting migration: Adding response columns to reviews table...');

        // Check if response column exists
        const [columns] = await pool.query(`
            SHOW COLUMNS FROM reviews LIKE 'response'
        `);

        if (columns.length === 0) {
            // Add response and response_date columns
            await pool.query(`
                ALTER TABLE reviews 
                ADD COLUMN response TEXT,
                ADD COLUMN response_date TIMESTAMP NULL,
                ADD COLUMN responded_by INT,
                ADD FOREIGN KEY (responded_by) REFERENCES users(id) ON DELETE SET NULL
            `);

            console.log('Added response columns to reviews table');
        } else {
            console.log('Response columns already exist');
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error during migration:', error);
        process.exit(1);
    }
}

addResponseToReviews(); 