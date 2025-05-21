const restaurantModel = require('../models/restaurantModel');
const reviewModel = require('../models/reviewModel');
const userModel = require('../models/userModel');
const pool = require('../config/database');
const { errorHandler } = require('../utils/errorHandler');

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
 * Получение отзывов для панели управления менеджером
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getReviews = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                r.id, 
                r.user_id, 
                r.restaurant_id, 
                r.rating, 
                r.comment as text, 
                r.date as createdAt, 
                r.date as updatedAt,
                CASE WHEN mr.id IS NOT NULL THEN true ELSE false END as responded,
                mr.response_text as response,
                mr.created_at as responseDate,
                u.name as userName,
                u.email as userEmail,
                COALESCE(rest.name, r.restaurant_name) as restaurantName
            FROM 
                reviews r
            LEFT JOIN 
                manager_responses mr ON r.id = mr.review_id
            LEFT JOIN 
                users u ON r.user_id = u.id
            LEFT JOIN 
                restaurants rest ON r.restaurant_id = rest.id
            ORDER BY 
                r.date DESC
        `);

        // Преобразование данных для фронтенда
        const reviews = rows.map(row => ({
            id: row.id,
            user: {
                id: row.user_id,
                name: row.userName || 'Пользователь',
                email: row.userEmail || ''
            },
            restaurant: {
                id: row.restaurant_id,
                name: row.restaurantName || 'Ресторан'
            },
            rating: row.rating || 0,
            text: row.text || '',
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            responded: Boolean(row.responded),
            response: row.response || '',
            responseDate: row.responseDate
        }));

        // Записываем в лог количество найденных отзывов в базе данных
        console.log(`Найдено ${reviews.length} отзывов для панели управления менеджером`);
        
        res.json(reviews);
    } catch (error) {
        console.error('Ошибка получения отзывов:', error);
        return errorHandler(res, 'Не удалось получить отзывы', 500, error);
    }
};

/**
 * Ответить на отзыв
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
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
                'UPDATE manager_responses SET response_text = ?, updated_at = NOW() WHERE review_id = ?',
                [responseText, reviewId]
            );
            console.log(`Обновлен существующий ответ для отзыва ${reviewId}`);
        } else {
            // Создаем новый ответ
            await pool.query(
                'INSERT INTO manager_responses (review_id, manager_id, response_text, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
                [reviewId, managerId, responseText]
            );
            console.log(`Создан новый ответ для отзыва ${reviewId}`);
        }

        res.json({
            success: true,
            message: 'Ответ успешно отправлен'
        });
    } catch (error) {
        console.error('Ошибка при ответе на отзыв:', error);
        return errorHandler(res, 'Не удалось ответить на отзыв', 500, error);
    }
};

/**
 * Получение статистики для панели управления менеджером
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStats = async (req, res) => {
    try {
        // Получение общего количества отзывов
        const [totalReviews] = await pool.query('SELECT COUNT(*) as count FROM reviews');
        
        // Получение количества отвеченных отзывов
        const [respondedReviews] = await pool.query('SELECT COUNT(*) as count FROM manager_responses');
        
        // Получение среднего рейтинга
        const [avgRating] = await pool.query('SELECT AVG(rating) as avg FROM reviews');
        
        // Получение общего количества ресторанов
        const [totalRestaurants] = await pool.query('SELECT COUNT(*) as count FROM restaurants');

        // Убедимся, что обрабатываем значения null или undefined
        const stats = {
            totalReviews: totalReviews[0]?.count || 0,
            respondedReviews: respondedReviews[0]?.count || 0,
            pendingReviews: (totalReviews[0]?.count || 0) - (respondedReviews[0]?.count || 0),
            averageRating: avgRating[0]?.avg || 0,
            totalRestaurants: totalRestaurants[0]?.count || 0
        };

        // Убедимся, что формат ответа согласован
        res.json({
            status: 'success',
            data: stats
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return errorHandler(res, 'Failed to fetch statistics', 500, error);
    }
};

/**
 * Получение данных для графика для панели управления менеджером
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getChartData = async (req, res) => {
    try {
        const period = req.query.period || 'week';
        
        // Определяем диапазон дат на основе периода
        const now = new Date();
        let startDate;
        
        switch (period) {
            case 'month':
                startDate = new Date(now);
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                startDate = new Date(now);
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            case 'week':
            default:
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                break;
        }
        
        // Форматируем startDate для SQL запроса
        const formattedStartDate = startDate.toISOString().split('T')[0];
        
        try {
            // Получение рейтингов по дням
            const [ratingsByDay] = await pool.query(`
                SELECT 
                    DAYOFWEEK(date) as day_of_week,
                    AVG(rating) as avg_rating,
                    COUNT(*) as count
                FROM 
                    reviews
                WHERE 
                    date >= ?
                GROUP BY 
                    day_of_week
                ORDER BY 
                    day_of_week
            `, [formattedStartDate]);
            
            // Получение количества отзывов по дням
            const [countByDay] = await pool.query(`
                SELECT 
                    DAYOFWEEK(date) as day_of_week,
                    COUNT(*) as count
                FROM 
                    reviews
                WHERE 
                    date >= ?
                GROUP BY 
                    day_of_week
                ORDER BY 
                    day_of_week
            `, [formattedStartDate]);
            
            // Получение распределения ресторанов
            const [restaurantDistribution] = await pool.query(`
                SELECT 
                    r.name as restaurant_name,
                    COUNT(rv.id) as review_count
                FROM 
                    restaurants r
                    LEFT JOIN reviews rv ON r.id = rv.restaurant_id
                WHERE 
                    rv.date >= ?
                GROUP BY 
                    r.id
                ORDER BY 
                    review_count DESC
                LIMIT 10
            `, [formattedStartDate]);
            
            // Подготовка данных для графиков
            // Преобразование SQL результатов в формат для графиков
            
            // Инициализация данных для всех дней недели
            const ratingData = Array(7).fill(0);
            const countData = Array(7).fill(0);
            
            // Заполнение фактическими данными из базы данных
            ratingsByDay.forEach(row => {
                // MySQL DAYOFWEEK: 1 = Sunday, 2 = Monday, ..., 7 = Saturday
                // Мы корректируем индекс: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
                const index = row.day_of_week - 1;
                ratingData[index] = parseFloat(row.avg_rating) || 0;
            });
            
            countByDay.forEach(row => {
                const index = row.day_of_week - 1;
                countData[index] = parseInt(row.count) || 0;
            });
            
            // Переупорядочиваем, чтобы начать с понедельника: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
            const sortedRatings = [
                ratingData[1], // Понедельник
                ratingData[2], // Вторник
                ratingData[3], // Среда
                ratingData[4], // Четверг
                ratingData[5], // Пятница
                ratingData[6], // Суббота
                ratingData[0]  // Воскресенье
            ];
            
            const sortedCounts = [
                countData[1], // Понедельник
                countData[2], // Вторник
                countData[3], // Среда
                countData[4], // Четверг
                countData[5], // Пятница
                countData[6], // Суббота
                countData[0]  // Воскресенье
            ];
            
            // Подготовка данных для распределения ресторанов
            const restaurantLabels = restaurantDistribution.map(r => r.restaurant_name || 'Неизвестный ресторан');
            const restaurantCounts = restaurantDistribution.map(r => parseInt(r.review_count) || 0);
            
            // Генерация цветов для ресторанов
            const restaurantColors = [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)',
                'rgba(199, 199, 199, 0.6)',
                'rgba(83, 102, 255, 0.6)',
                'rgba(255, 99, 255, 0.6)',
                'rgba(99, 255, 132, 0.6)'
            ];
            
            // Убедимся, что у нас достаточно цветов
            while (restaurantColors.length < restaurantLabels.length) {
                restaurantColors.push(...restaurantColors);
            }
            
            // Форматирование данных для фронтенда
            const chartData = {
                ratings: {
                    labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
                    datasets: [{
                        label: 'Средний рейтинг',
                        data: sortedRatings,
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    }]
                },
                volumeByDay: {
                    labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
                    datasets: [{
                        label: 'Количество отзывов',
                        data: sortedCounts,
                        backgroundColor: 'rgba(99, 102, 241, 0.5)',
                    }]
                },
                categoryDistribution: {
                    labels: restaurantLabels,
                    datasets: [{
                        label: 'Количество отзывов',
                        data: restaurantCounts,
                        backgroundColor: restaurantColors.slice(0, restaurantLabels.length),
                    }]
                }
            };
            
            // Отправляем отформатированные данные на фронт
            res.json({
                status: 'success',
                data: chartData
            });
        } catch (dbError) {
            console.error('Database error while fetching chart data:', dbError);
            
            // Возвращаем данные по умолчанию, чтобы предотвратить разрыв фронтенда
            const defaultData = {
                ratings: {
                    labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
                    datasets: [{
                        label: 'Средний рейтинг',
                        data: [0, 0, 0, 0, 0, 0, 0],
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    }]
                },
                volumeByDay: {
                    labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
                    datasets: [{
                        label: 'Количество отзывов',
                        data: [0, 0, 0, 0, 0, 0, 0],
                        backgroundColor: 'rgba(99, 102, 241, 0.5)',
                    }]
                },
                categoryDistribution: {
                    labels: ['Нет данных'],
                    datasets: [{
                        label: 'Количество отзывов',
                        data: [0],
                        backgroundColor: ['rgba(200, 200, 200, 0.6)'],
                    }]
                }
            };
            
            res.json({
                status: 'error',
                message: 'Ошибка при получении данных из базы данных',
                data: defaultData
            });
        }
    } catch (error) {
        console.error('Ошибка в getChartData:', error);
        return errorHandler(res, 'Не удалось получить данные для графика', 500, error);
    }
};

/**
 * Получение ресторанов для панели управления менеджером
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRestaurants = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                r.id,
                r.name,
                r.address,
                r.category,
                r.is_active as status,
                r.price_range,
                COALESCE(AVG(rv.rating), 0) as rating,
                COUNT(rv.id) as reviews
            FROM 
                restaurants r
            LEFT JOIN 
                reviews rv ON r.id = rv.restaurant_id
            GROUP BY 
                r.id
            ORDER BY 
                reviews DESC
        `);

        res.json(rows);
    } catch (error) {
        console.error('Ошибка при получении ресторанов:', error);
        return errorHandler(res, 'Не удалось получить рестораны', 500, error);
    }
};

module.exports = {
    getManagerStatistics,
    getReviews,
    respondToReview,
    getStats,
    getChartData,
    getRestaurants
}; 