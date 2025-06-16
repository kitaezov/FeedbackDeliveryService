const pool = require('./src/config/database');

async function checkDatabase() {
    try {
        console.log('Checking database connection...');
        const connection = await pool.getConnection();
        console.log('Database connection successful!');

        console.log('\nChecking restaurants table...');
        const [restaurants] = await connection.query('SELECT * FROM restaurants');
        console.log('Restaurants found:', restaurants.length);
        console.log('Restaurants data:', JSON.stringify(restaurants, null, 2));

        connection.release();
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkDatabase(); 