/**
 * Контроллер администратора
 * Обрабатывает административные операции
 */

const userModel = require('../models/userModel');
const reviewModel = require('../models/reviewModel');
const restaurantModel = require('../models/restaurantModel');
const pool = require('../config/database');

/**
 * Получить всех пользователей
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUsers = async (req, res) => {
    try {
        console.log('Контроллер администратора: Запрос списка пользователей');
        
        const { role } = req.query;
        let { limit, offset  } = req.query;
        
        console.log('Параметры запроса:', { role, limit, offset });
        
        // Убедитесь, что limit и offset корректно преобразуются в целые числа с fallback
        limit = limit ? parseInt(limit, 10) : 50;
        offset = offset ? parseInt(offset, 10) : 0;
        
        console.log('Извлечение пользователей из базы данных...');
        
        // Получить всех пользователей с необязательным фильтром роли
        const users = await userModel.getAll({
            role,
            limit,
            offset
        });
        
        console.log(`Найдено ${users.length} пользователей`);
        
        // Отобразить значения ролей базы данных обратно на значения переднего плана
        const roleMapping = {
            'user': 'user',
            'mgr': 'manager',
            'admin': 'admin',
            'head': 'head_admin'
        };
        
        const mappedUsers = users.map(user => ({
            ...user,
            role: roleMapping[user.role] || user.role
        }));
        
        // Вывести первые несколько пользователей для отладки
        if (mappedUsers.length > 0) {
            console.log('Пример данных пользователя:', JSON.stringify(mappedUsers[0], null, 2));
        }
        
        res.json({
            users: mappedUsers,
            message: 'Список пользователей получен'
        });
    } catch (error) {
        console.error('Ошибка получения пользователей:', error);
        res.status(500).json({
            message: 'Ошибка получения пользователей',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

/**
 * Обновление роли пользователя
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateUserRole = async (req, res) => {
    try {
        console.log('Получен запрос на обновление роли пользователя:', { 
            params: req.params,
            body: req.body,
            userId: req.params.id,
            requestingUser: req.user
        });
        
        const { id } = req.params;
        const { role, restaurant_id } = req.body;
        
        // Validate role
        if (!['user', 'manager', 'admin', 'head_admin'].includes(role)) {
            return res.status(400).json({
                message: 'Некорректная роль',
                details: 'Роль должна быть user, manager, admin или head_admin'
            });
        }

        // Validate restaurant_id for manager role
        if (role === 'manager') {
            if (!restaurant_id) {
                return res.status(400).json({
                    message: 'Не указан ресторан',
                    details: 'Для роли менеджера необходимо указать ресторан'
                });
            }

            // Check if restaurant exists
            const [restaurantExists] = await pool.execute(
                'SELECT id FROM restaurants WHERE id = ?',
                [restaurant_id]
            );

            if (restaurantExists.length === 0) {
                return res.status(404).json({
                    message: 'Ресторан не найден',
                    details: 'Указанный ресторан не существует'
                });
            }
        }
        
        // Проверьте, существует ли пользователь
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
                details: 'Пользователь с указанным ID не существует'
            });
        }
        
        console.log('Найден пользователь:', user);
        
        // Определить иерархию ролей
        const roleHierarchy = {
            'head_admin': 100,
            'admin': 80,
            'manager': 50,
            'user': 10
        };
        
        const currentUserRoleLevel = roleHierarchy[req.user.role] || 0;
        const targetUserRoleLevel = roleHierarchy[user.role] || 0;
        const newRoleLevel = roleHierarchy[role] || 0;
        
        // Предотвратить изменение ролей пользователей с более высоким или равным уровнем роли
        if (targetUserRoleLevel >= currentUserRoleLevel) {
            return res.status(403).json({
                message: 'Доступ запрещен',
                details: 'Вы не можете изменять роль пользователей с такой же или более высокой ролью'
            });
        }
        
        // Предотвратить назначение роли выше вашей собственной
        if (newRoleLevel >= currentUserRoleLevel) {
            return res.status(403).json({
                message: 'Доступ запрещен',
                details: 'Вы не можете назначить роль выше или равную вашей собственной'
            });
        }
        
        // Ограничения для конкретных ролей
        if (req.user.role === 'admin' && role === 'admin') {
            return res.status(403).json({
                message: 'Доступ запрещен',
                details: 'Только главный администратор может назначать администраторов'
            });
        }
        
        if (req.user.role === 'manager' && role !== 'user') {
            return res.status(403).json({
                message: 'Доступ запрещен',
                details: 'Менеджеры могут только понижать пользователей до обычного статуса'
            });
        }
        
        // Защита admin@yandex.ru от изменений ролей кем-либо, кроме себя
        if (user.email === 'admin@yandex.ru' && req.user.email !== 'admin@yandex.ru') {
            return res.status(403).json({
                message: 'Доступ запрещен',
                details: 'Нельзя изменить роль главного администратора'
            });
        }
        
        // Обновление роли пользователя
        console.log(`Обновление роли пользователя ${id} до ${role} ${restaurant_id ? `с привязкой к ресторану ${restaurant_id}` : ''}`);
        await userModel.updateRole(id, role, role === 'manager' ? restaurant_id : null);
        
        console.log('Роль пользователя успешно обновлена');
        
        res.json({
            message: 'Роль пользователя обновлена',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: role,
                restaurant_id: role === 'manager' ? restaurant_id : null
            }
        });
    } catch (error) {
        console.error('Ошибка обновления роли пользователя:', error);
        res.status(500).json({
            message: 'Ошибка обновления роли пользователя',
            details: 'Произошла внутренняя ошибка сервера',
            error: error.message
        });
    }
};

/**
 * Удалить отзыв/комментарий
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        
        console.log(`Attempting to delete review ${id} with reason: ${reason}`);
        
        // Проверьте причину
        if (!reason) {
            return res.status(400).json({
                message: 'Причина не указана',
                details: 'Необходимо указать причину удаления комментария'
            });
        }
        
        // Найти отзыв
        const review = await reviewModel.getById(id);
        if (!review) {
            return res.status(404).json({
                message: 'Отзыв не найден',
                details: 'Отзыв с указанным ID не существует'
            });
        }
        
        console.log(`Found review to delete:`, { id: review.id, userId: review.user_id });
        
        // Сохранить отзыв в таблицу deleted_reviews перед удалением
        try {
            await reviewModel.saveDeletedReview(review, {
                deletedBy: req.user.id,
                reason,
                adminName: req.user.name
            });
            console.log(`Review ${id} saved to deleted_reviews table`);
        } catch (saveError) {
            // If there's an error saving to deleted_reviews, log it but continue with deletion
            console.error(`Error saving review ${id} to deleted_reviews:`, saveError);
            // Don't return here, continue with deletion
        }
        
        // Удалить отзыв
        await reviewModel.delete(id);
        console.log(`Review ${id} deleted successfully`);
        
        res.json({
            message: 'Отзыв успешно удален',
            deletedReview: {
                id: review.id,
                reason
            }
        });
    } catch (error) {
        console.error('Ошибка удаления отзыва:', error);
        res.status(500).json({
            message: 'Ошибка удаления отзыва',
            details: 'Произошла внутренняя ошибка сервера',
            error: error.message
        });
    }
};

/**
 * Инициализировать главный администратор
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const initializeHeadAdmin = async (req, res) => {
    try {
        const headAdmin = await userModel.ensureHeadAdmin();
        
        res.json({
            message: 'Главный администратор создан или обновлен',
            success: true
        });
    } catch (error) {
        console.error('Ошибка инициализации главного администратора:', error);
        res.status(500).json({
            message: 'Ошибка инициализации главного администратора',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

/**
 * Получить все удаленные отзывы с причинами удаления
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDeletedReviews = async (req, res) => {
    try {
        const { page, limit } = req.query;
        
        // Получить удаленные отзывы с пагинацией
        const deletedReviews = await reviewModel.getDeletedReviews({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10
        });
        
        res.json({
            message: 'Список удаленных отзывов получен',
            deletedReviews
        });
    } catch (error) {
        console.error('Ошибка получения удаленных отзывов:', error);
        res.status(500).json({
            message: 'Ошибка получения удаленных отзывов',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

/**
 * Блокировка аккаунта пользователя
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const blockUser = async (req, res) => {
    try {
        console.log('Начало выполнения функции blockUser');
        console.log('Параметры запроса:', { 
            params: req.params, 
            body: req.body,
            user: req.user,
            headers: req.headers
        });
        
        const { id } = req.params;
        const { reason } = req.body;
        
          // Проверьте причину
        if (!reason || reason.trim() === '') {
            console.log('Ошибка: Причина не указана');
            return res.status(400).json({
                message: 'Причина не указана',
                details: 'Необходимо указать причину блокировки аккаунта'
            });
        }
        
        // Проверяем корректность ID
        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
            console.log('Ошибка: Некорректный ID пользователя:', id);
            return res.status(400).json({
                message: 'Некорректный ID пользователя',
                details: 'ID пользователя должен быть числом'
            });
        }
        
        console.log('Поиск пользователя по ID:', userId);
        // Проверьте, существует ли пользователь
        const user = await userModel.findById(userId);
        console.log('Результат поиска пользователя:', user);
        
        if (!user) {
            console.log('Ошибка: Пользователь не найден');
            return res.status(404).json({
                message: 'Пользователь не найден',
                details: 'Пользователь с указанным ID не существует'
            });
        }
        
        // Определить иерархию ролей
        const roleHierarchy = {
            'head_admin': 100,
            'admin': 80,
            'manager': 50,
            'user': 10
        };
        
        const currentUserRoleLevel = roleHierarchy[req.user.role] || 0;
        const targetUserRoleLevel = roleHierarchy[user.role] || 0;
        
        console.log('Проверка иерархии ролей:', {
            currentUserRole: req.user.role,
            currentUserLevel: currentUserRoleLevel,
            targetUserRole: user.role,
            targetUserLevel: targetUserRoleLevel
        });
        
        // Предотвратить изменение ролей пользователей с более высоким или равным уровнем роли
        if (targetUserRoleLevel >= currentUserRoleLevel) {
            console.log('Ошибка: Недостаточно прав для блокировки');
            return res.status(403).json({
                message: 'Доступ запрещен',
                details: 'Вы не можете блокировать пользователей с такой же или более высокой ролью'
            });
        }
        
        // Защита главного администратора от блокировки
        if (user.email === 'admin@yandex.ru') {
            console.log('Ошибка: Попытка заблокировать главного администратора');
            return res.status(403).json({
                message: 'Доступ запрещен',
                details: 'Нельзя заблокировать главного администратора'
            });
        }
        
        console.log('Блокировка пользователя:', { userId, reason });
        // Блокировка пользователя
        await userModel.blockUser(userId, reason);
        console.log('Пользователь успешно заблокирован');
        
        res.json({
            message: 'Аккаунт пользователя успешно заблокирован',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                blocked: true,
                blocked_reason: reason
            }
        });
    } catch (error) {
        console.error('Ошибка блокировки пользователя:', error);
        console.error('Стек ошибки:', error.stack);
        res.status(500).json({
            message: 'Ошибка блокировки пользователя',
            details: error.message || 'Произошла внутренняя ошибка сервера'
        });
    }
};

/**
 * Разблокировка аккаунта пользователя
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const unblockUser = async (req, res) => {
    try {
        console.log('Начало выполнения функции unblockUser');
        console.log('Параметры запроса:', { 
            params: req.params, 
            user: req.user
        });
        
        const { id } = req.params;
        
        // Проверяем корректность ID
        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
            console.log('Ошибка: Некорректный ID пользователя:', id);
            return res.status(400).json({
                message: 'Некорректный ID пользователя',
                details: 'ID пользователя должен быть числом'
            });
        }
        
        console.log('Поиск пользователя по ID:', userId);
        // Проверьте, существует ли пользователь
        const user = await userModel.findById(userId);
        console.log('Результат поиска пользователя:', user);
        
        if (!user) {
            console.log('Ошибка: Пользователь не найден');
            return res.status(404).json({
                message: 'Пользователь не найден',
                details: 'Пользователь с указанным ID не существует'
            });
        }
        
        console.log('Разблокировка пользователя:', userId);
        // Unblock user
        await userModel.unblockUser(userId);
        console.log('Пользователь успешно разблокирован');
        
        res.json({
            message: 'Аккаунт пользователя успешно разблокирован',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                blocked: false
            }
        });
    } catch (error) {
        console.error('Ошибка разблокировки пользователя:', error);
        console.error('Стек ошибки:', error.stack);
        res.status(500).json({
            message: 'Ошибка разблокировки пользователя',
            details: error.message || 'Произошла внутренняя ошибка сервера'
        });
    }
};

/**
 * Получить все рестораны
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRestaurants = async (req, res) => {
    try {
        console.log('Извлечение ресторанов из базы данных...');
        const restaurants = await restaurantModel.getAll();
        console.log('Рестораны извлечены:', restaurants);

        // Получаем информацию о менеджерах для каждого ресторана
        const restaurantsWithManagers = await Promise.all(restaurants.map(async (restaurant) => {
            try {
                // Получаем менеджеров ресторана
                const [managers] = await pool.execute(`
                    SELECT id, name, email 
                    FROM users 
                    WHERE role = 'manager' AND restaurant_id = ?
                `, [restaurant.id]);

                return {
                    ...restaurant,
                    managers: managers || []
                };
            } catch (error) {
                console.error(`Ошибка получения менеджеров для ресторана ${restaurant.id}:`, error);
                return {
                    ...restaurant,
                    managers: []
                };
            }
        }));

        res.json({
            message: 'Список ресторанов получен',
            restaurants: restaurantsWithManagers
        });
    } catch (error) {
        console.error('Ошибка получения ресторанов:', error);
        res.status(500).json({ message: 'Ошибка получения ресторанов' });
    }
};

/**
 * Создать новый ресторан
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createRestaurant = async (req, res) => {
    try {
        const restaurantData = req.body;

        // Проверяем наличие обязательных полей перед отправкой в модель
        const requiredFields = ['name', 'category', 'price_range', 'delivery_time', 'min_price'];
        const missingFields = requiredFields.filter(field => !restaurantData[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Отсутствуют обязательные поля',
                details: `Следующие поля обязательны для заполнения: ${missingFields.join(', ')}`
            });
        }

        // Проверяем корректность числовых значений
        if (isNaN(restaurantData.min_price) || restaurantData.min_price < 0) {
            return res.status(400).json({
                message: 'Некорректное значение',
                details: 'Минимальная цена заказа должна быть положительным числом'
            });
        }

        if (isNaN(restaurantData.delivery_time) || restaurantData.delivery_time < 0) {
            return res.status(400).json({
                message: 'Некорректное значение',
                details: 'Время доставки должно быть положительным числом'
            });
        }

        const newRestaurant = await restaurantModel.create(restaurantData);
        res.status(201).json({
            message: 'Ресторан успешно создан',
            restaurant: newRestaurant
        });
    } catch (error) {
        console.error('Ошибка создания ресторана:', error);
        res.status(400).json({ 
            message: 'Ошибка создания ресторана',
            details: error.message
        });
    }
};

/**
 * Обновить ресторан
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurantData = req.body;
        const updatedRestaurant = await restaurantModel.update(id, restaurantData);
        res.json({
            message: 'Ресторан успешно обновлен',
            restaurant: updatedRestaurant
        });
    } catch (error) {
        console.error('Ошибка обновления ресторана:', error);
        res.status(500).json({ message: 'Ошибка обновления ресторана' });
    }
};

/**
 * Удалить ресторан
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        await restaurantModel.delete(id);
        res.json({ message: 'Ресторан успешно удален' });
    } catch (error) {
        console.error('Ошибка удаления ресторана:', error);
        res.status(500).json({ message: 'Ошибка удаления ресторана' });
    }
};

module.exports = {
    getUsers,
    updateUserRole,
    deleteReview,
    initializeHeadAdmin,
    getDeletedReviews,
    blockUser,
    unblockUser,
    getRestaurants,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant
}; 