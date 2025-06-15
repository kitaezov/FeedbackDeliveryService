const restaurantModel = require('../models/restaurantModel');
const reviewModel = require('../models/reviewModel');
const userModel = require('../models/userModel');
const pool = require('../config/database');
const errorHandler = require('../utils/errorHandler');

/**
 * Получение статистики для панели управления менеджером
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getManagerStatistics = async (req, res) => {
    try {
        // Получение всех отзывов
        const reviews = await reviewModel.getAll();
        
        // Получение всех ресторанов
        const restaurants = await restaurantModel.getAll();
        
        // Расчет основных статистических данных
        const totalReviews = reviews.length;
        const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews;
        const totalRestaurants = restaurants.length;
        
        // Расчет отзывов по типу
        const reviewsByType = reviews.reduce((acc, review) => {
            acc[review.reviewType] = (acc[review.reviewType] || 0) + 1;
            return acc;
        }, { inRestaurant: 0, delivery: 0 });
        
        // Получение количества активных пользователей
        const activeUsers = await userModel.count({ isActive: true });
        
        // Расчет коэффициента ответов
        const respondedReviews = reviews.filter(review => review.hasResponse).length;
        const responseRate = totalReviews > 0 ? (respondedReviews / totalReviews) * 100 : 0;
        
        // Подготовка данных для графика
        const ratings = [1, 2, 3, 4, 5].map(rating => ({
            rating,
            count: reviews.filter(r => r.rating === rating).length
        }));
        
        const reviewTypes = [
            { name: 'В ресторане', value: reviewsByType.inRestaurant },
            { name: 'Доставка', value: reviewsByType.delivery }
        ];
        
        // Получение данных для ответов за последние 7 дней
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const responses = [];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(lastWeek);
            date.setDate(date.getDate() + i);
            
            const dayResponses = reviews.filter(review => {
                const reviewDate = new Date(review.createdAt);
                return reviewDate.toDateString() === date.toDateString() && review.hasResponse;
            }).length;
            
            responses.push({
                date: date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
                count: dayResponses
            });
        }
        
        res.json({
            stats: {
                totalReviews,
                averageRating,
                totalRestaurants,
                reviewsByType,
                activeUsers,
                responseRate
            },
            charts: {
                ratings,
                reviews: reviewTypes,
                responses
            },
            restaurants: restaurants.map(restaurant => ({
                id: restaurant.id,
                name: restaurant.name,
                rating: restaurant.rating,
                reviews: restaurant.reviews,
                type: restaurant.type,
                status: restaurant.status
            }))
        });
    } catch (error) {
        console.error('Ошибка получения статистики менеджера:', error);
        res.status(500).json({ message: 'Ошибка получения статистики менеджера' });
    }
};

/**
 * Получить все отзывы для панели управления менеджера
 * @param {Object} req - Объект запроса Express
 * @param {Object} res - Объект ответа Express
 */
const getManagerReviews = async (req, res) => {
    try {
        // Получаем ID пользователя из токена аутентификации
        const userId = req.user.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Необходима авторизация',
                details: 'Пользователь не авторизован'
            });
        }
        
        console.log(`Получение отзывов для менеджера (ID: ${userId})`);
        
        // Сначала получаем ресторан, к которому прикреплен менеджер
        const [managerRestaurants] = await pool.query(`
            SELECT restaurant_id 
            FROM users 
            WHERE id = ? AND role = 'manager'
        `, [userId]);
        
        if (managerRestaurants.length === 0) {
            console.log(`Менеджер (ID: ${userId}) не прикреплен ни к одному ресторану`);
            return res.json([]);
        }
        
        const restaurantId = managerRestaurants[0].restaurant_id;
        console.log(`Менеджер (ID: ${userId}) прикреплен к ресторану ID: ${restaurantId}`);
        
        // Получаем отзывы только для ресторана этого менеджера
        const [reviews] = await pool.query(`
            SELECT 
                r.*,
                u.name as user_name,
                u.avatar as user_avatar,
                rest.name as restaurant_name,
                IFNULL(r.manager_name, 
                    (SELECT name FROM users WHERE id = r.responded_by LIMIT 1)
                ) as manager_name
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN restaurants rest ON r.restaurant_id = rest.id
            WHERE r.deleted = 0 
            AND (r.restaurant_id = ? OR rest.id = ?)
            ORDER BY r.created_at DESC
        `, [restaurantId, restaurantId]);

        // Записываем в лог количество найденных отзывов
        console.log(`Найдено ${reviews.length} отзывов для ресторана (ID: ${restaurantId})`);
        
        // Проверяем наличие таблицы review_photos
        const [tableExists] = await pool.query(`
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name = 'review_photos'
        `);
        
        // Получаем фотографии для каждого отзыва, если таблица существует
        const reviewsWithPhotos = [];
        for (const review of reviews) {
            // Форматируем отзыв для фронтенда
            const formattedReview = {
                id: review.id,
                user_id: review.user_id,
                restaurant_id: review.restaurant_id,
                restaurant_name: review.restaurant_name,
                rating: review.rating || 0,
                comment: review.comment,
                created_at: review.created_at,
                updated_at: review.updated_at,
                user_name: review.user_name,
                user_avatar: review.user_avatar,
                response: review.response,
                response_date: review.response_date,
                manager_name: review.manager_name,
                has_response: Boolean(review.response),
                deleted: review.deleted === 1,
                food_rating: parseInt(review.food_rating) || 0,
                service_rating: parseInt(review.service_rating) || 0,
                atmosphere_rating: parseInt(review.atmosphere_rating) || 0,
                price_rating: parseInt(review.price_rating) || 0,
                cleanliness_rating: parseInt(review.cleanliness_rating) || 0,
                type: review.type || "inRestaurant",
                photos: []
            };
            
            // Если таблица фотографий существует, получаем фотографии для отзыва
            if (tableExists.length > 0) {
                try {
                    const [photos] = await pool.query(
                        'SELECT * FROM review_photos WHERE review_id = ?',
                        [review.id]
                    );
                    
                    if (photos && photos.length > 0) {
                        console.log(`Найдено ${photos.length} фотографий для отзыва ID: ${review.id}`);
                        
                        // Преобразуем фотографии в нужный формат
                        formattedReview.photos = photos.map(photo => {
                            try {
                                // Пробуем распарсить photo_url как JSON
                                const photoData = JSON.parse(photo.photo_url);
                                return photoData;
                            } catch (e) {
                                // Если не получилось распарсить, возвращаем как есть
                                return { url: photo.photo_url, isReceipt: Boolean(photo.is_receipt) };
                            }
                        });
                    }
                } catch (error) {
                    console.error(`Ошибка при получении фотографий для отзыва ID: ${review.id}:`, error);
                }
            }
            
            reviewsWithPhotos.push(formattedReview);
        }
        
        // Возвращаем отзывы с фотографиями
        res.json(reviewsWithPhotos);
    } catch (error) {
        console.error('Ошибка при получении отзывов для менеджера:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при получении отзывов',
            error: error.message
        });
    }
};

/**
 * Ответить на отзыв
 * @param {Object} req - Объект запроса Express
 * @param {Object} res - Объект ответа Express
 */
const respondToReview = async (req, res) => {
    try {
        // Обрабатываем оба формата: /reviews/:id/response и /reviews/respond
        const reviewId = req.params.id || req.body.reviewId;
        const responseText = req.body.text || req.body.responseText;
        const managerId = req.user?.id;
        const managerName = req.user?.name;
        
        console.log('Ответ на отзыв:', { reviewId, responseText, managerId, managerName });

        if (!reviewId) {
            return res.status(400).json({
                success: false,
                message: 'ID отзыва является обязательным'
            });
        }

        if (!responseText) {
            return res.status(400).json({
                success: false,
                message: 'Текст ответа является обязательным'
            });
        }

        if (!managerId) {
            return res.status(400).json({
                success: false,
                message: 'ID менеджера является обязательным'
            });
        }

        // Получаем ресторан, к которому прикреплен менеджер
        const [managerRestaurants] = await pool.query(`
            SELECT restaurant_id 
            FROM users 
            WHERE id = ? AND role = 'manager'
        `, [managerId]);
        
        if (managerRestaurants.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Доступ запрещен',
                details: 'Менеджер не прикреплен ни к одному ресторану'
            });
        }
        
        const managerRestaurantId = managerRestaurants[0].restaurant_id;
        
        // Проверяем, существует ли отзыв и принадлежит ли он ресторану менеджера
        const [reviewCheck] = await pool.query(`
            SELECT r.id, r.restaurant_id, rest.id as rest_id
            FROM reviews r
            LEFT JOIN restaurants rest ON r.restaurant_id = rest.id
            WHERE r.id = ?
        `, [reviewId]);
        
        if (reviewCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Отзыв не найден'
            });
        }
        
        const reviewRestaurantId = reviewCheck[0].restaurant_id || reviewCheck[0].rest_id;
        
        // Проверяем, принадлежит ли отзыв ресторану менеджера
        if (reviewRestaurantId !== managerRestaurantId) {
            return res.status(403).json({
                success: false,
                message: 'Доступ запрещен',
                details: 'Вы можете отвечать только на отзывы о своем ресторане'
            });
        }
        
        console.log(`Менеджер (ID: ${managerId}) отвечает на отзыв (ID: ${reviewId}) для ресторана (ID: ${managerRestaurantId})`);

        // Обновляем или создаем ответ на отзыв
        await pool.query(`
            UPDATE reviews 
            SET response = ?, 
                response_date = CURRENT_TIMESTAMP,
                responded_by = ?,
                manager_name = ?
            WHERE id = ?`,
            [responseText, managerId, managerName || '', reviewId]
        );

        res.json({
            success: true,
            message: 'Ответ успешно сохранен',
            data: {
                reviewId,
                response: responseText,
                respondedBy: managerId,
                managerName: managerName,
                responseDate: new Date()
            }
        });
    } catch (error) {
        console.error('Ошибка при сохранении ответа:', error);
        res.status(500).json({
            success: false,
            message: 'Не удалось сохранить ответ',
            details: error.message
        });
    }
};

/**
 * Получение статистики для панели управления менеджером
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStats = async (req, res) => {
    try {
        // Получаем ID пользователя из токена аутентификации
        const userId = req.user.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Необходима авторизация',
                details: 'Пользователь не авторизован'
            });
        }
        
        console.log(`Получение статистики для менеджера (ID: ${userId})`);
        
        // Получаем ресторан, к которому прикреплен менеджер
        const [managerRestaurants] = await pool.query(`
            SELECT restaurant_id 
            FROM users 
            WHERE id = ? AND role = 'manager'
        `, [userId]);
        
        if (managerRestaurants.length === 0) {
            console.log(`Менеджер (ID: ${userId}) не прикреплен ни к одному ресторану`);
            return res.json({
                success: true,
                totalReviews: 0,
                averageRating: 0,
                totalRestaurants: 0,
                reviewsByType: { inRestaurant: 0, delivery: 0 },
                activeUsers: 0,
                responseRate: 0
            });
        }
        
        const restaurantId = managerRestaurants[0].restaurant_id;
        console.log(`Менеджер (ID: ${userId}) прикреплен к ресторану ID: ${restaurantId}`);
        
        // Получение всех отзывов для ресторана менеджера
        const [reviews] = await pool.query(`
            SELECT r.* 
            FROM reviews r
            LEFT JOIN restaurants rest ON r.restaurant_id = rest.id
            WHERE r.deleted = 0 
            AND (r.restaurant_id = ? OR rest.id = ?)
            ORDER BY r.created_at DESC
        `, [restaurantId, restaurantId]);
        
        // Получение информации о ресторане
        const [restaurant] = await pool.query(`
            SELECT * FROM restaurants 
            WHERE id = ? AND deleted = 0
        `, [restaurantId]);
        
        // Расчет основных статистических данных
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0 
            ? reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews 
            : 0;
        const totalRestaurants = restaurant.length; // Всегда должно быть 1
        
        // Расчет отзывов по типу
        const reviewsByType = reviews.reduce((acc, review) => {
            const type = review.type || 'inRestaurant';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, { inRestaurant: 0, delivery: 0 });
        
        // Получение количества активных пользователей, оставивших отзывы для ресторана
        const uniqueUserIds = [...new Set(reviews.map(review => review.user_id))];
        const activeUsers = uniqueUserIds.length;
        
        // Расчет коэффициента ответов
        const respondedReviews = reviews.filter(review => review.response !== null).length;
        const responseRate = totalReviews > 0 
            ? (respondedReviews / totalReviews) * 100 
            : 0;
        
        res.json({
            success: true,
            totalReviews,
            averageRating: parseFloat(averageRating.toFixed(1)),
            totalRestaurants,
            reviewsByType,
            activeUsers,
            responseRate: parseFloat(responseRate.toFixed(1))
        });
        
    } catch (error) {
        console.error('Ошибка при получении статистики:', error);
        res.status(500).json({ 
            success: false,
            message: 'Внутренняя ошибка сервера',
            details: error.message 
        });
    }
};

/**
 * Получение данных для графиков
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getChartData = async (req, res) => {
    try {
        // Получаем ID пользователя из токена аутентификации
        const userId = req.user.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Необходима авторизация',
                details: 'Пользователь не авторизован'
            });
        }
        
        // Получаем ресторан, к которому прикреплен менеджер
        const [managerRestaurants] = await pool.query(`
            SELECT restaurant_id 
            FROM users 
            WHERE id = ? AND role = 'manager'
        `, [userId]);
        
        if (managerRestaurants.length === 0) {
            return res.json({
                success: true,
                ratingTrend: [],
                reviewsPerDay: []
            });
        }
        
        const restaurantId = managerRestaurants[0].restaurant_id;
        console.log(`Получение данных для графиков. Менеджер ID: ${userId}, Ресторан ID: ${restaurantId}`);
        
        // Получение периода из query параметров (по умолчанию 7 дней)
        const period = req.query.period || 'week';
        let dateFilter;
        let groupBy;
        
        console.log('Получен запрос на период:', period);
        
        switch(period) {
            case 'month':
                dateFilter = 'INTERVAL 30 DAY';
                groupBy = 'DATE(dates.date)';
                break;
            case 'year':
                dateFilter = 'INTERVAL 365 DAY';
                groupBy = 'DATE_FORMAT(dates.date, "%Y-%m-01")';
                break;
            case 'week':
            default:
                dateFilter = 'INTERVAL 7 DAY';
                groupBy = 'DATE(dates.date)';
                break;
        }

        console.log('Используем фильтр:', dateFilter, 'и группировку:', groupBy);

        // Получение среднего рейтинга по дням/месяцам
        const [averageRatings] = await pool.query(`
            WITH RECURSIVE dates AS (
                SELECT CURDATE() - ${dateFilter} + INTERVAL 1 DAY as date
                UNION ALL
                SELECT date + INTERVAL 1 DAY
                FROM dates
                WHERE date < CURDATE()
            )
            SELECT 
                ${groupBy} as date,
                COALESCE(ROUND(AVG(r.rating), 1), 0) as average_rating,
                COUNT(r.id) as review_count
            FROM dates
            LEFT JOIN reviews r ON DATE(r.created_at) = DATE(dates.date) AND r.deleted = 0
                AND (r.restaurant_id = ? OR EXISTS (
                    SELECT 1 FROM restaurants rest 
                    WHERE rest.id = r.restaurant_id AND rest.id = ?
                ))
            GROUP BY ${groupBy}
            ORDER BY date ASC
        `, [restaurantId, restaurantId]);

        // Получение количества отзывов по дням/месяцам
        const [reviewCounts] = await pool.query(`
            WITH RECURSIVE dates AS (
                SELECT CURDATE() - ${dateFilter} + INTERVAL 1 DAY as date
                UNION ALL
                SELECT date + INTERVAL 1 DAY
                FROM dates
                WHERE date < CURDATE()
            )
            SELECT 
                ${groupBy} as date,
                COUNT(r.id) as count
            FROM dates
            LEFT JOIN reviews r ON DATE(r.created_at) = DATE(dates.date) AND r.deleted = 0
                AND (r.restaurant_id = ? OR EXISTS (
                    SELECT 1 FROM restaurants rest 
                    WHERE rest.id = r.restaurant_id AND rest.id = ?
                ))
            GROUP BY ${groupBy}
            ORDER BY date ASC
        `, [restaurantId, restaurantId]);

        // Получение распределения по рейтингам
        const [ratingDistribution] = await pool.query(`
            SELECT 
                rating,
                COUNT(*) as count
            FROM reviews r
            WHERE r.deleted = 0 
                AND r.created_at >= DATE_SUB(CURDATE(), ${dateFilter})
                AND (r.restaurant_id = ? OR EXISTS (
                    SELECT 1 FROM restaurants rest 
                    WHERE rest.id = r.restaurant_id AND rest.id = ?
                ))
            GROUP BY rating
            ORDER BY rating ASC
        `, [restaurantId, restaurantId]);

        // Получение критериев оценки
        const [criteriaRatings] = await pool.query(`
            SELECT 
                'Качество еды' as name, COALESCE(ROUND(AVG(food_rating), 1), 4.2) as score
            FROM reviews r 
            WHERE r.deleted = 0 
                AND r.created_at >= DATE_SUB(CURDATE(), ${dateFilter})
                AND r.food_rating IS NOT NULL
                AND (r.restaurant_id = ? OR EXISTS (
                    SELECT 1 FROM restaurants rest 
                    WHERE rest.id = r.restaurant_id AND rest.id = ?
                ))
            UNION ALL
            SELECT 
                'Обслуживание', COALESCE(ROUND(AVG(service_rating), 1), 4.0)
            FROM reviews r 
            WHERE r.deleted = 0 
                AND r.created_at >= DATE_SUB(CURDATE(), ${dateFilter})
                AND r.service_rating IS NOT NULL
                AND (r.restaurant_id = ? OR EXISTS (
                    SELECT 1 FROM restaurants rest 
                    WHERE rest.id = r.restaurant_id AND rest.id = ?
                ))
            UNION ALL
            SELECT 
                'Интерьер', COALESCE(ROUND(AVG(atmosphere_rating), 1), 4.5)
            FROM reviews r 
            WHERE r.deleted = 0 
                AND r.created_at >= DATE_SUB(CURDATE(), ${dateFilter})
                AND r.atmosphere_rating IS NOT NULL
                AND (r.restaurant_id = ? OR EXISTS (
                    SELECT 1 FROM restaurants rest 
                    WHERE rest.id = r.restaurant_id AND rest.id = ?
                ))
            UNION ALL
            SELECT 
                'Соотношение цена/качество', COALESCE(ROUND(AVG(price_rating), 1), 3.8)
            FROM reviews r 
            WHERE r.deleted = 0 
                AND r.created_at >= DATE_SUB(CURDATE(), ${dateFilter})
                AND r.price_rating IS NOT NULL
                AND (r.restaurant_id = ? OR EXISTS (
                    SELECT 1 FROM restaurants rest 
                    WHERE rest.id = r.restaurant_id AND rest.id = ?
                ))
            UNION ALL
            SELECT 
                'Скорость обслуживания', COALESCE(ROUND(AVG(cleanliness_rating), 1), 3.9)
            FROM reviews r 
            WHERE r.deleted = 0 
                AND r.created_at >= DATE_SUB(CURDATE(), ${dateFilter})
                AND r.cleanliness_rating IS NOT NULL
                AND (r.restaurant_id = ? OR EXISTS (
                    SELECT 1 FROM restaurants rest 
                    WHERE rest.id = r.restaurant_id AND rest.id = ?
                ))
        `, [restaurantId, restaurantId, restaurantId, restaurantId, restaurantId, restaurantId, restaurantId, restaurantId, restaurantId, restaurantId]);

        // Форматируем данные для фронтенда с учетом периода
        const formatDate = (dateStr, periodType) => {
            const date = new Date(dateStr);
            if (periodType === 'year') {
                return date.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' });
            }
            return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        };

        const formattedAverageRatings = {
            labels: averageRatings.map(day => formatDate(day.date, period)),
            datasets: [{
                label: 'Средний рейтинг',
                data: averageRatings.map(day => parseFloat(day.average_rating) || 0),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
            }]
        };

        const formattedReviewCounts = {
            labels: reviewCounts.map(day => formatDate(day.date, period)),
            datasets: [{
                label: 'Количество отзывов',
                data: reviewCounts.map(day => day.count || 0),
                backgroundColor: 'rgba(99, 102, 241, 0.5)',
            }]
        };

        // Форматируем распределение рейтингов
        const formattedRatingDistribution = {
            labels: ratingDistribution.map(r => `${r.rating} звезд`),
            datasets: [{
                label: 'Количество отзывов',
                data: ratingDistribution.map(r => r.count),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)'
                ]
            }]
        };

        console.log('Отправляем данные на фронтенд:', {
            ratings: formattedAverageRatings.labels.length,
            reviews: formattedReviewCounts.labels.length,
            distributions: formattedRatingDistribution.labels.length,
            criteria: criteriaRatings.length
        });

        res.json({
            success: true,
            ratings: formattedAverageRatings,
            volumeByDay: formattedReviewCounts,
            ratingDistribution: formattedRatingDistribution,
            criteriaRatings: criteriaRatings.map(c => ({
                name: c.name,
                score: parseFloat(c.score).toFixed(1)
            }))
        });
    } catch (error) {
        console.error('Ошибка при получении данных для графиков:', error);
        res.status(500).json({ 
            success: false,
            message: 'Внутренняя ошибка сервера',
            details: error.message 
        });
    }
};

/**
 * Получение списка ресторанов для менеджера
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRestaurants = async (req, res) => {
    try {
        // Получаем ID пользователя из токена аутентификации
        const userId = req.user.id;
        
        if (!userId) {
            return res.status(401).json({
                error: 'Необходима авторизация',
                details: 'Пользователь не авторизован'
            });
        }
        
        console.log(`Получение ресторанов для менеджера (ID: ${userId})`);
        
        // Получаем информацию о ресторанах, к которым прикреплен менеджер
        const [restaurants] = await pool.query(`
            SELECT 
                r.*,
                COUNT(rv.id) as review_count,
                AVG(rv.rating) as average_rating,
                COALESCE(r.is_active, 1) as is_active
            FROM restaurants r
            LEFT JOIN reviews rv ON r.id = rv.restaurant_id AND rv.deleted = 0
            JOIN users u ON u.restaurant_id = r.id AND u.id = ?
            WHERE r.deleted = 0 AND u.role = 'manager'
            GROUP BY r.id
            ORDER BY r.name ASC
        `, [userId]);
        
        console.log(`Найдено ${restaurants.length} ресторанов для менеджера (ID: ${userId})`);
        
        const formattedRestaurants = restaurants.map(restaurant => ({
            id: restaurant.id,
            name: restaurant.name,
            address: restaurant.address,
            category: restaurant.category,
            rating: parseFloat(restaurant.average_rating) || 0,
            reviewCount: parseInt(restaurant.review_count) || 0,
            image: restaurant.image_url,
            status: restaurant.is_active === 0 ? 0 : 1 // Используем is_active вместо status
        }));
        
        res.json(formattedRestaurants);
        
    } catch (error) {
        console.error('Ошибка при получении списка ресторанов:', error);
        res.status(500).json({ 
            error: 'Внутренняя ошибка сервера',
            details: error.message 
        });
    }
};

/**
 * Обновление типа отзыва (в ресторане или доставка)
 */
const updateReviewType = async (req, res) => {
    try {
        const { reviewId, type } = req.body;
        
        // Проверяем валидность параметров
        if (!reviewId || !type) {
            return res.status(400).json({
                success: false,
                message: 'Не указан ID отзыва или тип'
            });
        }
        
        // Проверяем, что тип имеет допустимое значение
        if (type !== 'inRestaurant' && type !== 'delivery') {
            return res.status(400).json({
                success: false,
                message: 'Недопустимый тип отзыва. Допустимые значения: inRestaurant, delivery'
            });
        }
        
        // Обновляем тип отзыва в базе данных
        const [result] = await pool.execute(
            'UPDATE reviews SET type = ? WHERE id = ?',
            [type, reviewId]
        );
        
        // Проверяем, был ли обновлен отзыв
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Отзыв не найден'
            });
        }
        
        // Возвращаем успешный ответ
        return res.status(200).json({
            success: true,
            message: 'Тип отзыва успешно обновлен'
        });
    } catch (error) {
        console.error('Ошибка при обновлении типа отзыва:', error);
        return res.status(500).json({
            success: false,
            message: 'Произошла ошибка при обновлении типа отзыва',
            error: error.message
        });
    }
};

module.exports = {
    getManagerStatistics,
    getManagerReviews,
    respondToReview,
    getStats,
    getChartData,
    getRestaurants,
    updateReviewType
}; 