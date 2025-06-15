/**
 * Script to delete mock restaurants
 */

const pool = require('../config/database');

async function deleteRestaurants() {
    try {
        console.log('Starting deletion of mock restaurants...');
        
        // List of restaurant names to delete
        const restaurantNames = [
            'Итальянский дворик',
            'Азиатский бриз',
            'У Михалыча',
            'Морской причал',
            'Французская лавка',
            'Грузинский дворик',
            'Мексиканский уголок',
            'Американский бургер'
        ];
        
        console.log(`Restaurants to delete: ${restaurantNames.join(', ')}`);
        
        // Create placeholders for SQL query
        const placeholders = restaurantNames.map(() => '?').join(',');
        const query = `DELETE FROM restaurants WHERE name IN (${placeholders})`;
        
        // Execute the query
        const [result] = await pool.execute(query, restaurantNames);
        
        console.log(`Deletion complete. ${result.affectedRows} restaurants were deleted.`);
        
        // List remaining restaurants
        const [remaining] = await pool.execute('SELECT id, name FROM restaurants');
        console.log('Remaining restaurants:');
        if (remaining.length === 0) {
            console.log('No restaurants left in the database.');
        } else {
            remaining.forEach(restaurant => {
                console.log(`ID: ${restaurant.id}, Name: ${restaurant.name}`);
            });
        }
        
    } catch (error) {
        console.error('Error deleting restaurants:', error);
    } finally {
        // Close the database connection
        await pool.end();
        console.log('Database connection closed.');
    }
}

// Run the script
deleteRestaurants(); 