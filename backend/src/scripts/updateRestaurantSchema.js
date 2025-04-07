/**
 * Update Restaurant Schema Script
 * Adds the slug field to the restaurants table if it doesn't exist
 */

require('dotenv').config({ path: '../../.env' });
const pool = require('../config/database');

async function updateRestaurantSchema() {
    try {
        console.log('Checking restaurant schema...');
        
        // Check if slug column exists
        const [columnCheck] = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'restaurants' AND column_name = 'slug'
        `);
        
        if (columnCheck.length === 0) {
            console.log('Adding slug column to restaurants table...');
            
            // Add slug column
            await pool.query(`
                ALTER TABLE restaurants 
                ADD COLUMN slug VARCHAR(100) UNIQUE
            `);
            
            // Add index for slug - MySQL doesn't support IF NOT EXISTS for indexes
            try {
                // First check if index exists
                const [indexCheck] = await pool.query(`
                    SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS 
                    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'restaurants' AND INDEX_NAME = 'restaurants_slug_idx'
                `, [process.env.DB_NAME]);
                
                if (indexCheck.length === 0) {
                    // Create index if it doesn't exist
                    await pool.query(`
                        CREATE INDEX restaurants_slug_idx ON restaurants(slug)
                    `);
                } else {
                    console.log('Index on slug already exists.');
                }
            } catch (indexError) {
                console.log('Error checking/creating index:', indexError.message);
                // Continue even if index creation fails
            }
            
            console.log('Updating existing restaurants with slugs...');
            
            // Get all restaurants
            const [restaurants] = await pool.query('SELECT id, name FROM restaurants');
            
            // Update each restaurant with a generated slug
            for (const restaurant of restaurants) {
                const slug = generateSlug(restaurant.name);
                await pool.query('UPDATE restaurants SET slug = ? WHERE id = ?', [slug, restaurant.id]);
            }
            
            console.log(`Updated ${restaurants.length} restaurants with slugs.`);
        } else {
            console.log('Slug column already exists.');
        }
        
        console.log('Restaurant schema update completed.');
        process.exit(0);
    } catch (error) {
        console.error('Error updating restaurant schema:', error);
        process.exit(1);
    }
}

/**
 * Generate a URL-friendly slug from a restaurant name
 * @param {string} name - Restaurant name
 * @returns {string} - URL-friendly slug
 */
function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove non-word chars
        .replace(/[\s_-]+/g, '-')  // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
}

updateRestaurantSchema(); 