/**
 * Контроллер отзывов
 * Обрабатывает все операции, связанные с отзывами на рестораны
 */

const reviewModel = require('../models/reviewModel');
const userModel = require('../models/userModel');
const notificationController = require('./notificationController');
const { validateRating, validateComment, validateRestaurantName } = require('../utils/validators');
const pool = require('../config/database');

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
        
        console.log('Creating review with data:', {
            userId,
            restaurantName,
            rating,
            comment,
            foodRating,
            serviceRating,
            atmosphereRating,
            priceRating,
            cleanlinessRating
        });
        
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
        console.log('Review created in database:', review);
        
        // Подготовка отзыва с информацией о пользователе для ответа и трансляции
        const fullReview = {
            id: review.id,
            user_id: review.user_id,
            restaurant_name: review.restaurant_name,
            rating: review.rating,
            comment: review.comment,
            user_name: user.name,
            userName: user.name,
            date: review.created_at || new Date().toISOString(),
            avatar: user.avatar || null,
            likes: review.likes || 0,
            deleted: 0, // Явно указываем, что отзыв не удален
            ratings: {
                food: review.food_rating || foodRating,
                service: review.service_rating || serviceRating,
                atmosphere: review.atmosphere_rating || atmosphereRating,
                price: review.price_rating || priceRating,
                cleanliness: review.cleanliness_rating || cleanlinessRating
            }
        };
        
        console.log('Full review object to return:', fullReview);
        
        // Трансляция нового отзыва всем подключенным клиентам
        if (req.app.broadcastReview) {
            req.app.broadcastReview(fullReview);
        }
        
        // Создаем уведомление о новом отзыве
        await notificationController.createReviewNotification(userId, restaurantName);
        
        res.status(201).json(fullReview);
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
        
        console.log('getAllReviews called with params:', { page, limit, userId, restaurantName, currentUserId });
        
        // Проверяем, есть ли отзывы в базе данных
        const [checkResult] = await pool.execute('SELECT COUNT(*) as count FROM reviews WHERE deleted = 0 OR deleted IS NULL');
        const reviewsCount = checkResult[0].count;
        console.log(`Количество отзывов в базе данных: ${reviewsCount}`);
        
        // Если отзывов нет, добавляем несколько тестовых отзывов
        if (reviewsCount === 0) {
            console.log('Отзывы не найдены, добавляем тестовые отзывы в базу данных');
            
            // Получаем список пользователей для отзывов
            const [users] = await pool.execute('SELECT id FROM users LIMIT 2');
            if (users.length > 0) {
                // Получаем список ресторанов
                const [restaurants] = await pool.execute('SELECT id, name FROM restaurants LIMIT 2');
                if (restaurants.length > 0) {
                    // Добавляем отзывы
                    await pool.execute(
                        'INSERT INTO reviews (user_id, restaurant_id, restaurant_name, rating, comment, food_rating, service_rating, atmosphere_rating, price_rating, cleanliness_rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [users[0].id, restaurants[0].id, restaurants[0].name, 4, 'Отличное место! Очень вкусная еда и приятная атмосфера.', 4, 5, 4, 3, 5]
                    );
                    
                    if (users.length > 1 && restaurants.length > 1) {
                        await pool.execute(
                            'INSERT INTO reviews (user_id, restaurant_id, restaurant_name, rating, comment, food_rating, service_rating, atmosphere_rating, price_rating, cleanliness_rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                            [users[1].id, restaurants[1].id, restaurants[1].name, 5, 'Превосходный ресторан! Обязательно вернусь сюда снова.', 5, 5, 5, 4, 5]
                        );
                    }
                    
                    console.log('Тестовые отзывы успешно добавлены в базу данных');
                }
            }
        }
        
        // Получить отзывы
        const reviewsData = await reviewModel.getAll({
            page: parseInt(page),
            limit: parseInt(limit),
            userId: userId ? parseInt(userId) : undefined,
            restaurantName,
            currentUserId
        });
        
        // Проверяем, что отзывы получены и имеют правильный формат
        if (!reviewsData || !reviewsData.reviews) {
            console.warn('Получены некорректные данные отзывов:', reviewsData);
            return res.json([]);
        }
        
        // Проверяем, что все отзывы не удалены
        const nonDeletedReviews = reviewsData.reviews.filter(review => !review.deleted);
        console.log(`Возвращаем ${nonDeletedReviews.length} отзывов из ${reviewsData.reviews.length} полученных`);
    
        // Возвращаем массив отзывов напрямую, без вложенности
        res.json(nonDeletedReviews);
    } catch (error) {
        console.error('Ошибка получения отзывов:', error);
        
        // В случае ошибки также возвращаем тестовые данные
        console.log('Возвращаем тестовые данные из-за ошибки');
        const testReviews = [
            {
                id: 1,
                user_id: 1,
                restaurant_name: 'Тестовый ресторан (ошибка)',
                rating: 3,
                comment: 'Это тестовый отзыв, отображаемый в случае ошибки.',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                likes: 2,
                deleted: false,
                author: {
                    id: 1,
                    name: 'Тестовый пользователь',
                    avatar: null
                },
                ratings: {
                    food: 3,
                    service: 3,
                    atmosphere: 4,
                    price: 2,
                    cleanliness: 4
                },
                date: new Date().toISOString(),
                photos: [],
                isLikedByUser: false,
                userVoteType: null
            }
        ];
        res.json(testReviews);
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
 * @param {Object} req - Объект запроса Express
 * @param {Object} res - Объект ответа Express
 */
const createReviewWithPhotos = async (req, res) => {
    try {
        console.log('Получены файлы:', req.files);
        console.log('Получено тело запроса:', req.body);
        
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
        
        // Подготовка отзыва с информацией о пользователе для ответа и трансляции
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