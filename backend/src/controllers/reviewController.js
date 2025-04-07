/**
 * Review Controller
 * Handles all operations related to restaurant reviews
 */

const reviewModel = require('../models/reviewModel');
const userModel = require('../models/userModel');
const notificationController = require('./notificationController');
const { validateRating, validateComment, validateRestaurantName } = require('../utils/validators');

/**
 * Create a new review
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createReview = async (req, res) => {
    try {
        const {
            restaurantName,
            rating,
            comment,
            ratings: {
                food: foodRating = 0,
                service: serviceRating = 0,
                atmosphere: atmosphereRating = 0,
                price: priceRating = 0,
                cleanliness: cleanlinessRating = 0
            } = {}
        } = req.body;
        
        const userId = req.user.id;
        
        // Validate input
        if (!userId || !restaurantName || !rating || !comment) {
            return res.status(400).json({
                message: 'Недостаточно данных для создания отзыва',
                details: 'Пожалуйста, заполните все обязательные поля'
            });
        }
        
        if (!validateRating(rating)) {
            return res.status(400).json({
                message: 'Некорректная оценка',
                details: 'Оценка должна быть целым числом от 1 до 5'
            });
        }
        
        if (!validateRestaurantName(restaurantName)) {
            return res.status(400).json({
                message: 'Некорректное название ресторана',
                details: 'Название ресторана должно содержать от 1 до 50 символов'
            });
        }
        
        if (!validateComment(comment)) {
            return res.status(400).json({
                message: 'Некорректный комментарий',
                details: 'Комментарий должен содержать от 1 до 1000 символов'
            });
        }
        
        // Check if user exists
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
                details: 'Указанный пользователь не существует в базе данных'
            });
        }
        
        // Create review
        const reviewData = {
            userId,
            restaurantName,
            rating,
            comment,
            foodRating,
            serviceRating,
            atmosphereRating,
            priceRating,
            cleanlinessRating
        };
        
        const review = await reviewModel.create(reviewData);
        
        // Prepare review with user info for response and broadcasting
        const fullReview = {
            id: review.id,
            ...reviewData,
            user_name: user.name,
            user_id: userId,
            userName: user.name,
            date: new Date().toISOString(),
            restaurant_name: restaurantName,
            avatar: `https://i.pravatar.cc/100?u=${user.name}`,
            likes: 0,
            ratings: {
                food: foodRating,
                service: serviceRating,
                atmosphere: atmosphereRating,
                price: priceRating,
                cleanliness: cleanlinessRating
            }
        };
        
        // Broadcast the new review to all connected clients
        if (req.app.broadcastReview) {
            req.app.broadcastReview(fullReview);
        }
        
        // Создаем уведомление о новом отзыве
        await notificationController.createReviewNotification(userId, restaurantName);
        
        res.status(201).json({
            message: 'Отзыв успешно создан',
            review: fullReview
        });
    } catch (error) {
        console.error('Ошибка создания отзыва:', error);
        res.status(500).json({
            message: 'Ошибка создания отзыва',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

/**
 * Get all reviews
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10, userId, restaurantName } = req.query;
        
        // Get reviews
        const reviews = await reviewModel.getAll({
            page: parseInt(page),
            limit: parseInt(limit),
            userId: userId ? parseInt(userId) : undefined,
            restaurantName
        });
        
        res.json({
            message: 'Отзывы успешно получены',
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Ошибка получения отзывов:', error);
        res.status(500).json({
            message: 'Ошибка получения отзывов',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

/**
 * Get review by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get review
        const review = await reviewModel.getById(parseInt(id));
        
        if (!review) {
            return res.status(404).json({
                message: 'Отзыв не найден',
                details: 'Отзыв с указанным идентификатором не существует'
            });
        }
        
        res.json({
            message: 'Отзыв успешно получен',
            review
        });
    } catch (error) {
        console.error('Ошибка получения отзыва:', error);
        res.status(500).json({
            message: 'Ошибка получения отзыва',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

/**
 * Update review
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            rating,
            comment,
            ratings: {
                food: foodRating,
                service: serviceRating,
                atmosphere: atmosphereRating,
                price: priceRating,
                cleanliness: cleanlinessRating
            } = {}
        } = req.body;
        
        // Get review
        const review = await reviewModel.getById(parseInt(id));
        
        if (!review) {
            return res.status(404).json({
                message: 'Отзыв не найден',
                details: 'Отзыв с указанным идентификатором не существует'
            });
        }
        
        // Check if user is the owner or admin
        if (review.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'moderator') {
            return res.status(403).json({
                message: 'Доступ запрещен',
                details: 'Вы не можете редактировать чужой отзыв'
            });
        }
        
        // Validate input
        if (rating && !validateRating(rating)) {
            return res.status(400).json({
                message: 'Некорректная оценка',
                details: 'Оценка должна быть целым числом от 1 до 5'
            });
        }
        
        if (comment && !validateComment(comment)) {
            return res.status(400).json({
                message: 'Некорректный комментарий',
                details: 'Комментарий должен содержать от 1 до 1000 символов'
            });
        }
        
        // Update review
        const reviewData = {
            rating: rating || review.rating,
            comment: comment || review.comment,
            foodRating: foodRating || review.food_rating,
            serviceRating: serviceRating || review.service_rating,
            atmosphereRating: atmosphereRating || review.atmosphere_rating,
            priceRating: priceRating || review.price_rating,
            cleanlinessRating: cleanlinessRating || review.cleanliness_rating
        };
        
        await reviewModel.update(parseInt(id), reviewData);
        
        res.json({
            message: 'Отзыв успешно обновлен',
            review: {
                id: parseInt(id),
                ...reviewData
            }
        });
    } catch (error) {
        console.error('Ошибка обновления отзыва:', error);
        res.status(500).json({
            message: 'Ошибка обновления отзыва',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

/**
 * Delete review
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get review
        const review = await reviewModel.getById(parseInt(id));
        
        if (!review) {
            return res.status(404).json({
                message: 'Отзыв не найден',
                details: 'Отзыв с указанным идентификатором не существует'
            });
        }
        
        // Check if user is the owner or admin
        if (review.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'moderator') {
            return res.status(403).json({
                message: 'Доступ запрещен',
                details: 'Вы не можете удалить чужой отзыв'
            });
        }
        
        // Delete review
        await reviewModel.delete(parseInt(id));
        
        res.json({
            message: 'Отзыв успешно удален'
        });
    } catch (error) {
        console.error('Ошибка удаления отзыва:', error);
        res.status(500).json({
            message: 'Ошибка удаления отзыва',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

/**
 * Like a review
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const likeReview = async (req, res) => {
    try {
        const { reviewId } = req.body;
        const userId = req.user.id;
        
        // Validate input
        if (!reviewId) {
            return res.status(400).json({
                message: 'Недостаточно данных',
                details: 'Необходимо указать ID отзыва'
            });
        }
        
        // Check if review exists
        const review = await reviewModel.getById(parseInt(reviewId, 10));
        if (!review) {
            return res.status(404).json({
                message: 'Отзыв не найден',
                details: 'Отзыв с указанным идентификатором не существует'
            });
        }
        
        // Check if review author is not the same as the user liking it
        if (review.user_id === userId) {
            return res.status(400).json({
                message: 'Невозможно оценить собственный отзыв',
                details: 'Вы не можете оценить свой собственный отзыв'
            });
        }
        
        // Check if user has already liked this review
        const hasLiked = await reviewModel.checkLiked(parseInt(reviewId, 10), userId);
        if (hasLiked) {
            return res.status(400).json({
                message: 'Отзыв уже оценен',
                details: 'Вы уже оценили этот отзыв'
            });
        }
        
        // Add like to the review
        await reviewModel.addLike(parseInt(reviewId, 10));
        
        // Record the like
        await reviewModel.recordLike(parseInt(reviewId, 10), userId);
        
        // Update user's likes count
        const reviewAuthor = await userModel.findById(review.user_id);
        if (reviewAuthor) {
            await userModel.updateLikesCount(review.user_id);
        }
        
        res.json({
            message: 'Отзыв успешно оценен',
            success: true
        });
    } catch (error) {
        console.error('Ошибка при оценке отзыва:', error);
        res.status(500).json({
            message: 'Ошибка при оценке отзыва',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

/**
 * Create a review with photos
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createReviewWithPhotos = async (req, res) => {
    try {
        if (!req.body.reviewData) {
            return res.status(400).json({
                message: 'Недостаточно данных для создания отзыва',
                details: 'Отсутствуют данные отзыва'
            });
        }

        // Parse the review data from the form
        const reviewData = JSON.parse(req.body.reviewData);
        
        const {
            restaurantName,
            rating,
            comment,
            ratings: {
                food: foodRating = 0,
                service: serviceRating = 0,
                atmosphere: atmosphereRating = 0,
                price: priceRating = 0,
                cleanliness: cleanlinessRating = 0
            } = {}
        } = reviewData;
        
        const userId = req.user.id;
        
        // Validate input
        if (!userId || !restaurantName || !rating || !comment) {
            return res.status(400).json({
                message: 'Недостаточно данных для создания отзыва',
                details: 'Пожалуйста, заполните все обязательные поля'
            });
        }
        
        if (!validateRating(rating)) {
            return res.status(400).json({
                message: 'Некорректная оценка',
                details: 'Оценка должна быть целым числом от 1 до 5'
            });
        }
        
        if (!validateRestaurantName(restaurantName)) {
            return res.status(400).json({
                message: 'Некорректное название ресторана',
                details: 'Название ресторана должно содержать от 1 до 50 символов'
            });
        }
        
        if (!validateComment(comment)) {
            return res.status(400).json({
                message: 'Некорректный комментарий',
                details: 'Комментарий должен содержать от 1 до 1000 символов'
            });
        }
        
        // Check if user exists
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
                details: 'Указанный пользователь не существует в базе данных'
            });
        }
        
        // Process uploaded photos
        const photoUrls = [];
        if (req.files && req.files.length > 0) {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            photoUrls.push(...req.files.map(file => `${baseUrl}/uploads/reviews/${file.filename}`));
        }
        
        // Create review with photos
        const reviewDataWithPhotos = {
            userId,
            restaurantName,
            rating,
            comment,
            foodRating,
            serviceRating,
            atmosphereRating,
            priceRating,
            cleanlinessRating,
            photos: photoUrls
        };
        
        const review = await reviewModel.createWithPhotos(reviewDataWithPhotos);
        
        // Prepare review with user info for response and broadcasting
        const fullReview = {
            id: review.id,
            ...reviewDataWithPhotos,
            user_name: user.name,
            user_id: userId,
            userName: user.name,
            date: new Date().toISOString(),
            restaurant_name: restaurantName,
            avatar: user.avatar || `https://i.pravatar.cc/100?u=${user.name}`,
            likes: 0,
            photos: photoUrls,
            ratings: {
                food: foodRating,
                service: serviceRating,
                atmosphere: atmosphereRating,
                price: priceRating,
                cleanliness: cleanlinessRating
            }
        };
        
        // Broadcast the new review to all connected clients
        if (req.app.broadcastReview) {
            req.app.broadcastReview(fullReview);
        }
        
        // Создаем уведомление о новом отзыве
        await notificationController.createReviewNotification(userId, restaurantName);
        
        res.status(201).json({
            message: 'Отзыв успешно создан',
            review: fullReview
        });
    } catch (error) {
        console.error('Ошибка создания отзыва с фотографиями:', error);
        res.status(500).json({
            message: 'Ошибка создания отзыва',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

module.exports = {
    createReview,
    getAllReviews,
    getReviewById,
    updateReview,
    deleteReview,
    likeReview,
    createReviewWithPhotos
}; 