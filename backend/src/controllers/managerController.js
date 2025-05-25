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
                mr.response,
                mr.created_at as response_date
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN manager_responses mr ON r.id = mr.review_id
            ORDER BY r.created_at DESC
        `);

        // Записываем в лог количество найденных отзывов
        console.log(`Найдено ${reviews.length} отзывов для панели управления менеджером`);
        
        res.json(reviews);
    } catch (error) {
        console.error('Ошибка получения отзывов:', error);
        return errorHandler(res, 'Не удалось получить отзывы', 500, error);
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
        const managerId = req.user?.id || 1; // Используем ID менеджера по умолчанию, если он недоступен
        
        console.log('Ответ на отзыв:', { reviewId, responseText });

        if (!reviewId) {
            return res.status(400).json({
                message: 'ID отзыва является обязательным'
            });
        }

        if (!responseText) {
            return res.status(400).json({
                message: 'Текст ответа является обязательным'
            });
        }

        // Проверяем, существует ли отзыв
        const [reviewCheck] = await pool.query('SELECT id FROM reviews WHERE id = ?', [reviewId]);
        if (reviewCheck.length === 0) {
            return res.status(404).json({
                message: 'Отзыв не найден'
            });
        }

        // Проверяем, существует ли уже ответ
        const [responseCheck] = await pool.query('SELECT id FROM manager_responses WHERE review_id = ?', [reviewId]);
        if (responseCheck.length > 0) {
            // Обновляем существующий ответ
            await pool.query(
                'UPDATE manager_responses SET response = ?, updated_at = CURRENT_TIMESTAMP WHERE review_id = ?',
                [responseText, reviewId]
            );
        } else {
            // Создаем новый ответ
            await pool.query(
                'INSERT INTO manager_responses (review_id, manager_id, response) VALUES (?, ?, ?)',
                [reviewId, managerId, responseText]
            );
        }

        // Обновляем статус отзыва
        await pool.query(
            'UPDATE reviews SET responded = true WHERE id = ?',
            [reviewId]
        );

        res.json({
            message: 'Ответ успешно сохранен',
            reviewId,
            response: responseText
        });
    } catch (error) {
        console.error('Ошибка при сохранении ответа:', error);
        return errorHandler(res, 'Не удалось сохранить ответ', 500, error);
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
            acc[review.type] = (acc[review.type] || 0) + 1;
            return acc;
        }, { inRestaurant: 0, delivery: 0 });
        
        // Получение количества активных пользователей
        const [activeUsers] = await pool.query(`
            SELECT COUNT(*) as count 
            FROM users 
            WHERE is_active = 1
        `);
        
        // Расчет коэффициента ответов
        const [respondedReviews] = await pool.query(`
            SELECT COUNT(*) as count 
            FROM manager_responses
        `);
        
        const responseRate = totalReviews > 0 
            ? (respondedReviews[0].count / totalReviews) * 100 
            : 0;
        
        res.json({
            totalReviews,
            averageRating,
            totalRestaurants,
            reviewsByType,
            activeUsers: activeUsers[0].count,
            responseRate
        });
        
    } catch (error) {
        console.error('Ошибка при получении статистики:', error);
        res.status(500).json({ 
            error: 'Внутренняя ошибка сервера',
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
        // Получение отзывов за последние 30 дней
        const [reviews] = await pool.query(`
            SELECT rating, type, created_at 
            FROM reviews 
            WHERE deleted = 0 
            AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);
        
        // Подготовка данных для графика рейтингов
        const ratings = [1, 2, 3, 4, 5].map(rating => ({
            rating,
            count: reviews.filter(r => r.rating === rating).length
        }));
        
        // Подготовка данных для графика типов отзывов
        const reviewTypes = [
            { 
                name: 'В ресторане', 
                value: reviews.filter(r => r.type === 'inRestaurant').length 
            },
            { 
                name: 'Доставка', 
                value: reviews.filter(r => r.type === 'delivery').length 
            }
        ];
        
        // Подготовка данных для графика ответов по дням
        const last7Days = [...Array(7)].map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
        }).reverse();
        
        const [responses] = await pool.query(`
            SELECT DATE(created_at) as date, COUNT(*) as count 
            FROM manager_responses 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
            GROUP BY DATE(created_at)
        `);
        
        const dailyResponses = last7Days.map(date => ({
            date,
            count: responses.find(r => r.date.toISOString().split('T')[0] === date)?.count || 0
        }));
        
        res.json({
            ratings,
            reviewTypes,
            dailyResponses
        });
        
    } catch (error) {
        console.error('Ошибка при получении данных для графиков:', error);
        res.status(500).json({ 
            error: 'Внутренняя ошибка сервера',
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