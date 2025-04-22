/**
 * Restaurant Model
 * Handles all database operations related to restaurants
 */

const pool = require('../config/database');

class RestaurantModel {
    constructor() {
        // Schedule column check for next tick to allow database initialization to complete
        process.nextTick(() => {
            this.ensureColumnsExist().catch(err => {
                console.log('Warning: Initial column check failed, will retry when used:', err.message);
            });
        });
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
            throw error; // Re-throw to allow caller to handle
        }
    }

    /**
     * Make sure ensureColumnsExist has run before any database operations
     */
    async ensureColumnsExistBeforeOperation() {
        try {
            await this.ensureColumnsExist();
        } catch (error) {
            console.error('Failed to ensure columns exist before operation:', error.message);
            // Continue anyway as the operation might still succeed
        }
    }
    
    /**
     * Create a new restaurant
     * @param {Object} restaurantData - Restaurant data
     * @returns {Promise<Object>} - Created restaurant info
     */
    async create(restaurantData) {
        try {
            // Ensure columns exist before proceeding
            await this.ensureColumnsExistBeforeOperation();
            
            console.log('=== RestaurantModel.create called ===');
            console.log('Input data:', JSON.stringify(restaurantData, null, 2));
            
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
            
            console.log('=== Prepared data for SQL ===');
            console.log('Name:', name);
            console.log('Slug:', slug);
            console.log('Category:', category);
            console.log('Price Range:', price_range);
            console.log('Min Price:', min_price);
            console.log('Delivery Time:', delivery_time);
            console.log('============================');
            
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
            
            console.log('=== SQL execution result ===');
            console.log('Insert ID:', result.insertId);
            console.log('===========================');
            
            return { 
                id: result.insertId, 
                ...restaurantData,
                slug
            };
        } catch (error) {
            console.error('Error in RestaurantModel.create:', error);
            console.error('SQL Error Code:', error.code);
            console.error('SQL Error Message:', error.message);
            console.error('SQL Error SQL:', error.sql);
            throw error;
        }
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
        await this.ensureColumnsExistBeforeOperation();
        
        const { page, limit, name, isActive } = options;
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
        
        if (page !== undefined && limit !== undefined) {
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const offset = (pageNum - 1) * limitNum;
            query += ` ORDER BY name LIMIT ${limitNum} OFFSET ${offset}`;
        } else {
            query += ' ORDER BY name';
        }
        
        const [rows] = await pool.execute(query, queryParams);
        
        return rows;
    }
    
    /**
     * Get a restaurant by ID
     * @param {number} id - Restaurant ID
     * @returns {Promise<Object|null>} - Restaurant object or null
     */
    async getById(id) {
        await this.ensureColumnsExistBeforeOperation();
        
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
        await this.ensureColumnsExistBeforeOperation();
        
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
        await this.ensureColumnsExistBeforeOperation();
        
        const [rows] = await pool.execute(
            'SELECT * FROM restaurants WHERE name = ?',
            [name]
        );
        
        return rows.length > 0 ? rows[0] : null;
    }
    
    /**
     * Update a restaurant
     * @param {number} id - Restaurant ID
     * @param {Object} restaurantData - Data to update
     * @returns {Promise<boolean>} - Success status
     */
    async update(id, restaurantData) {
        try {
            await this.ensureColumnsExistBeforeOperation();
            
            console.log('=== RestaurantModel.update called ===');
            console.log('Restaurant ID:', id);
            console.log('Input data:', JSON.stringify(restaurantData, null, 2));
            
            const {
                name,
                address,
                description,
                imageUrl,
                website,
                contactPhone,
                criteria,
                isActive,
                category,
                price_range,
                min_price,
                delivery_time
            } = restaurantData;
            
            // Build set clause and params array for SQL query
            const setClauses = [];
            const params = [];
            
            if (name !== undefined) {
                setClauses.push('name = ?');
                params.push(name);
            }
            
            if (address !== undefined) {
                setClauses.push('address = ?');
                params.push(address);
            }
            
            if (description !== undefined) {
                setClauses.push('description = ?');
                params.push(description);
            }
            
            // Handle image URL properly
            if (imageUrl !== undefined) {
                setClauses.push('image_url = ?');
                params.push(imageUrl);
            }
            
            if (website !== undefined) {
                setClauses.push('website = ?');
                params.push(website);
            }
            
            if (contactPhone !== undefined) {
                setClauses.push('contact_phone = ?');
                params.push(contactPhone);
            }
            
            if (criteria !== undefined) {
                setClauses.push('criteria = ?');
                params.push(JSON.stringify(criteria));
            }
            
            if (isActive !== undefined) {
                setClauses.push('is_active = ?');
                params.push(isActive ? 1 : 0);
            }
            
            if (category !== undefined) {
                setClauses.push('category = ?');
                params.push(category);
            }
            
            if (price_range !== undefined) {
                setClauses.push('price_range = ?');
                params.push(price_range);
            }
            
            if (min_price !== undefined) {
                setClauses.push('min_price = ?');
                params.push(min_price);
            }
            
            if (delivery_time !== undefined) {
                setClauses.push('delivery_time = ?');
                params.push(delivery_time);
            }
            
            // Add where clause param
            params.push(id);
            
            // If no set clauses, return false
            if (setClauses.length === 0) {
                console.log('No fields to update');
                return false;
            }
            
            // Execute update query
            const sqlQuery = `UPDATE restaurants SET ${setClauses.join(', ')} WHERE id = ?`;
            console.log('SQL Query:', sqlQuery);
            console.log('Params:', params);
            
            await pool.execute(sqlQuery, params);
            
            // Get updated restaurant to return
            const [rows] = await pool.execute(
                'SELECT * FROM restaurants WHERE id = ?',
                [id]
            );
            
            return rows.length > 0 ? rows[0] : false;
        } catch (error) {
            console.error('Error updating restaurant:', error);
            throw error;
        }
    }
    
    /**
     * Delete a restaurant
     * @param {number} id - Restaurant ID
     * @returns {Promise<boolean>} - Success status
     */
    async delete(id) {
        await this.ensureColumnsExistBeforeOperation();
        
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
        await this.ensureColumnsExistBeforeOperation();
        
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
        await this.ensureColumnsExistBeforeOperation();
        
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
        await this.ensureColumnsExistBeforeOperation();
        
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