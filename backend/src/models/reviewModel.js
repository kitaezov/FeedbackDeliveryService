/**
 * Review Model
 * Handles all database operations related to restaurant reviews
 */

const pool = require('../config/database');

class ReviewModel {
    /**
     * Create a new review
     * @param {Object} reviewData - Review data
     * @returns {Promise<Object>} - Created review info
     */
    async create(reviewData) {
        const {
            userId,
            restaurantName,
            rating,
            comment,
            foodRating = 0,
            serviceRating = 0,
            atmosphereRating = 0,
            priceRating = 0,
            cleanlinessRating = 0
        } = reviewData;
        
        const [result] = await pool.execute(
            `INSERT INTO reviews 
            (user_id, restaurant_name, rating, comment, date, 
            food_rating, service_rating, atmosphere_rating, 
            price_rating, cleanliness_rating) 
            VALUES (?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?)`,
            [
                userId,
                restaurantName,
                rating,
                comment,
                foodRating,
                serviceRating,
                atmosphereRating,
                priceRating,
                cleanlinessRating
            ]
        );
        
        return { id: result.insertId, ...reviewData };
    }
    
    /**
     * Create a new review with photos
     * @param {Object} reviewData - Review data including photos
     * @returns {Promise<Object>} - Created review info
     */
    async createWithPhotos(reviewData) {
        const {
            userId,
            restaurantName,
            rating,
            comment,
            foodRating = 0,
            serviceRating = 0,
            atmosphereRating = 0,
            priceRating = 0,
            cleanlinessRating = 0,
            photos = []
        } = reviewData;
        
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Insert the review first
            const [reviewResult] = await connection.execute(
                `INSERT INTO reviews 
                (user_id, restaurant_name, rating, comment, date, 
                food_rating, service_rating, atmosphere_rating, 
                price_rating, cleanliness_rating) 
                VALUES (?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?)`,
                [
                    userId,
                    restaurantName,
                    rating,
                    comment,
                    foodRating,
                    serviceRating,
                    atmosphereRating,
                    priceRating,
                    cleanlinessRating
                ]
            );
            
            const reviewId = reviewResult.insertId;
            
            // If there are photos, insert them
            if (photos.length > 0) {
                // Check if the review_photos table exists, create it if not
                await this.ensureReviewPhotosTableExists(connection);
                
                // Insert each photo URL
                for (const photoUrl of photos) {
                    await connection.execute(
                        'INSERT INTO review_photos (review_id, photo_url) VALUES (?, ?)',
                        [reviewId, photoUrl]
                    );
                }
            }
            
            await connection.commit();
            
            return { 
                id: reviewId, 
                ...reviewData,
                photos
            };
        } catch (error) {
            await connection.rollback();
            console.error('Error creating review with photos:', error);
            throw error;
        } finally {
            connection.release();
        }
    }
    
    /**
     * Ensure the review_photos table exists
     * @param {Object} connection - Database connection
     * @returns {Promise<void>}
     */
    async ensureReviewPhotosTableExists(connection) {
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS review_photos (
                id INT PRIMARY KEY AUTO_INCREMENT,
                review_id INT NOT NULL,
                photo_url VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
            )
        `);
    }
    
    /**
     * Get all reviews
     * @param {Object} options - Filtering and pagination options
     * @returns {Promise<Array>} - List of reviews
     */
    async getAll(options = {}) {
        const { page = 1, limit = 10, userId, restaurantName } = options;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;
        
        let query = `
            SELECT r.*, u.name as user_name 
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE 1=1
        `;
        
        const queryParams = [];
        
        if (userId) {
            query += ' AND r.user_id = ?';
            queryParams.push(userId);
        }
        
        if (restaurantName) {
            query += ' AND r.restaurant_name LIKE ?';
            queryParams.push(`%${restaurantName}%`);
        }
        
        query += ` ORDER BY r.date DESC LIMIT ${limitNum} OFFSET ${offset}`;
        
        const [rows] = await pool.execute(query, queryParams);
        
        // Fetch photos for each review
        const reviewsWithPhotos = await Promise.all(rows.map(async (review) => {
            try {
                // Check if review_photos table exists first to avoid errors
                const [tableExists] = await pool.execute(`
                    SELECT 1 FROM information_schema.tables 
                    WHERE table_schema = DATABASE() 
                    AND table_name = 'review_photos'
                `);
                
                if (tableExists.length > 0) {
                    const photos = await this.getReviewPhotos(review.id);
                    return {
                        ...review,
                        photos
                    };
                }
                
                return {
                    ...review,
                    photos: []
                };
            } catch (error) {
                console.error(`Error fetching photos for review ${review.id}:`, error);
                return {
                    ...review,
                    photos: []
                };
            }
        }));
        
        return reviewsWithPhotos;
    }
    
    /**
     * Get a review by ID
     * @param {number} id - Review ID
     * @returns {Promise<Object|null>} - Review object or null
     */
    async getById(id) {
        const [rows] = await pool.execute(
            `SELECT r.*, u.name as user_name 
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.id = ?`,
            [id]
        );
        
        if (rows.length === 0) return null;
        
        const review = rows[0];
        
        try {
            // Check if review_photos table exists
            const [tableExists] = await pool.execute(`
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = DATABASE() 
                AND table_name = 'review_photos'
            `);
            
            if (tableExists.length > 0) {
                const photos = await this.getReviewPhotos(review.id);
                return {
                    ...review,
                    photos
                };
            }
        } catch (error) {
            console.error(`Error fetching photos for review ${id}:`, error);
        }
        
        return {
            ...review,
            photos: []
        };
    }
    
    /**
     * Get all photos for a review
     * @param {number} reviewId - Review ID
     * @returns {Promise<Array>} - Array of photo URLs
     */
    async getReviewPhotos(reviewId) {
        const [rows] = await pool.execute(
            'SELECT photo_url FROM review_photos WHERE review_id = ?',
            [reviewId]
        );
        
        return rows.map(row => row.photo_url);
    }
    
    /**
     * Update a review
     * @param {number} id - Review ID
     * @param {Object} reviewData - Review data to update
     * @returns {Promise<boolean>} - Success status
     */
    async update(id, reviewData) {
        const {
            rating,
            comment,
            foodRating,
            serviceRating,
            atmosphereRating,
            priceRating,
            cleanlinessRating
        } = reviewData;
        
        await pool.execute(
            `UPDATE reviews 
            SET rating = ?, comment = ?, 
            food_rating = ?, service_rating = ?, 
            atmosphere_rating = ?, price_rating = ?, 
            cleanliness_rating = ? 
            WHERE id = ?`,
            [
                rating,
                comment,
                foodRating,
                serviceRating,
                atmosphereRating,
                priceRating,
                cleanlinessRating,
                id
            ]
        );
        
        return true;
    }
    
    /**
     * Delete a review
     * @param {number} id - Review ID
     * @returns {Promise<boolean>} - Success status
     */
    async delete(id) {
        await pool.execute('DELETE FROM reviews WHERE id = ?', [id]);
        return true;
    }

    /**
     * Save a deleted review with deletion reason
     * @param {Object} reviewData - Original review data
     * @param {Object} deleteInfo - Deletion information
     * @returns {Promise<Object>} - Saved deleted review info
     */
    async saveDeletedReview(reviewData, deleteInfo) {
        const {
            id: review_id,
            user_id,
            restaurant_name,
            rating,
            comment,
            date,
            food_rating,
            service_rating,
            atmosphere_rating,
            price_rating,
            cleanliness_rating,
            user_name
        } = reviewData;

        const {
            deletedBy,
            reason,
            adminName
        } = deleteInfo;

        const [result] = await pool.execute(
            `INSERT INTO deleted_reviews 
            (review_id, user_id, restaurant_name, rating, comment, date, 
            food_rating, service_rating, atmosphere_rating, price_rating, 
            cleanliness_rating, deleted_by, deletion_reason, user_name, admin_name) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                review_id,
                user_id,
                restaurant_name,
                rating,
                comment,
                date,
                food_rating,
                service_rating,
                atmosphere_rating,
                price_rating,
                cleanliness_rating,
                deletedBy,
                reason,
                user_name,
                adminName
            ]
        );

        return { 
            id: result.insertId, 
            reviewId: review_id,
            userId: user_id,
            restaurantName: restaurant_name,
            deletedBy,
            reason
        };
    }

    /**
     * Get all deleted reviews
     * @param {Object} options - Filtering and pagination options
     * @returns {Promise<Array>} - List of deleted reviews
     */
    async getDeletedReviews(options = {}) {
        const { page = 1, limit = 10, deletedBy } = options;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;
        
        let query = `
            SELECT dr.*, 
                   u1.name as user_name, 
                   u2.name as admin_name
            FROM deleted_reviews dr
            LEFT JOIN users u1 ON dr.user_id = u1.id
            LEFT JOIN users u2 ON dr.deleted_by = u2.id
            WHERE 1=1
        `;
        
        const queryParams = [];
        
        if (deletedBy) {
            query += ' AND dr.deleted_by = ?';
            queryParams.push(deletedBy);
        }
        
        query += ` ORDER BY dr.deleted_at DESC LIMIT ${limitNum} OFFSET ${offset}`;
        
        const [rows] = await pool.execute(query, queryParams);
        
        return rows;
    }

    /**
     * Add a like to a review
     * @param {number} reviewId - Review ID
     * @returns {Promise<boolean>} - Success status
     */
    async addLike(reviewId) {
        // Update the likes count in the review
        await pool.execute(
            'UPDATE reviews SET likes = COALESCE(likes, 0) + 1 WHERE id = ?',
            [reviewId]
        );
        
        return true;
    }
    
    /**
     * Check if a review has been liked by a user
     * @param {number} reviewId - Review ID
     * @param {number} userId - User ID
     * @returns {Promise<boolean>} - Whether the user has liked the review
     */
    async checkLiked(reviewId, userId) {
        try {
            // First check if the review_likes table exists
            const [tables] = await pool.execute(`
                SELECT * 
                FROM information_schema.tables
                WHERE table_schema = DATABASE()
                AND table_name = 'review_likes'
            `);
            
            // Create the table if it doesn't exist
            if (tables.length === 0) {
                await pool.execute(`
                    CREATE TABLE review_likes (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        review_id INT NOT NULL,
                        user_id INT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE KEY unique_review_like (review_id, user_id),
                        FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                    )
                `);
            }
            
            // Check if the user has already liked this review
            const [rows] = await pool.execute(
                'SELECT 1 FROM review_likes WHERE review_id = ? AND user_id = ?',
                [reviewId, userId]
            );
            
            return rows.length > 0;
        } catch (error) {
            console.error('Error checking if review was liked:', error);
            return false;
        }
    }
    
    /**
     * Record a like from a user for a review
     * @param {number} reviewId - Review ID
     * @param {number} userId - User ID
     * @returns {Promise<boolean>} - Success status
     */
    async recordLike(reviewId, userId) {
        try {
            await pool.execute(
                'INSERT INTO review_likes (review_id, user_id) VALUES (?, ?)',
                [reviewId, userId]
            );
            return true;
        } catch (error) {
            // If there's a duplicate entry error, it means the user already liked this review
            if (error.code === 'ER_DUP_ENTRY') {
                return false;
            }
            console.error('Error recording review like:', error);
            throw error;
        }
    }
}

module.exports = new ReviewModel(); 