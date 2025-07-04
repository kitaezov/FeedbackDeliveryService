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
        this.initialized = false;
        this.initPromise = this.initializeTables().catch(error => {
            console.error('Ошибка инициализации таблиц:', error);
            throw error;
        });
    }

    /**
     * Инициализация необходимых таблиц
     * @returns {Promise<void>}
     */
    async initializeTables() {
        try {
            // Проверяем, существует ли таблица отзывов
            const [reviewsExists] = await pool.execute(`
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = DATABASE() 
                AND table_name = 'reviews'
            `);
            
            if (reviewsExists.length > 0) {
                console.log('Таблица отзывов уже существует, пропускаем создание');
                
                // Проверяем, существуют ли необходимые столбцы в таблице отзывов
                await this.ensureColumnsExist();
                
                // Проверяем, существует ли таблица удаленных отзывов
                await this.ensureDeletedReviewsTableExists();
                
                this.initialized = true;
                return;
            }
            
            // Создаем таблицу пользователей, если она не существует
            await pool.execute(`
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    role ENUM('user', 'manager', 'admin', 'head_admin') DEFAULT 'user',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    is_blocked BOOLEAN DEFAULT FALSE,
                    blocked_reason TEXT,
                    avatar VARCHAR(255),
                    phone_number VARCHAR(20),
                    birth_date DATE,
                    total_likes INT DEFAULT 0,
                    likes_received INT DEFAULT 0
                )
            `);
            console.log('Таблица пользователей инициализирована');

            // Создаем таблицу отзывов, если она не существует
            await pool.execute(`
                CREATE TABLE IF NOT EXISTS reviews (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    restaurant_id INT,
                    restaurant_name VARCHAR(100) NOT NULL,
                    rating INT NOT NULL,
                    comment TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    likes INT DEFAULT 0,
                    food_rating INT DEFAULT 0,
                    service_rating INT DEFAULT 0,
                    atmosphere_rating INT DEFAULT 0,
                    price_rating INT DEFAULT 0,
                    cleanliness_rating INT DEFAULT 0,
                    response TEXT NULL,
                    response_date TIMESTAMP NULL,
                    responded_by INT NULL,
                    manager_name VARCHAR(100) NULL,
                    deleted BOOLEAN DEFAULT FALSE,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `);
            console.log('Таблица отзывов инициализирована');

            // Создаем таблицу голосов за отзывы, если она не существует
            await pool.execute(`
                CREATE TABLE IF NOT EXISTS review_votes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    review_id INT NOT NULL,
                    user_id INT NOT NULL,
                    vote_type ENUM('up', 'down') NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_review_vote (review_id, user_id),
                    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `);
            console.log('Таблица голосов за отзывы инициализирована');

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
            console.log('Таблица фотографий отзывов инициализирована');

            // Ensure deleted_reviews table exists
            await this.ensureDeletedReviewsTableExists();

            this.initialized = true;
        } catch (error) {
            console.error('Ошибка инициализации таблиц:', error);
            // Устанавливаем initialized в true, чтобы избежать блокировки операций
            this.initialized = true;
        }
    }
    
    /**
     * Ensure all necessary columns exist in the reviews table
     * @returns {Promise<void>}
     */
    async ensureColumnsExist() {
        try {
            // Check if responded_by column exists in reviews table, if not add it
            try {
                await pool.execute(`
                    SELECT responded_by FROM reviews LIMIT 1
                `);
                console.log('Столбец responded_by уже существует в таблице отзывов');
            } catch (error) {
                if (error.code === 'ER_BAD_FIELD_ERROR') {
                    console.log('Добавление столбца responded_by в таблицу отзывов');
                    await pool.execute(`
                        ALTER TABLE reviews 
                        ADD COLUMN responded_by INT NULL
                    `);
                    console.log('Столбец responded_by добавлен в таблицу отзывов');
                } else {
                    throw error;
                }
            }
            
            // Check if manager_name column exists in reviews table, if not add it
            try {
                await pool.execute(`
                    SELECT manager_name FROM reviews LIMIT 1
                `);
                console.log('Столбец manager_name уже существует в таблице отзывов');
            } catch (error) {
                if (error.code === 'ER_BAD_FIELD_ERROR') {
                    console.log('Добавление столбца manager_name в таблицу отзывов');
                    await pool.execute(`
                        ALTER TABLE reviews 
                        ADD COLUMN manager_name VARCHAR(100) NULL
                    `);
                    console.log('Столбец manager_name добавлен в таблицу отзывов');
                } else {
                    throw error;
                }
            }

            // Check if deleted column exists in reviews table, if not add it
            try {
                await pool.execute(`
                    SELECT deleted FROM reviews LIMIT 1
                `);
                console.log('Столбец deleted уже существует в таблице отзывов');
            } catch (error) {
                if (error.code === 'ER_BAD_FIELD_ERROR') {
                    console.log('Добавление столбца deleted в таблицу отзывов');
                    await pool.execute(`
                        ALTER TABLE reviews 
                        ADD COLUMN deleted BOOLEAN DEFAULT FALSE
                    `);
                    console.log('Столбец deleted добавлен в таблицу отзывов');
                } else {
                    throw error;
                }
            }

            // Update any NULL deleted values to FALSE
            await pool.execute(`
                UPDATE reviews SET deleted = FALSE WHERE deleted IS NULL
            `);
            console.log('Обновлены значения NULL в столбце deleted на FALSE');
        } catch (error) {
            console.error('Ошибка при проверке наличия столбцов:', error);
        }
    }

    /**
     * Ensure deleted_reviews table exists
     * @returns {Promise<void>}
     */
    async ensureDeletedReviewsTableExists() {
        try {
            // Check if deleted_reviews table exists
            const [tableExists] = await pool.execute(`
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = DATABASE() 
                AND table_name = 'deleted_reviews'
            `);
            
            if (tableExists.length > 0) {
                console.log('deleted_reviews table already exists');
                return;
            }
            
            // Create deleted_reviews table with a simplified structure
            // Using 'id' as the primary key and without 'review_id'
            await pool.execute(`
                CREATE TABLE IF NOT EXISTS deleted_reviews (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    restaurant_name VARCHAR(100) NOT NULL,
                    rating DECIMAL(2, 1) NOT NULL,
                    comment TEXT,
                    deleted_by INT NOT NULL,
                    deletion_reason TEXT NOT NULL,
                    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    user_name VARCHAR(100),
                    admin_name VARCHAR(100),
                    INDEX deleted_reviews_user_id_idx (user_id),
                    INDEX deleted_reviews_deleted_by_idx (deleted_by)
                )
            `);
            console.log('deleted_reviews table created with simplified structure');
        } catch (error) {
            console.error('Error ensuring deleted_reviews table exists:', error);
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
            restaurantCategory,
            rating,
            comment,
            foodRating = 0,
            serviceRating = 0,
            atmosphereRating = 0,
            priceRating = 0,
            cleanlinessRating = 0,
            deliverySpeedRating = 0,
            deliveryQualityRating = 0,
            reviewType = 'inRestaurant'
        } = reviewData;
        
        console.log('Creating new review:', reviewData);
        
        // Получаем или создаем ресторан
        let [restaurant] = await pool.execute(
            'SELECT id, category FROM restaurants WHERE name = ?',
            [restaurantName]
        );
        
        let restaurantId;
        if (restaurant && restaurant.length > 0) {
            restaurantId = restaurant[0].id;
            // Обновляем категорию ресторана, если она изменилась
            if (restaurantCategory && restaurant[0].category !== restaurantCategory) {
                await pool.execute(
                    'UPDATE restaurants SET category = ? WHERE id = ?',
                    [restaurantCategory, restaurantId]
                );
            }
        } else {
            // Создаем новый ресторан
            const [result] = await pool.execute(
                'INSERT INTO restaurants (name, category) VALUES (?, ?)',
                [restaurantName, restaurantCategory || 'russian']
            );
            restaurantId = result.insertId;
        }

        // Проверяем, есть ли в таблице reviews необходимые столбцы для рейтингов доставки
        await this.ensureDeliveryRatingColumnsExist();

        // Создаем отзыв
        const [result] = await pool.execute(
            `INSERT INTO reviews (
                user_id, 
                restaurant_id, 
                restaurant_name, 
                rating, 
                comment, 
                food_rating, 
                service_rating, 
                atmosphere_rating, 
                price_rating, 
                cleanliness_rating,
                delivery_speed_rating,
                delivery_quality_rating,
                review_type,
                deleted
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
            [
                userId,
                restaurantId,
                restaurantName,
                rating,
                comment,
                foodRating,
                serviceRating,
                atmosphereRating,
                priceRating,
                cleanlinessRating,
                deliverySpeedRating,
                deliveryQualityRating,
                reviewType
            ]
        );

        // Получаем созданный отзыв
        const [reviews] = await pool.execute(
            'SELECT * FROM reviews WHERE id = ?',
            [result.insertId]
        );
        
        if (reviews.length === 0) {
            console.error('Failed to retrieve created review');
            throw new Error('Failed to create review');
        }
        
        console.log('Created review:', reviews[0]);
        
        // Проверяем, что отзыв не помечен как удаленный
        if (reviews[0].deleted === 1) {
            console.error('Warning: Created review is marked as deleted');
            // Исправляем это
            await pool.execute(
                'UPDATE reviews SET deleted = 0 WHERE id = ?',
                [result.insertId]
            );
            reviews[0].deleted = 0;
        }

        return reviews[0];
    }
    
    /**
     * Проверяет и добавляет столбцы для рейтингов доставки, если их нет
     * @param {Object} connection - Опциональное соединение с базой данных
     */
    async ensureDeliveryRatingColumnsExist(connection = null) {
        const db = connection || pool;
        try {
            // Проверяем наличие столбца delivery_speed_rating
            try {
                await db.execute('SELECT delivery_speed_rating FROM reviews LIMIT 1');
                console.log('Столбец delivery_speed_rating уже существует');
            } catch (error) {
                if (error.code === 'ER_BAD_FIELD_ERROR') {
                    console.log('Добавление столбца delivery_speed_rating в таблицу отзывов');
                    await db.execute('ALTER TABLE reviews ADD COLUMN delivery_speed_rating INT DEFAULT 0');
                    console.log('Столбец delivery_speed_rating добавлен');
                } else {
                    throw error;
                }
            }
            
            // Проверяем наличие столбца delivery_quality_rating
            try {
                await db.execute('SELECT delivery_quality_rating FROM reviews LIMIT 1');
                console.log('Столбец delivery_quality_rating уже существует');
            } catch (error) {
                if (error.code === 'ER_BAD_FIELD_ERROR') {
                    console.log('Добавление столбца delivery_quality_rating в таблицу отзывов');
                    await db.execute('ALTER TABLE reviews ADD COLUMN delivery_quality_rating INT DEFAULT 0');
                    console.log('Столбец delivery_quality_rating добавлен');
                } else {
                    throw error;
                }
            }
            
            // Проверяем наличие столбца review_type
            try {
                await db.execute('SELECT review_type FROM reviews LIMIT 1');
                console.log('Столбец review_type уже существует');
            } catch (error) {
                if (error.code === 'ER_BAD_FIELD_ERROR') {
                    console.log('Добавление столбца review_type в таблицу отзывов');
                    await db.execute('ALTER TABLE reviews ADD COLUMN review_type VARCHAR(20) DEFAULT "inRestaurant"');
                    console.log('Столбец review_type добавлен');
                } else {
                    throw error;
                }
            }
        } catch (error) {
            console.error('Ошибка при проверке столбцов рейтингов доставки:', error);
        }
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
            restaurantCategory,
            rating,
            comment,
            foodRating = 0,
            serviceRating = 0,
            atmosphereRating = 0,
            priceRating = 0,
            cleanlinessRating = 0,
            deliverySpeedRating = 0,
            deliveryQualityRating = 0,
            reviewType = 'inRestaurant',
            photos = []
        } = reviewData;
        
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Получаем или создаем ресторан
            let [restaurant] = await connection.execute(
                'SELECT id, category FROM restaurants WHERE name = ?',
                [restaurantName]
            );
            
            let restaurantId;
            if (restaurant && restaurant.length > 0) {
                restaurantId = restaurant[0].id;
                // Обновляем категорию ресторана, если она изменилась
                if (restaurantCategory && restaurant[0].category !== restaurantCategory) {
                    await connection.execute(
                        'UPDATE restaurants SET category = ? WHERE id = ?',
                        [restaurantCategory, restaurantId]
                    );
                }
            } else {
                // Создаем новый ресторан
                const [result] = await connection.execute(
                    'INSERT INTO restaurants (name, category) VALUES (?, ?)',
                    [restaurantName, restaurantCategory || 'russian']
                );
                restaurantId = result.insertId;
            }
            
            // Проверяем, есть ли в таблице reviews необходимые столбцы для рейтингов доставки
            await this.ensureDeliveryRatingColumnsExist(connection);
            
            // Сначала вставляем отзыв
            const [reviewResult] = await connection.execute(
                `INSERT INTO reviews 
                (user_id, restaurant_id, restaurant_name, rating, comment, 
                food_rating, service_rating, atmosphere_rating, 
                price_rating, cleanliness_rating, delivery_speed_rating, 
                delivery_quality_rating, review_type, deleted) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
                [
                    userId,
                    restaurantId,
                    restaurantName,
                    rating,
                    comment,
                    foodRating,
                    serviceRating,
                    atmosphereRating,
                    priceRating,
                    cleanlinessRating,
                    deliverySpeedRating,
                    deliveryQualityRating,
                    reviewType
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
                restaurant_id: restaurantId,
                restaurant_category: restaurantCategory,
                photos
            };
        } catch (error) {
            await connection.rollback();
            console.error('Ошибка при создании отзыва с фотографиями:', error);
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
    async getAll({ page = 1, limit = 10, userId, restaurantName, restaurantId, currentUserId, sortBy = 'latest' } = {}) {
        try {
            // Wait for tables to be initialized
            if (!this.initialized) {
                await this.initPromise;
            }

            console.log('getAll called with params:', { page, limit, userId, restaurantName, restaurantId, currentUserId, sortBy });

            // Добавляем прямой запрос для проверки наличия отзывов в базе данных
            try {
                const [allReviews] = await pool.execute('SELECT COUNT(*) as total FROM reviews');
                console.log('Total reviews in database:', allReviews[0].total);
                
                if (userId) {
                    const [userReviews] = await pool.execute('SELECT COUNT(*) as total FROM reviews WHERE user_id = ?', [userId]);
                    console.log(`Reviews for user ${userId} in database:`, userReviews[0].total);
                }
                
                if (restaurantId) {
                    const [restaurantReviews] = await pool.execute('SELECT COUNT(*) as total FROM reviews WHERE restaurant_id = ?', [restaurantId]);
                    console.log(`Reviews for restaurant ${restaurantId} in database:`, restaurantReviews[0].total);
                }
                
                const [deletedReviewsCount] = await pool.execute('SELECT COUNT(*) as total FROM reviews WHERE deleted = 1');
                console.log('Deleted reviews in database:', deletedReviewsCount[0].total);
                
                const [nonDeletedReviewsCount] = await pool.execute('SELECT COUNT(*) as total FROM reviews WHERE deleted = 0 OR deleted IS NULL');
                console.log('Non-deleted reviews in database:', nonDeletedReviewsCount[0].total);
                
                // Проверяем все отзывы в базе данных
                const [allReviewsData] = await pool.execute('SELECT id, user_id, restaurant_id, restaurant_name, rating, deleted FROM reviews');
                console.log('All reviews in database:', allReviewsData);
            } catch (error) {
                console.error('Error checking database reviews:', error);
            }

            let query = `
                SELECT 
                    r.*,
                    u.name as user_name,
                    u.avatar,
                    COALESCE(rest.category, 'russian') as restaurant_category,
                    COALESCE(r.likes, 0) as likes,
                    r.response,
                    r.response_date,
                    r.manager_name
                FROM reviews r
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN restaurants rest ON r.restaurant_id = rest.id
            `;

            const params = [];

            // Добавляем условия фильтрации
            // Важно: явно преобразуем deleted в число или NULL для правильного сравнения
            const conditions = ['(r.deleted = 0 OR r.deleted IS NULL)']; 
            
            if (userId) {
                conditions.push('r.user_id = ?');
                params.push(userId);
            }
            if (restaurantName) {
                conditions.push('r.restaurant_name LIKE ?');
                params.push(`%${restaurantName}%`);
            }
            if (restaurantId) {
                conditions.push('r.restaurant_id = ?');
                params.push(restaurantId);
            }

            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            // Сортировка
            switch (sortBy) {
                case 'rating':
                    query += ' ORDER BY r.rating DESC';
                    break;
                case 'likes':
                    query += ' ORDER BY likes DESC';
                    break;
                case 'oldest':
                    query += ' ORDER BY r.created_at ASC';
                    break;
                case 'latest':
                default:
                    query += ' ORDER BY r.created_at DESC';
            }

            // Пагинация
            const offset = (page - 1) * limit;
            query += ` LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

            // Log the query and parameters for debugging
            console.log('Reviews query:', query);
            console.log('Query parameters:', params);

            // Выполняем запрос
            const [reviews] = await pool.execute(query, params);
            console.log(`Found ${reviews.length} reviews`);
            
            // Debug: Check if any reviews have the deleted flag set
            const deletedReviews = reviews.filter(r => r.deleted === 1);
            if (deletedReviews.length > 0) {
                console.warn(`Warning: Found ${deletedReviews.length} reviews with deleted flag set that should have been filtered out`);
            }

            // Получаем общее количество отзывов для пагинации
            let countQuery = `
                SELECT COUNT(DISTINCT r.id) as total
                FROM reviews r
                WHERE (r.deleted = 0 OR r.deleted IS NULL)
            `;
            
            const countParams = [];
            
            if (userId) {
                countQuery += ' AND r.user_id = ?';
                countParams.push(userId);
            }
            if (restaurantName) {
                countQuery += ' AND r.restaurant_name LIKE ?';
                countParams.push(`%${restaurantName}%`);
            }
            if (restaurantId) {
                countQuery += ' AND r.restaurant_id = ?';
                countParams.push(restaurantId);
            }

            const [countResult] = await pool.execute(countQuery, countParams);
            const total = countResult[0].total;

            // Получаем фотографии для каждого отзыва
            for (const review of reviews) {
                try {
                    // Check if review_photos table exists before querying
                    const [tableExists] = await pool.execute(`
                        SELECT 1 FROM information_schema.tables 
                        WHERE table_schema = DATABASE() 
                        AND table_name = 'review_photos'
                    `);
                    
                    if (tableExists.length > 0) {
                        const photos = await this.getReviewPhotos(review.id);
                        review.photos = photos;
                    } else {
                        review.photos = [];
                    }
                } catch (error) {
                    console.error(`Error fetching photos for review ${review.id}:`, error);
                    review.photos = [];
                }
            }

            // Получаем информацию о голосах, если есть currentUserId
            if (currentUserId) {
                for (const review of reviews) {
                    try {
                        // Check if review_votes table exists before querying
                        const [tableExists] = await pool.execute(`
                            SELECT 1 FROM information_schema.tables 
                            WHERE table_schema = DATABASE() 
                            AND table_name = 'review_votes'
                        `);
                        
                        if (tableExists.length > 0) {
                            const [votes] = await pool.execute(
                                'SELECT vote_type FROM review_votes WHERE review_id = ? AND user_id = ?',
                                [review.id, currentUserId]
                            );
                            review.isLikedByUser = votes.length > 0 && votes[0].vote_type === 'up';
                            review.userVoteType = votes.length > 0 ? votes[0].vote_type : null;
                        } else {
                            review.isLikedByUser = false;
                            review.userVoteType = null;
                        }
                    } catch (error) {
                        console.error(`Error fetching votes for review ${review.id}:`, error);
                        review.isLikedByUser = false;
                        review.userVoteType = null;
                    }
                }
            }

            // Преобразуем поле deleted в булево значение для совместимости с фронтендом
            const processedReviews = reviews.map(review => {
                // Convert deleted from 0/1 to boolean
                const deleted = review.deleted === 1;
                
                // Format the author object correctly
                const author = {
                    id: review.user_id,
                    name: review.user_name || 'Unknown User',
                    avatar: review.avatar || null
                };
                
                // Format the ratings object
                const ratings = {
                    food: review.food_rating || 0,
                    service: review.service_rating || 0,
                    atmosphere: review.atmosphere_rating || 0,
                    price: review.price_rating || 0,
                    cleanliness: review.cleanliness_rating || 0
                };
                
                // Format dates
                const created_at = review.created_at ? new Date(review.created_at).toISOString() : new Date().toISOString();
                const updated_at = review.updated_at ? new Date(review.updated_at).toISOString() : created_at;
                
                // Ensure user_name is available for display in the frontend
                const user_name = review.user_name || author.name || 'Unknown User';
                
                // Return the properly formatted review object
                return {
                    id: review.id,
                    user_id: review.user_id,
                    restaurant_name: review.restaurant_name,
                    rating: review.rating,
                    comment: review.comment,
                    created_at,
                    updated_at,
                    likes: review.likes || 0,
                    deleted,
                    author,
                    ratings,
                    date: created_at,
                    user_name, // Ensure user_name is explicitly included
                    userName: user_name, // Add userName as an alias for compatibility
                    name: user_name, // Add name as another alias for compatibility
                    photos: review.photos || [],
                    isLikedByUser: review.isLikedByUser || false,
                    userVoteType: review.userVoteType || null,
                    response: review.response || '',
                    response_date: review.response_date ? new Date(review.response_date).toISOString() : null,
                    manager_name: review.manager_name || '',
                    responded: Boolean(review.response)
                };
            });

            return {
                reviews: processedReviews,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error getting reviews:', error);
            // Return empty reviews array instead of throwing
            return {
                reviews: [],
                pagination: {
                    total: 0,
                    page,
                    limit,
                    totalPages: 0
                }
            };
        }
    }
    
    /**
     * Получить отзыв по ID
     * @param {number} id - ID отзыва
     * @returns {Promise<Object|null>} - Объект отзыва или null
     */
    async getById(id) {
        try {
            // First check if manager_responses table exists
            const [managerResponsesExists] = await pool.execute(`
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = DATABASE() 
                AND table_name = 'manager_responses'
            `);
            
            let query;
            if (managerResponsesExists.length > 0) {
                // If manager_responses table exists, use the join
                query = `
                    SELECT r.*, u.name as user_name,
                           mr.response_text as response, 
                           mr.created_at as responseDate,
                           CASE WHEN mr.id IS NOT NULL THEN true ELSE false END as responded
                    FROM reviews r
                    LEFT JOIN users u ON r.user_id = u.id
                    LEFT JOIN manager_responses mr ON r.id = mr.review_id
                    WHERE r.id = ?
                `;
            } else {
                // If manager_responses table doesn't exist, use a simpler query
                query = `
                    SELECT r.*, u.name as user_name,
                           r.response,
                           r.response_date as responseDate,
                           CASE WHEN r.response IS NOT NULL AND r.response != '' THEN true ELSE false END as responded
                    FROM reviews r
                    LEFT JOIN users u ON r.user_id = u.id
                    WHERE r.id = ?
                `;
            }
            
            const [rows] = await pool.execute(query, [id]);
            
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
                return {
                    ...review,
                    photos: []
                };
            }
        } catch (error) {
            console.error(`Error fetching review with id ${id}:`, error);
            return null;
        }
    }
    
    /**
     * Получить фотографии для отзыва
     * @param {number} reviewId - ID отзыва
     * @returns {Promise<Array>} - Массив фотографий
     */
    async getReviewPhotos(reviewId) {
        try {
            // Check if the review_photos table exists
            const [tableExists] = await pool.execute(`
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = DATABASE() 
                AND table_name = 'review_photos'
            `);
            
            if (tableExists.length === 0) {
                return [];
            }
            
            const [rows] = await pool.execute(
                'SELECT photo_url FROM review_photos WHERE review_id = ?',
                [reviewId]
            );
            
            return rows.map(row => row.photo_url);
        } catch (error) {
            console.error(`Error fetching photos for review ${reviewId}:`, error);
            return [];
        }
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
        try {
            // Check if the deleted column exists in the reviews table
            const [columns] = await pool.execute(`
                SHOW COLUMNS FROM reviews LIKE 'deleted'
            `);
            
            if (columns.length > 0) {
                // If the deleted column exists, mark the review as deleted
                await pool.execute('UPDATE reviews SET deleted = 1 WHERE id = ?', [id]);
                console.log(`Review ${id} marked as deleted`);
            } else {
                // If the deleted column doesn't exist, perform a hard delete
                console.warn(`'deleted' column not found in reviews table, performing hard delete for review ${id}`);
                await pool.execute('DELETE FROM reviews WHERE id = ?', [id]);
                console.log(`Review ${id} hard deleted`);
            }
            return true;
        } catch (error) {
            console.error(`Error deleting review ${id}:`, error);
            // If all else fails, attempt a direct delete
            try {
                await pool.execute('DELETE FROM reviews WHERE id = ?', [id]);
                console.log(`Review ${id} deleted after error recovery`);
                return true;
            } catch (secondError) {
                console.error(`Failed to delete review ${id} after error recovery:`, secondError);
                throw secondError;
            }
        }
    }

    /**
     * Сохранить удаленный отзыв
     * @param {Object} reviewData - Данные отзыва
     * @param {Object} deleteInfo - Информация об удалении
     * @returns {Promise<Object>} - Сохраненный удаленный отзыв
     */
    async saveDeletedReview(reviewData, deleteInfo) {
        const {
            id: reviewId,
            user_id,
            restaurant_name,
            rating,
            comment,
            created_at,
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

        try {
            // Convert created_at to a date format if needed
            const date = created_at ? new Date(created_at).toISOString().split('T')[0] : null;

            // First check if the deleted_reviews table has the expected structure
            try {
                const [columns] = await pool.execute(`
                    SHOW COLUMNS FROM deleted_reviews
                `);
                
                const columnNames = columns.map(col => col.Field);
                console.log('Columns in deleted_reviews table:', columnNames);
                
                // Check if review_id column exists
                const hasReviewId = columnNames.includes('review_id');
                
                if (hasReviewId) {
                    // Use the original structure with review_id
                    const [result] = await pool.execute(
                        `INSERT INTO deleted_reviews 
                        (review_id, user_id, restaurant_name, rating, comment, date, 
                        food_rating, service_rating, atmosphere_rating, price_rating, 
                        cleanliness_rating, deleted_by, deletion_reason, user_name, admin_name) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            reviewId,
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
                        reviewId: reviewId,
                        userId: user_id,
                        restaurantName: restaurant_name,
                        deletedBy,
                        reason
                    };
                } else {
                    // Alternative structure without review_id
                    // Create a simplified insert with just the essential fields
                    const [result] = await pool.execute(
                        `INSERT INTO deleted_reviews 
                        (id, user_id, restaurant_name, rating, comment, 
                        deleted_by, deletion_reason, deleted_at) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
                        [
                            reviewId,  // Use the original review ID as the ID in deleted_reviews
                            user_id,
                            restaurant_name,
                            rating,
                            comment,
                            deletedBy,
                            reason
                        ]
                    );
                    
                    return { 
                        id: result.insertId || reviewId, 
                        reviewId: reviewId,
                        userId: user_id,
                        restaurantName: restaurant_name,
                        deletedBy,
                        reason
                    };
                }
            } catch (error) {
                console.error('Error checking deleted_reviews table structure:', error);
                
                // Fallback to a very basic insert
                const [result] = await pool.execute(
                    `INSERT INTO deleted_reviews 
                    (id, user_id, restaurant_name, rating, comment, deleted_by, deletion_reason) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        reviewId,
                        user_id,
                        restaurant_name,
                        rating,
                        comment,
                        deletedBy,
                        reason
                    ]
                );
                
                return { 
                    id: result.insertId || reviewId, 
                    reviewId: reviewId,
                    userId: user_id,
                    restaurantName: restaurant_name,
                    deletedBy,
                    reason
                };
            }
        } catch (error) {
            console.error('Error saving deleted review:', error);
            
            // If all else fails, just return success without actually saving
            // This prevents the deletion process from failing completely
            console.warn('Returning mock success for deleted review to allow deletion to proceed');
            return { 
                id: reviewId, 
                reviewId: reviewId,
                userId: user_id,
                restaurantName: restaurant_name,
                deletedBy,
                reason,
                mock: true
            };
        }
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
     * Добавить голос к отзыву
     * @param {number} reviewId - ID отзыва
     * @param {string} voteType - Тип голоса ('up' или 'down')
     * @returns {Promise<boolean>} - Результат добавления
     */
    async addVote(reviewId, voteType) {
        // Обновляем счетчик голосов в отзыве
        await pool.execute(
            'UPDATE reviews SET likes = COALESCE(likes, 0) + ? WHERE id = ?',
            [voteType === 'up' ? 1 : -1, reviewId]
        );
        
        return true;
    }
    
    /**
     * Проверить, голосовал ли пользователь за отзыв
     * @param {number} reviewId - ID отзыва
     * @param {number} userId - ID пользователя
     * @returns {Promise<{voted: boolean, voteType: string|null}>} - Результат проверки
     */
    async checkVoted(reviewId, userId) {
        try {
            const [rows] = await pool.execute(
                'SELECT vote_type FROM review_votes WHERE review_id = ? AND user_id = ?',
                [reviewId, userId]
            );
            
            return {
                voted: rows.length > 0,
                voteType: rows.length > 0 ? rows[0].vote_type : null
            };
        } catch (error) {
            console.error('Error checking if review was voted:', error);
            return { voted: false, voteType: null };
        }
    }
    
    /**
     * Записать голос
     * @param {number} reviewId - ID отзыва
     * @param {number} userId - ID пользователя
     * @param {string} voteType - Тип голоса ('up' или 'down')
     * @returns {Promise<boolean>} - Результат записи
     */
    async recordVote(reviewId, userId, voteType) {
        try {
            await pool.execute(
                'INSERT INTO review_votes (review_id, user_id, vote_type) VALUES (?, ?, ?)',
                [reviewId, userId, voteType]
            );
            return true;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return false;
            }
            console.error('Error recording review vote:', error);
            throw error;
        }
    }
}

module.exports = new ReviewModel(); 