/**
 * Restaurant Model
 * Handles all database operations related to restaurants
 */

const pool = require('../config/database');

class RestaurantModel {
    constructor() {
        this.ensureColumnsExist();
    }
    
    /**
     * Ensure that all required columns exist in the restaurants table
     * This method runs when the model is first initialized
     */
    async ensureColumnsExist() {
        try {
            // Проверим информацию о столбцах таблицы
            const [columns] = await pool.execute(`
                SHOW COLUMNS FROM restaurants
            `);
            
            // Создаем список имен существующих столбцов
            const existingColumns = columns.map(col => col.Field);
            
            // Список столбцов, которые нужно добавить
            const columnsToAdd = [];
            
            // Проверяем каждый столбец и добавляем его в список, если он отсутствует
            if (!existingColumns.includes('category')) {
                columnsToAdd.push('ADD COLUMN category VARCHAR(100)');
            }
            
            if (!existingColumns.includes('price_range')) {
                columnsToAdd.push('ADD COLUMN price_range VARCHAR(10)');
            }
            
            if (!existingColumns.includes('min_price')) {
                columnsToAdd.push('ADD COLUMN min_price VARCHAR(20)');
            }
            
            if (!existingColumns.includes('delivery_time')) {
                columnsToAdd.push('ADD COLUMN delivery_time VARCHAR(20)');
            }
            
            // Если есть столбцы для добавления, выполняем запрос ALTER TABLE
            if (columnsToAdd.length > 0) {
                await pool.execute(`
                    ALTER TABLE restaurants 
                    ${columnsToAdd.join(', ')}
                `);
                console.log('Добавлены новые столбцы в таблицу restaurants:', columnsToAdd);
            } else {
                console.log('Все необходимые столбцы уже существуют в таблице restaurants');
            }
        } catch (error) {
            console.error('Error ensuring restaurant table columns exist:', error);
        }
    }
    
    /**
     * Create a new restaurant
     * @param {Object} restaurantData - Restaurant data
     * @returns {Promise<Object>} - Created restaurant info
     */
    async create(restaurantData) {
        const {
            name,
            address,
            description,
            imageUrl,
            website,
            contactPhone,
            criteria = {},
            autoGenerateLink = true,
            category,
            price_range,
            min_price,
            delivery_time
        } = restaurantData;
        
        // Generate a URL-friendly slug from the name if autoGenerateLink is true
        const slug = autoGenerateLink ? this.generateSlug(name) : null;
        
        const [result] = await pool.execute(
            `INSERT INTO restaurants 
            (name, address, description, image_url, website, contact_phone, criteria, slug, category, price_range, min_price, delivery_time) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                address || null,
                description || null,
                imageUrl || null,
                website || null,
                contactPhone || null,
                JSON.stringify(criteria),
                slug,
                category || null,
                price_range || null,
                min_price || null,
                delivery_time || null
            ]
        );
        
        return { 
            id: result.insertId, 
            ...restaurantData,
            slug
        };
    }
    
    /**
     * Generate a URL-friendly slug from a restaurant name
     * @param {string} name - Restaurant name
     * @returns {string} - URL-friendly slug
     */
    generateSlug(name) {
        return name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove non-word chars
            .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    }
    
    /**
     * Get all restaurants
     * @param {Object} options - Filtering and pagination options
     * @returns {Promise<Array>} - List of restaurants
     */
    async getAll(options = {}) {
        const { page = 1, limit = 10, name, isActive } = options;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;
        
        let query = 'SELECT * FROM restaurants WHERE 1=1';
        const queryParams = [];
        
        if (name) {
            query += ' AND name LIKE ?';
            queryParams.push(`%${name}%`);
        }
        
        if (isActive !== undefined) {
            query += ' AND is_active = ?';
            queryParams.push(isActive);
        }
        
        query += ` ORDER BY name LIMIT ${limitNum} OFFSET ${offset}`;
        
        const [rows] = await pool.execute(query, queryParams);
        
        return rows;
    }
    
    /**
     * Get a restaurant by ID
     * @param {number} id - Restaurant ID
     * @returns {Promise<Object|null>} - Restaurant object or null
     */
    async getById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM restaurants WHERE id = ?',
            [id]
        );
        
        return rows.length > 0 ? rows[0] : null;
    }
    
    /**
     * Get a restaurant by slug
     * @param {string} slug - Restaurant slug
     * @returns {Promise<Object|null>} - Restaurant object or null
     */
    async getBySlug(slug) {
        const [rows] = await pool.execute(
            'SELECT * FROM restaurants WHERE slug = ?',
            [slug]
        );
        
        return rows.length > 0 ? rows[0] : null;
    }
    
    /**
     * Get a restaurant by name
     * @param {string} name - Restaurant name
     * @returns {Promise<Object|null>} - Restaurant object or null
     */
    async getByName(name) {
        const [rows] = await pool.execute(
            'SELECT * FROM restaurants WHERE name = ?',
            [name]
        );
        
        return rows.length > 0 ? rows[0] : null;
    }
    
    /**
     * Update a restaurant
     * @param {number} id - Restaurant ID
     * @param {Object} restaurantData - Restaurant data to update
     * @returns {Promise<boolean>} - Success status
     */
    async update(id, restaurantData) {
        const {
            name,
            address,
            description,
            imageUrl,
            website,
            contactPhone,
            isActive,
            criteria,
            autoGenerateLink,
            category,
            price_range,
            min_price,
            delivery_time
        } = restaurantData;
        
        // Build the dynamic UPDATE query
        let query = 'UPDATE restaurants SET updated_at = NOW()';
        const queryParams = [];
        
        // If name is being updated and autoGenerateLink is true, regenerate the slug
        if (name !== undefined) {
            query += ', name = ?';
            queryParams.push(name);
            
            if (autoGenerateLink) {
                const slug = this.generateSlug(name);
                query += ', slug = ?';
                queryParams.push(slug);
            }
        }
        
        if (address !== undefined) {
            query += ', address = ?';
            queryParams.push(address);
        }
        
        if (description !== undefined) {
            query += ', description = ?';
            queryParams.push(description);
        }
        
        if (imageUrl !== undefined) {
            query += ', image_url = ?';
            queryParams.push(imageUrl);
        }
        
        if (website !== undefined) {
            query += ', website = ?';
            queryParams.push(website);
        }
        
        if (contactPhone !== undefined) {
            query += ', contact_phone = ?';
            queryParams.push(contactPhone);
        }
        
        if (isActive !== undefined) {
            query += ', is_active = ?';
            queryParams.push(isActive);
        }
        
        if (criteria !== undefined) {
            query += ', criteria = ?';
            queryParams.push(JSON.stringify(criteria));
        }
        
        if (category !== undefined) {
            query += ', category = ?';
            queryParams.push(category);
        }
        
        if (price_range !== undefined) {
            query += ', price_range = ?';
            queryParams.push(price_range);
        }
        
        if (min_price !== undefined) {
            query += ', min_price = ?';
            queryParams.push(min_price);
        }
        
        if (delivery_time !== undefined) {
            query += ', delivery_time = ?';
            queryParams.push(delivery_time);
        }
        
        query += ' WHERE id = ?';
        queryParams.push(id);
        
        await pool.execute(query, queryParams);
        
        return true;
    }
    
    /**
     * Delete a restaurant
     * @param {number} id - Restaurant ID
     * @returns {Promise<boolean>} - Success status
     */
    async delete(id) {
        await pool.execute('DELETE FROM restaurants WHERE id = ?', [id]);
        return true;
    }
    
    /**
     * Update restaurant criteria
     * @param {number} id - Restaurant ID
     * @param {Object} criteria - Criteria data
     * @returns {Promise<boolean>} - Success status
     */
    async updateCriteria(id, criteria) {
        await pool.execute(
            'UPDATE restaurants SET criteria = ?, updated_at = NOW() WHERE id = ?',
            [JSON.stringify(criteria), id]
        );
        
        return true;
    }
    
    /**
     * Update a restaurant's slug/URL
     * @param {number} id - Restaurant ID
     * @param {string} slug - New URL slug
     * @returns {Promise<boolean>} - Success status
     */
    async updateSlug(id, slug) {
        const cleanSlug = slug
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove non-word chars
            .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
            
        await pool.execute(
            'UPDATE restaurants SET slug = ?, updated_at = NOW() WHERE id = ?',
            [cleanSlug, id]
        );
        
        return true;
    }
    
    /**
     * Search restaurants by query string (searches in name, address, and description)
     * @param {string} query - Search query
     * @returns {Promise<Array>} - List of matching restaurants
     */
    async search(query) {
        // Prepare the search query with wildcards for LIKE operation
        const searchParam = `%${query}%`;
        
        const [rows] = await pool.execute(
            `SELECT * FROM restaurants 
             WHERE name LIKE ? 
             OR address LIKE ? 
             OR description LIKE ? 
             ORDER BY 
                CASE 
                    WHEN name LIKE ? THEN 0 
                    WHEN name LIKE ? THEN 1
                    WHEN address LIKE ? THEN 2
                    ELSE 3 
                END,
                name`,
            [searchParam, searchParam, searchParam, `${query}%`, `%${query}%`, `%${query}%`]
        );
        
        return rows;
    }
}

module.exports = new RestaurantModel(); 