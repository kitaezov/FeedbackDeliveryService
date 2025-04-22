/**
 * Setup Manager Tables
 * 
 * This script creates the necessary database tables for manager functionality:
 * - manager_responses: for storing manager responses to user reviews
 */

const pool = require('../config/database');

async function setupManagerTables() {
    try {
        console.log('Setting up manager tables...');
        
        // Create manager_responses table if it doesn't exist
        await pool.query(`
            CREATE TABLE IF NOT EXISTS manager_responses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                review_id INT NOT NULL,
                manager_id INT NOT NULL,
                response_text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
                FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_review (review_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        
        console.log('Manager tables set up successfully');
        return true;
    } catch (error) {
        console.error('Error setting up manager tables:', error);
        throw error;
    }
}

module.exports = setupManagerTables; 