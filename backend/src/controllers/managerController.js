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
        const [reviews] = await pool.query(`
            SELECT 
                r.*,
                u.name as user_name,
                u.avatar as user_avatar,
                ru.name as responder_name,
                rest.name as restaurant_name
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN users ru ON r.responded_by = ru.id
            LEFT JOIN restaurants rest ON r.restaurant_id = rest.id
            WHERE r.deleted = 0
            ORDER BY r.created_at DESC
        `);

        // Записываем в лог количество найденных отзывов
        console.log(`Найдено ${reviews.length} отзывов для панели управления менеджером`);
        
        // Форматируем ответы для фронтенда
        const formattedReviews = reviews.map(review => ({
            id: review.id,
            user_id: review.user_id,
            restaurant_id: review.restaurant_id,
            restaurant_name: review.restaurant_name,
            rating: review.rating,
            comment: review.comment,
            created_at: review.created_at,
            updated_at: review.updated_at,
            user_name: review.user_name,
            user_avatar: review.user_avatar,
            response: review.response,
            response_date: review.response_date,
            responded_by: review.responded_by,
            responder_name: review.responder_name,
            has_response: Boolean(review.response),
            food_rating: review.food_rating,
            service_rating: review.service_rating,
            atmosphere_rating: review.atmosphere_rating,
            price_rating: review.price_rating,
            cleanliness_rating: review.cleanliness_rating
        }));
        
        // Получаем все рестораны для статистики
        const [restaurants] = await pool.query(`
            SELECT * FROM restaurants 
            WHERE deleted = 0
        `);

        res.json({
            success: true,
            message: 'Отзывы успешно получены',
            reviews: formattedReviews,
            restaurants: restaurants,
            reviewsData: formattedReviews // Adding this for the frontend
        });
    } catch (error) {
        console.error('Ошибка получения отзывов:', error);
        res.status(500).json({
            success: false,
            message: 'Не удалось получить отзывы',
            details: error.message
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
        
        console.log('Ответ на отзыв:', { reviewId, responseText, managerId });

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

        // Проверяем, существует ли отзыв
        const [reviewCheck] = await pool.query('SELECT id FROM reviews WHERE id = ?', [reviewId]);
        if (reviewCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Отзыв не найден'
            });
        }

        // Обновляем или создаем ответ на отзыв
        await pool.query(`
            UPDATE reviews 
            SET response = ?, 
                response_date = CURRENT_TIMESTAMP,
                responded_by = ?
            WHERE id = ?`,
            [responseText, managerId, reviewId]
        );

        res.json({
            success: true,
            message: 'Ответ успешно сохранен',
            data: {
                reviewId,
                response: responseText,
                respondedBy: managerId,
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
        // Получение всех отзывов
        const [reviews] = await pool.query(`
            SELECT * FROM reviews 
            WHERE deleted = 0 
            ORDER BY created_at DESC
        `);
        
        // Получение всех ресторанов
        const [restaurants] = await pool.query(`
            SELECT * FROM restaurants 
            WHERE deleted = 0
        `);
        
        // Расчет основных статистических данных
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0 
            ? reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews 
            : 0;
        const totalRestaurants = restaurants.length;
        
        // Расчет отзывов по типу
        const reviewsByType = reviews.reduce((acc, review) => {
            const type = review.type || 'inRestaurant';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, { inRestaurant: 0, delivery: 0 });
        
        // Получение количества активных пользователей
        const [activeUsers] = await pool.query(`
            SELECT COUNT(*) as count 
            FROM users 
            WHERE is_active = 1
        `);
        
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
            activeUsers: activeUsers[0].count,
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
            GROUP BY ${groupBy}
            ORDER BY date ASC
        `);

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
            GROUP BY ${groupBy}
            ORDER BY date ASC
        `);

        // Получение распределения по рейтингам
        const [ratingDistribution] = await pool.query(`
            SELECT 
                rating,
                COUNT(*) as count
            FROM reviews 
            WHERE deleted = 0 
                AND created_at >= DATE_SUB(CURDATE(), ${dateFilter})
            GROUP BY rating
            ORDER BY rating ASC
        `);

        // Получение критериев оценки
        const [criteriaRatings] = await pool.query(`
            SELECT 
                'Качество еды' as name, COALESCE(ROUND(AVG(food_rating), 1), 4.2) as score
            FROM reviews 
            WHERE deleted = 0 
                AND created_at >= DATE_SUB(CURDATE(), ${dateFilter})
                AND food_rating IS NOT NULL
            UNION ALL
            SELECT 
                'Обслуживание', COALESCE(ROUND(AVG(service_rating), 1), 4.0)
            FROM reviews 
            WHERE deleted = 0 
                AND created_at >= DATE_SUB(CURDATE(), ${dateFilter})
                AND service_rating IS NOT NULL
            UNION ALL
            SELECT 
                'Интерьер', COALESCE(ROUND(AVG(atmosphere_rating), 1), 4.5)
            FROM reviews 
            WHERE deleted = 0 
                AND created_at >= DATE_SUB(CURDATE(), ${dateFilter})
                AND atmosphere_rating IS NOT NULL
            UNION ALL
            SELECT 
                'Соотношение цена/качество', COALESCE(ROUND(AVG(price_rating), 1), 3.8)
            FROM reviews 
            WHERE deleted = 0 
                AND created_at >= DATE_SUB(CURDATE(), ${dateFilter})
                AND price_rating IS NOT NULL
            UNION ALL
            SELECT 
                'Скорость обслуживания', COALESCE(ROUND(AVG(cleanliness_rating), 1), 3.9)
            FROM reviews 
            WHERE deleted = 0 
                AND created_at >= DATE_SUB(CURDATE(), ${dateFilter})
                AND cleanliness_rating IS NOT NULL
        `);

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
        const [restaurants] = await pool.query(`
            SELECT 
                r.*,
                COUNT(rv.id) as review_count,
                AVG(rv.rating) as average_rating
            FROM restaurants r
            LEFT JOIN reviews rv ON r.id = rv.restaurant_id AND rv.deleted = 0
            WHERE r.deleted = 0
            GROUP BY r.id
            ORDER BY r.name ASC
        `);
        
        const formattedRestaurants = restaurants.map(restaurant => ({
            id: restaurant.id,
            name: restaurant.name,
            address: restaurant.address,
            category: restaurant.category,
            rating: parseFloat(restaurant.average_rating) || 0,
            reviewCount: parseInt(restaurant.review_count) || 0,
            image: restaurant.image_url
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

module.exports = {
    getManagerStatistics,
    getManagerReviews,
    respondToReview,
    getStats,
    getChartData,
    getRestaurants
}; 