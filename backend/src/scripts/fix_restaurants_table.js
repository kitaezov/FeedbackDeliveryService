const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function fixRestaurantsTable() {
    try {
        console.log('Starting restaurants table fix...');

        // Read the SQL file
        const sqlPath = path.join(__dirname, '../db/migrations/fix_restaurants_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split SQL into individual commands
        const commands = sql.split(';').filter(cmd => cmd.trim());

        // Execute each command
        for (const command of commands) {
            if (command.trim()) {
                try {
                    await pool.execute(command);
                    console.log('Successfully executed command:', command.trim().split('\n')[0]);
                } catch (error) {
                    console.error('Error executing command:', error.message);
                    console.error('Command:', command.trim());
                    throw error;
                }
            }
        }

        console.log('Restaurants table fix completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing restaurants table:', error);
        process.exit(1);
    }
}

// Run the migration
fixRestaurantsTable(); 