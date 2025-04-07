/**
 * Support DB Setup Script
 * Initializes support ticket tables in the database
 */

const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function setupSupportTables() {
    try {
        console.log('Initializing support ticket tables...');
        
        // Read the SQL script
        const sqlScript = fs.readFileSync(
            path.join(__dirname, '../db/support_schema.sql'),
            'utf8'
        );
        
        // Split the script into separate statements
        const statements = sqlScript
            .split(';')
            .filter(statement => statement.trim() !== '');
        
        // Execute each statement
        for (const statement of statements) {
            try {
                await pool.query(statement + ';');
            } catch (err) {
                // Ignore duplicate key errors for indexes
                if (err.code === 'ER_DUP_KEYNAME') {
                    console.log(`Index already exists: ${err.sqlMessage}`);
                } else {
                    throw err;
                }
            }
        }
        
        console.log('Support ticket tables initialized successfully!');
    } catch (error) {
        console.error('Error initializing support ticket tables:', error);
        throw error;
    }
}

// If this script is run directly (not imported)
if (require.main === module) {
    setupSupportTables()
        .then(() => {
            console.log('Support tables setup complete.');
            process.exit(0);
        })
        .catch(error => {
            console.error('Support tables setup failed:', error);
            process.exit(1);
        });
} else {
    // Export for use in other scripts
    module.exports = setupSupportTables;
} 