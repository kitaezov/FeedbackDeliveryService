const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function updateCategories() {
    try {
        // Read database configuration from environment or use defaults
        const dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '', // Empty password by default
            database: process.env.DB_NAME || 'feedback_delivery'
        };

        console.log('Attempting to connect to database...');
        
        // Create connection
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database');

        // Read and execute schema.sql
        console.log('Reading schema.sql...');
        const schemaSQL = await fs.readFile(path.join(__dirname, 'src', 'config', 'schema.sql'), 'utf8');
        console.log('Executing schema.sql...');
        await connection.query(schemaSQL);
        console.log('Schema updated');

        // Read and execute update_restaurant_categories.sql
        console.log('Reading update_restaurant_categories.sql...');
        const updateSQL = await fs.readFile(path.join(__dirname, 'src', 'db', 'migrations', 'update_restaurant_categories.sql'), 'utf8');
        console.log('Executing category updates...');
        await connection.query(updateSQL);
        console.log('Categories updated');

        // Close connection
        await connection.end();
        console.log('Database update completed successfully');
    } catch (error) {
        console.error('Error updating database:', error);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\nPlease check your database credentials and try again.');
            console.log('You can set these environment variables:');
            console.log('  DB_HOST     - Database host (default: localhost)');
            console.log('  DB_USER     - Database user (default: root)');
            console.log('  DB_PASSWORD - Database password');
            console.log('  DB_NAME     - Database name (default: feedback_delivery)');
        }
        process.exit(1);
    }
}

updateCategories(); 