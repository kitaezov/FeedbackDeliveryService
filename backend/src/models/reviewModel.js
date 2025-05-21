/**
 * Модель отзывов
 * Обрабатывает все операции с базой данных, связанные с отзывами о ресторанах
 */

const pool = require('../config/database');

/**
 * Класс для работы с отзывами о ресторанах
 */
class ReviewModel {
    constructor() {
        // Initialize tables when ReviewModel is instantiated
        this.initializeTables().catch(error => {
            console.error('Error initializing tables:', error);
        });
    }

    /**
     * Инициализация необходимых таблиц
     * @returns {Promise<void>}
     */
    async initializeTables() {
        try {
            // Create review_likes table if it doesn't exist
            await pool.execute(`
                CREATE TABLE IF NOT EXISTS review_likes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    review_id INT NOT NULL,
                    user_id INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_review_like (review_id, user_id),
                    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `);

            // Create review_photos table if it doesn't exist
            await pool.execute(`
                CREATE TABLE IF NOT EXISTS review_photos (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    review_id INT NOT NULL,
                    photo_url VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
                )
            `);
        } catch (error) {
            console.error('Error initializing tables:', error);
            throw error;
        }
    }

    /**
     * Создать новый отзыв
     * @param {Object} reviewData - Данные отзыва
     * @returns {Promise<Object>} - Информация о созданном отзыве
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
     * Создать новый отзыв с фотографиями
     * @param {Object} reviewData - Данные отзыва, включая фотографии
     * @returns {Promise<Object>} - Информация о созданном отзыве
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
            
            // Сначала вставляем отзыв
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
            
            // Если есть фотографии, вставляем их
            if (photos.length > 0) {
                // Проверяем, существует ли таблица review_photos, создаем ее, если нет
                await this.ensureReviewPhotosTableExists(connection);
                
                // Вставляем каждый URL фотографии
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
     * Убедиться, что таблица review_photos существует
     * @param {Object} connection - Соединение с базой данных
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
     * Получить все отзывы
     * @param {Object} options - Параметры фильтрации и пагинации
     * @returns {Promise<Array>} - Список отзывов
     */
    async getAll({ page = 1, limit = 10, userId, restaurantName, currentUserId } = {}) {
        try {
            const offset = (page - 1) * limit;
            let query = `
                SELECT 
                    r.*,
                    u.name as user_name,
                    u.avatar,
                    COALESCE(r.likes, 0) as likes,
                    FALSE as isLikedByUser
                FROM reviews r
                LEFT JOIN users u ON r.user_id = u.id
            `;
            
            const params = [];
            
            // Build WHERE clause
            const conditions = [];
            if (userId) {
                conditions.push('r.user_id = ?');
                params.push(parseInt(userId, 10));
            }
            if (restaurantName) {
                conditions.push('r.restaurant_name = ?');
                params.push(restaurantName);
            }
            
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }
            
            // Add ORDER BY, LIMIT and OFFSET
            query += ' ORDER BY r.date DESC LIMIT ? OFFSET ?';
            params.push(parseInt(limit, 10));
            params.push(parseInt(offset, 10));
            
            const [rows] = await pool.execute(query, params);
            
            // Get photos and likes status for each review
            const reviewsWithDetails = await Promise.all(rows.map(async (review) => {
                try {
                    // Get photos if they exist
                    const photos = await this.getReviewPhotos(review.id);
                    
                    // Check if user liked this review
                    let isLikedByUser = false;
                    if (currentUserId) {
                        isLikedByUser = await this.checkLiked(review.id, currentUserId);
                    }
                    
                    return {
                        ...review,
                        photos: photos || [],
                        isLikedByUser
                    };
                } catch (error) {
                    console.error(`Error getting review details for review ${review.id}:`, error);
                    return {
                        ...review,
                        photos: [],
                        isLikedByUser: false
                    };
                }
            }));
            
            return reviewsWithDetails;
        } catch (error) {
            console.error('Error getting reviews:', error);
            throw error;
        }
    }
    
    /**
     * Получить отзыв по ID
     * @param {number} id - ID отзыва
     * @returns {Promise<Object|null>} - Объект отзыва или null
     */
    async getById(id) {
        const [rows] = await pool.execute(
            `SELECT r.*, u.name as user_name,
                   mr.response_text as response, 
                   mr.created_at as responseDate,
                   CASE WHEN mr.id IS NOT NULL THEN true ELSE false END as responded
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            LEFT JOIN manager_responses mr ON r.id = mr.review_id
            WHERE r.id = ?`,
            [id]
        );
        
        if (rows.length === 0) return null;
        
        const review = rows[0];
        
        try {
            // Проверяем, существует ли таблица review_photos
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
            
            return review;
        } catch (error) {
            console.error(`Error fetching photos for review ${review.id}:`, error);
            return review;
        }
    }
    
    /**
     * Получить фотографии для отзыва
     * @param {number} reviewId - ID отзыва
     * @returns {Promise<Array>} - Массив фотографий
     */
    async getReviewPhotos(reviewId) {
        const [rows] = await pool.execute(
            'SELECT photo_url FROM review_photos WHERE review_id = ?',
            [reviewId]
        );
        
        return rows.map(row => row.photo_url);
    }
    
    /**
     * Обновить отзыв
     * @param {number} id - ID отзыва
     * @param {Object} reviewData - Новые данные отзыва
     * @returns {Promise<boolean>} - Результат обновления
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
     * Удалить отзыв
     * @param {number} id - ID отзыва
     * @returns {Promise<boolean>} - Результат удаления
     */
    async delete(id) {
        await pool.execute('DELETE FROM reviews WHERE id = ?', [id]);
        return true;
    }

    /**
     * Сохранить удаленный отзыв
     * @param {Object} reviewData - Данные отзыва
     * @param {Object} deleteInfo - Информация об удалении
     * @returns {Promise<Object>} - Сохраненный удаленный отзыв
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
     * Получить удаленные отзывы
     * @param {Object} options - Параметры фильтрации и пагинации
     * @returns {Promise<Array>} - Список удаленных отзывов
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
     * Добавить лайк к отзыву
     * @param {number} reviewId - ID отзыва
     * @returns {Promise<boolean>} - Результат добавления
     */
    async addLike(reviewId) {
        // Обновляем счетчик лайков в отзыве
        await pool.execute(
            'UPDATE reviews SET likes = COALESCE(likes, 0) + 1 WHERE id = ?',
            [reviewId]
        );
        
        return true;
    }
    
    /**
     * Проверить, поставил ли пользователь лайк отзыву
     * @param {number} reviewId - ID отзыва
     * @param {number} userId - ID пользователя
     * @returns {Promise<boolean>} - Результат проверки
     */
    async checkLiked(reviewId, userId) {
        try {
            // Сначала проверяем, существует ли таблица review_likes
            const [tables] = await pool.execute(`
                SELECT * 
                FROM information_schema.tables
                WHERE table_schema = DATABASE()
                AND table_name = 'review_likes'
            `);
            
            // Создаем таблицу, если она не существует
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
            
            // Проверяем, поставил ли пользователь лайк этому отзыву
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
     * Записать лайк
     * @param {number} reviewId - ID отзыва
     * @param {number} userId - ID пользователя
     * @returns {Promise<boolean>} - Результат записи
     */
    async recordLike(reviewId, userId) {
        try {
            await pool.execute(
                'INSERT INTO review_likes (review_id, user_id) VALUES (?, ?)',
                [reviewId, userId]
            );
            return true;
        } catch (error) {
            // Если возникла ошибка дублирования записи, значит пользователь уже поставил лайк этому отзыву
            if (error.code === 'ER_DUP_ENTRY') {
                return false;
            }
            console.error('Error recording review like:', error);
            throw error;
        }
    }
}

module.exports = new ReviewModel(); 