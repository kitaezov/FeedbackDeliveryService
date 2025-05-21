/**
 * Контроллер отзывов
 * Обрабатывает все операции, связанные с отзывами на рестораны
 */

const reviewModel = require('../models/reviewModel');
const userModel = require('../models/userModel');
const notificationController = require('./notificationController');
const { validateRating, validateComment, validateRestaurantName } = require('../utils/validators');

/**
 * Создать новый отзыв
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
        
        // Проверка входных данных
        if (!userId || !restaurantName || !rating || !comment) {
            return res.status(400).json({
                message: 'Недостаточно данных для создания отзыва',
                details: 'Пожалуйста, заполните все обязательные поля'
            });
        }
        
        // Проверка минимальной длины отзыва
        if (comment.length < 10) {
            return res.status(400).json({
                message: 'Слишком короткий отзыв',
                details: 'Минимальная длина отзыва - 10 символов'
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
        
        // Проверка, существует ли пользователь
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
                details: 'Указанный пользователь не существует в базе данных'
            });
        }
        
        // Создание отзыва
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
        
        // Подготовка отзыва с информацией о пользователе для ответа и трансляции
        const fullReview = {
            id: review.id,
            ...reviewData,
            user_name: user.name,
            user_id: userId,
            userName: user.name,
            date: new Date().toISOString(),
            restaurant_name: restaurantName,
            avatar: user.avatar || null,
            likes: 0,
            ratings: {
                food: foodRating,
                service: serviceRating,
                atmosphere: atmosphereRating,
                price: priceRating,
                cleanliness: cleanlinessRating
            }
        };
        
        // Трансляция нового отзыва всем подключенным клиентам
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
 * Получить все отзывы
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10, userId, restaurantName } = req.query;
        const currentUserId = req.user ? req.user.id : null;
        
        // Получить отзывы
        const reviews = await reviewModel.getAll({
            page: parseInt(page),
            limit: parseInt(limit),
            userId: userId ? parseInt(userId) : undefined,
            restaurantName,
            currentUserId
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
 * Получить отзыв по ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user ? req.user.id : null;
        
        const review = await reviewModel.getById(parseInt(id), currentUserId);
        
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
 * Обновить отзыв
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
        
        // Получить отзыв
        const review = await reviewModel.getById(parseInt(id));
        
        if (!review) {
            return res.status(404).json({
                message: 'Отзыв не найден',
                details: 'Отзыв с указанным идентификатором не существует'
            });
        }
        
        // Проверка, является ли пользователь владельцем или администратором
        if (review.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'moderator') {
            return res.status(403).json({
                message: 'Доступ запрещен',
                details: 'Вы не можете редактировать чужой отзыв'
            });
        }
        
        // Проверка входных данных
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
        
        // Обновление отзыва
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
 * Удалить отзыв
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Получить отзыв
        const review = await reviewModel.getById(parseInt(id));
        
        if (!review) {
            return res.status(404).json({
                message: 'Отзыв не найден',
                details: 'Отзыв с указанным идентификатором не существует'
            });
        }
        
        // Проверка, является ли пользователь владельцем или администратором
        if (review.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'moderator') {
            return res.status(403).json({
                message: 'Доступ запрещен',
                details: 'Вы не можете удалить чужой отзыв'
            });
        }

        // Получаем количество лайков отзыва перед удалением
        const likesCount = review.likes || 0;
        
        // Удаление отзыва
        await reviewModel.delete(parseInt(id));

        // Обновляем счетчик лайков пользователя
        if (likesCount > 0) {
            const reviewAuthor = await userModel.findById(review.user_id);
            if (reviewAuthor) {
                // Уменьшаем количество лайков в профиле пользователя
                await userModel.decreaseLikesCount(review.user_id, likesCount);
            }
        }
        
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
 * Проголосовать за отзыв
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const voteReview = async (req, res) => {
    try {
        const { reviewId, voteType } = req.body;
        const userId = req.user.id;
        
        // Проверка входных данных
        if (!reviewId || !voteType) {
            return res.status(400).json({
                message: 'Недостаточно данных',
                details: 'Необходимо указать ID отзыва и тип голоса'
            });
        }

        if (!['up', 'down'].includes(voteType)) {
            return res.status(400).json({
                message: 'Некорректный тип голоса',
                details: 'Тип голоса должен быть "up" или "down"'
            });
        }
        
        // Проверка, существует ли отзыв
        const review = await reviewModel.getById(parseInt(reviewId, 10));
        if (!review) {
            return res.status(404).json({
                message: 'Отзыв не найден',
                details: 'Отзыв с указанным идентификатором не существует'
            });
        }
        
        // Проверка, не является ли автор отзыва тем же пользователем
        if (review.user_id === userId) {
            return res.status(400).json({
                message: 'Невозможно оценить собственный отзыв',
                details: 'Вы не можете оценить свой собственный отзыв'
            });
        }
        
        // Проверка, не голосовал ли пользователь ранее
        const { voted, voteType: existingVoteType } = await reviewModel.checkVoted(parseInt(reviewId, 10), userId);
        if (voted) {
            return res.status(400).json({
                message: 'Отзыв уже оценен',
                details: 'Вы уже оценили этот отзыв',
                voteType: existingVoteType
            });
        }
        
        // Добавление голоса к отзыву
        await reviewModel.addVote(parseInt(reviewId, 10), voteType);
        
        // Запись голоса
        await reviewModel.recordVote(parseInt(reviewId, 10), userId, voteType);
        
        // Обновление счетчика оценок пользователя
        const reviewAuthor = await userModel.findById(review.user_id);
        if (reviewAuthor) {
            await userModel.updateLikesCount(review.user_id);
        }
        
        res.json({
            message: 'Отзыв успешно оценен',
            success: true,
            voteType
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
 * Создать отзыв с фотографиями
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createReviewWithPhotos = async (req, res) => {
    try {
        console.log('Received files:', req.files);
        console.log('Received body:', req.body);
        
        if (!req.body.reviewData) {
            return res.status(400).json({
                message: 'Недостаточно данных для создания отзыва',
                details: 'Отсутствуют данные отзыва'
            });
        }

        // Разбор данных отзыва из формы
        const reviewData = JSON.parse(req.body.reviewData);
        console.log('Разбор данных отзыва:', reviewData);
        
        const {
            restaurantName,
            rating,
            comment,
            hasReceipt,
            ratings: {
                food: foodRating = 0,
                service: serviceRating = 0,
                atmosphere: atmosphereRating = 0,
                price: priceRating = 0,
                cleanliness: cleanlinessRating = 0
            } = {}
        } = reviewData;
        
        const userId = req.user.id;
        
        // Проверка входных данных
        if (!userId || !restaurantName || !rating || !comment) {
            return res.status(400).json({
                message: 'Недостаточно данных для создания отзыва',
                details: 'Пожалуйста, заполните все обязательные поля'
            });
        }
        
        // Проверка минимальной длины отзыва
        if (comment.length < 10) {
            return res.status(400).json({
                message: 'Слишком короткий отзыв',
                details: 'Минимальная длина отзыва - 10 символов'
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
        
        // Проверка, существует ли пользователь
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
                details: 'Указанный пользователь не существует в базе данных'
            });
        }
        
        // Обработка загруженных фотографий
        const photoUrls = [];
        let receiptPhotoUrl = null;

        // Обработка обычных фотографий
        if (req.files && req.files.photos && req.files.photos.length > 0) {
            console.log('Обработка обычных фотографий:', req.files.photos.length);
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            photoUrls.push(...req.files.photos.map(file => ({
                url: `${baseUrl}/uploads/reviews/${file.filename}`,
                isReceipt: false
            })));
        }

        // Обработка фотографии чека, если она присутствует
        if (req.files && req.files.receiptPhoto && req.files.receiptPhoto.length > 0) {
            console.log('Обработка фотографии чека');
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const receiptFile = req.files.receiptPhoto[0];
            receiptPhotoUrl = `${baseUrl}/uploads/receipts/${receiptFile.filename}`;
            
            // Добавление чека в массив фотографий с особым флагом
            photoUrls.push({
                url: receiptPhotoUrl,
                isReceipt: true
            });
        }
        
        console.log('URL фотографий:', photoUrls);
        console.log('URL фотографии чека:', receiptPhotoUrl);
        
        // Создание отзыва с фотографиями
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
            photos: photoUrls,
            hasReceipt: !!receiptPhotoUrl || hasReceipt,
            receiptPhoto: receiptPhotoUrl
        };
        
        const review = await reviewModel.createWithPhotos(reviewDataWithPhotos);
        
        // Подготовка отзыв а с информацией о пользователе для ответа и трансляции
        const fullReview = {
            id: review.id,
            ...reviewDataWithPhotos,
            user_name: user.name,
            user_id: userId,
            userName: user.name,
            date: new Date().toISOString(),
            restaurant_name: restaurantName,
            avatar: user.avatar || null,
            likes: 0,
            photos: photoUrls,
            hasReceipt: !!receiptPhotoUrl || hasReceipt,
            receiptPhoto: receiptPhotoUrl,
            ratings: {
                food: foodRating,
                service: serviceRating,
                atmosphere: atmosphereRating,
                price: priceRating,
                cleanliness: cleanlinessRating
            }
        };
        
        // Трансляция нового отзыва всем подключенным клиентам
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
    voteReview,
    createReviewWithPhotos
}; 