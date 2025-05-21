const pool = require('./src/config/database');

async function initializeDatabase() {
    try {
        console.log('Инициализация базы данных...');
        const connection = await pool.getConnection();
        console.log('Успешное подключение к базе данных!');

        // Create restaurants table if it doesn't exist
        console.log('\nСоздание таблицы ресторанов...');
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
                delivery_time VARCHAR(20),
                hours VARCHAR(20)
            )
        `);
        console.log('Таблица ресторанов создана успешно!');

        // Insert some sample data if the table is empty
        const [rows] = await connection.query('SELECT COUNT(*) as count FROM restaurants');
        if (rows[0].count === 0) {
            console.log('\nВставка образцовых ресторанов...');
            await connection.query(`
                INSERT INTO restaurants (name, address, description, category, price_range, is_active)
                VALUES 
                ('Sample Restaurant 1', '123 Main St', 'A great restaurant', 'Italian', '₽₽', true),
                ('Sample Restaurant 2', '456 Oak Ave', 'Another great restaurant', 'Japanese', '₽₽₽', true)
            `);
            console.log('Образцовые рестораны вставлены успешно!');
        }

        connection.release();
        console.log('\nИнициализация базы данных завершена успешно!');
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        await pool.end();
    }
}

initializeDatabase(); 