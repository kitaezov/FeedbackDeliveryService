/**
 * Fix Reviews Table Script
 * This script recreates the reviews table with the correct structure
 */

const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function fixReviewsTable() {
    try {
        console.log('Fixing reviews table structure...');
        
        // Read the migration SQL file
        const migrationPath = path.join(__dirname, '../db/migrations/fix_reviews_table.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');
        
        // Split the SQL file into individual statements
        const statements = migrationSql
            .split(';')
            .filter(statement => statement.trim() !== '');
        
        // Execute each statement
        for (let statement of statements) {
            statement = statement.trim();
            if (statement) {
                try {
                    await pool.query(statement);
                    console.log('Executed statement successfully');
                } catch (err) {
                    console.error('Error executing statement:', err.message);
                    console.error('Statement:', statement);
                    throw err;
                }
            }
        }
        
        console.log('Reviews table structure fixed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing reviews table:', error);
        process.exit(1);
    }
}

// Run the script
fixReviewsTable(); 