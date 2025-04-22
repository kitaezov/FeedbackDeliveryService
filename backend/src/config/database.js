/**
 * Database Configuration
 * Handles MySQL database connection pool setup
 */

    const mysql = require('mysql2/promise');
    require('dotenv').config();

    // Debug database connection info
    if (process.env.DEBUG === 'true') {
        console.log('Database connection info:');
        console.log('Host:', process.env.DB_HOST || 'localhost');
        console.log('User:', process.env.DB_USER || 'root');
        console.log('Database:', process.env.DB_NAME || 'feedback');
    }

    // Create a connection pool
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '123123',
        database: process.env.DB_NAME || 'feedback',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    // Test database connection
    (async () => {
        try {
            if (process.env.DEBUG === 'true') {
                console.log('Testing database connection...');
                const connection = await pool.getConnection();
                console.log('Database connection successful!');
                connection.release();
            }
        } catch (error) {
            console.error('Database connection error:', error);
        }
    })();

    module.exports = pool; 