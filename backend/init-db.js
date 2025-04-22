const pool = require('./src/config/database');

async function initializeDatabase() {
    try {
        console.log('Initializing database...');
        const connection = await pool.getConnection();
        console.log('Database connection successful!');

        // Create restaurants table if it doesn't exist
        console.log('\nCreating restaurants table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS restaurants (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                address VARCHAR(255),
                description TEXT,
                image_url VARCHAR(255),
                website VARCHAR(255),
                contact_phone VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE,
                criteria JSON,
                slug VARCHAR(100),
                category VARCHAR(100),
                price_range VARCHAR(10),
                min_price VARCHAR(20),
                delivery_time VARCHAR(20)
            )
        `);
        console.log('Restaurants table created successfully!');

        // Insert some sample data if the table is empty
        const [rows] = await connection.query('SELECT COUNT(*) as count FROM restaurants');
        if (rows[0].count === 0) {
            console.log('\nInserting sample restaurants...');
            await connection.query(`
                INSERT INTO restaurants (name, address, description, category, price_range, is_active)
                VALUES 
                ('Sample Restaurant 1', '123 Main St', 'A great restaurant', 'Italian', '₽₽', true),
                ('Sample Restaurant 2', '456 Oak Ave', 'Another great restaurant', 'Japanese', '₽₽₽', true)
            `);
            console.log('Sample restaurants inserted successfully!');
        }

        connection.release();
        console.log('\nDatabase initialization completed successfully!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

initializeDatabase(); 