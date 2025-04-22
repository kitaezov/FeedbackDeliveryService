const restaurantModel = require('../models/restaurantModel');
const reviewModel = require('../models/reviewModel');
const userModel = require('../models/userModel');
const pool = require('../config/database');
const { errorHandler } = require('../utils/errorHandler');

/**
 * Get manager dashboard statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getManagerStatistics = async (req, res) => {
    try {
        // Get all reviews
        const reviews = await reviewModel.getAll();
        
        // Get all restaurants
        const restaurants = await restaurantModel.getAll();
        
        // Calculate basic statistics
        const totalReviews = reviews.length;
        const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews;
        const totalRestaurants = restaurants.length;
        
        // Calculate reviews by type
        const reviewsByType = reviews.reduce((acc, review) => {
            acc[review.reviewType] = (acc[review.reviewType] || 0) + 1;
            return acc;
        }, { inRestaurant: 0, delivery: 0 });
        
        // Get active users count
        const activeUsers = await userModel.count({ isActive: true });
        
        // Calculate response rate
        const respondedReviews = reviews.filter(review => review.hasResponse).length;
        const responseRate = totalReviews > 0 ? (respondedReviews / totalReviews) * 100 : 0;
        
        // Prepare chart data
        const ratings = [1, 2, 3, 4, 5].map(rating => ({
            rating,
            count: reviews.filter(r => r.rating === rating).length
        }));
        
        const reviewTypes = [
            { name: 'В ресторане', value: reviewsByType.inRestaurant },
            { name: 'Доставка', value: reviewsByType.delivery }
        ];
        
        // Get responses data for the last 7 days
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
        console.error('Error fetching manager statistics:', error);
        res.status(500).json({ message: 'Error fetching manager statistics' });
    }
};

/**
 * Get reviews for manager dashboard
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

        // Transform the data for the frontend
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

        // Log the number of reviews found
        console.log(`Found ${reviews.length} reviews for manager dashboard`);
        
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return errorHandler(res, 'Failed to fetch reviews', 500, error);
    }
};

/**
 * Respond to a review
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const respondToReview = async (req, res) => {
    try {
        // Handle both formats: /reviews/:id/response and /reviews/respond
        const reviewId = req.params.id || req.body.reviewId;
        const responseText = req.body.text || req.body.responseText;
        const managerId = req.user?.id || 1; // Use a default manager ID if not available
        
        console.log('Responding to review:', { reviewId, responseText });

        if (!reviewId) {
            return res.status(400).json({
                message: 'Review ID is required'
            });
        }

        if (!responseText) {
            return res.status(400).json({
                message: 'Response text is required'
            });
        }

        // Check if review exists
        const [reviewCheck] = await pool.query('SELECT id FROM reviews WHERE id = ?', [reviewId]);
        if (reviewCheck.length === 0) {
            return res.status(404).json({
                message: 'Review not found'
            });
        }

        // Check if response already exists
        const [responseCheck] = await pool.query('SELECT id FROM manager_responses WHERE review_id = ?', [reviewId]);
        
        if (responseCheck.length > 0) {
            // Update existing response
            await pool.query(
                'UPDATE manager_responses SET response_text = ?, updated_at = NOW() WHERE review_id = ?',
                [responseText, reviewId]
            );
            console.log(`Updated existing response for review ${reviewId}`);
        } else {
            // Create new response
            await pool.query(
                'INSERT INTO manager_responses (review_id, manager_id, response_text, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
                [reviewId, managerId, responseText]
            );
            console.log(`Created new response for review ${reviewId}`);
        }

        res.json({
            success: true,
            message: 'Response submitted successfully'
        });
    } catch (error) {
        console.error('Error responding to review:', error);
        return errorHandler(res, 'Failed to respond to review', 500, error);
    }
};

/**
 * Get statistics for manager dashboard
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStats = async (req, res) => {
    try {
        // Get total number of reviews
        const [totalReviews] = await pool.query('SELECT COUNT(*) as count FROM reviews');
        
        // Get number of responded reviews
        const [respondedReviews] = await pool.query('SELECT COUNT(*) as count FROM manager_responses');
        
        // Get average rating
        const [avgRating] = await pool.query('SELECT AVG(rating) as avg FROM reviews');
        
        // Get total number of restaurants
        const [totalRestaurants] = await pool.query('SELECT COUNT(*) as count FROM restaurants');

        // Make sure to handle null or undefined values
        const stats = {
            totalReviews: totalReviews[0]?.count || 0,
            respondedReviews: respondedReviews[0]?.count || 0,
            pendingReviews: (totalReviews[0]?.count || 0) - (respondedReviews[0]?.count || 0),
            averageRating: avgRating[0]?.avg || 0,
            totalRestaurants: totalRestaurants[0]?.count || 0
        };

        // Ensure the response format is consistent
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
 * Get chart data for manager dashboard
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getChartData = async (req, res) => {
    try {
        const period = req.query.period || 'week';
        
        // Define date range based on period
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
        
        // Format startDate for SQL query
        const formattedStartDate = startDate.toISOString().split('T')[0];
        
        try {
            // Get ratings by day
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
            
            // Get review count by day
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
            
            // Get restaurant distribution
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
            
            // Prepare data for charts
            // Convert SQL results to chart-friendly format
            
            // Initialize data for all days of the week
            const ratingData = Array(7).fill(0);
            const countData = Array(7).fill(0);
            
            // Fill in actual data from database
            ratingsByDay.forEach(row => {
                // MySQL DAYOFWEEK: 1 = Sunday, 2 = Monday, ..., 7 = Saturday
                // We adjust the index: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
                const index = row.day_of_week - 1;
                ratingData[index] = parseFloat(row.avg_rating) || 0;
            });
            
            countByDay.forEach(row => {
                const index = row.day_of_week - 1;
                countData[index] = parseInt(row.count) || 0;
            });
            
            // Reorder to start from Monday: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
            const sortedRatings = [
                ratingData[1], // Monday
                ratingData[2], // Tuesday
                ratingData[3], // Wednesday
                ratingData[4], // Thursday
                ratingData[5], // Friday
                ratingData[6], // Saturday
                ratingData[0]  // Sunday
            ];
            
            const sortedCounts = [
                countData[1], // Monday
                countData[2], // Tuesday
                countData[3], // Wednesday
                countData[4], // Thursday
                countData[5], // Friday
                countData[6], // Saturday
                countData[0]  // Sunday
            ];
            
            // Prepare restaurant distribution data
            const restaurantLabels = restaurantDistribution.map(r => r.restaurant_name || 'Неизвестный ресторан');
            const restaurantCounts = restaurantDistribution.map(r => parseInt(r.review_count) || 0);
            
            // Generate colors for restaurants
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
            
            // Ensure we have enough colors
            while (restaurantColors.length < restaurantLabels.length) {
                restaurantColors.push(...restaurantColors);
            }
            
            // Format chart data for frontend
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
            
            // Send formatted data to frontend
            res.json({
                status: 'success',
                data: chartData
            });
        } catch (dbError) {
            console.error('Database error while fetching chart data:', dbError);
            
            // Return default chart data to prevent frontend breaking
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
        console.error('Error in getChartData:', error);
        return errorHandler(res, 'Failed to fetch chart data', 500, error);
    }
};

/**
 * Get restaurants for manager dashboard
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
        console.error('Error fetching restaurants:', error);
        return errorHandler(res, 'Failed to fetch restaurants', 500, error);
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