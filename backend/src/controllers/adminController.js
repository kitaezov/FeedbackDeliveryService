/**
 * Admin Controller
 * Handles administrative operations
 */

const userModel = require('../models/userModel');
const reviewModel = require('../models/reviewModel');
const restaurantModel = require('../models/restaurantModel');

/**
 * Get all users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUsers = async (req, res) => {
    try {
        console.log('Admin Controller: Запрос списка пользователей');
        
        const { role } = req.query;
        let { limit, offset } = req.query;
        
        console.log('Параметры запроса:', { role, limit, offset });
        
        // Ensure limit and offset are properly parsed as integers with fallbacks
        limit = limit ? parseInt(limit, 10) : 50;
        offset = offset ? parseInt(offset, 10) : 0;
        
        console.log('Извлечение пользователей из базы данных...');
        
        // Get all users with optional role filter
        const users = await userModel.getAll({
            role,
            limit,
            offset
        });
        
        console.log(`Найдено ${users.length} пользователей`);
        
        // Map database role values back to frontend values
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
        
        // Dump the first few users for debug
        if (mappedUsers.length > 0) {
            console.log('Пример данных пользователя:', JSON.stringify(mappedUsers[0], null, 2));
        }
        
        res.json({
            message: 'Список пользователей получен',
            users: mappedUsers
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
 * Update user role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateUserRole = async (req, res) => {
    try {
        console.log('Received request to update user role:', { 
            params: req.params,
            body: req.body,
            userId: req.params.id,
            requestingUser: req.user
        });
        
        const { id } = req.params;
        const { role } = req.body;
        
        // Validate role
        if (!['user', 'manager', 'admin', 'head_admin'].includes(role)) {
            return res.status(400).json({
                message: 'Некорректная роль',
                details: 'Роль должна быть user, manager, admin или head_admin'
            });
        }
        
        // Check if user exists
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
                details: 'Пользователь с указанным ID не существует'
            });
        }
        
        console.log('Found user:', user);
        
        // Define role hierarchy
        const roleHierarchy = {
            'head_admin': 100,
            'admin': 80,
            'manager': 50,
            'user': 10
        };
        
        const currentUserRoleLevel = roleHierarchy[req.user.role] || 0;
        const targetUserRoleLevel = roleHierarchy[user.role] || 0;
        const newRoleLevel = roleHierarchy[role] || 0;
        
        console.log('Role levels:', {
            currentUserRole: req.user.role,
            currentUserLevel: currentUserRoleLevel,
            targetUserRole: user.role,
            targetUserLevel: targetUserRoleLevel,
            newRole: role,
            newRoleLevel: newRoleLevel
        });
        
        // Prevent modifying users with higher or equal role level
        if (targetUserRoleLevel >= currentUserRoleLevel) {
            return res.status(403).json({
                message: 'Доступ запрещен',
                details: 'Вы не можете изменять роль пользователей с такой же или более высокой ролью'
            });
        }
        
        // Prevent assigning a role higher than your own role
        if (newRoleLevel >= currentUserRoleLevel) {
            return res.status(403).json({
                message: 'Доступ запрещен',
                details: 'Вы не можете назначить роль выше или равную вашей собственной'
            });
        }
        
        // Role-specific restrictions
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
        
        // Protect admin@yandex.ru from role changes by anyone but themselves
        if (user.email === 'admin@yandex.ru' && req.user.email !== 'admin@yandex.ru') {
            return res.status(403).json({
                message: 'Доступ запрещен',
                details: 'Нельзя изменить роль главного администратора'
            });
        }
        
        // Update user role
        console.log(`Updating user ${id} role to ${role}`);
        await userModel.updateRole(id, role);
        
        console.log('Role updated successfully');
        
        res.json({
            message: 'Роль пользователя обновлена',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: role
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
 * Delete a review/comment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        
        // Validate reason
        if (!reason) {
            return res.status(400).json({
                message: 'Причина не указана',
                details: 'Необходимо указать причину удаления комментария'
            });
        }
        
        // Find the review
        const review = await reviewModel.getById(id);
        if (!review) {
            return res.status(404).json({
                message: 'Отзыв не найден',
                details: 'Отзыв с указанным ID не существует'
            });
        }
        
        // Save review to deleted_reviews table before deleting
        await reviewModel.saveDeletedReview(review, {
            deletedBy: req.user.id,
            reason,
            adminName: req.user.name
        });
        
        // Delete the review
        await reviewModel.delete(id);
        
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
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

/**
 * Initialize head admin account
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
 * Get all deleted reviews with deletion reasons
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDeletedReviews = async (req, res) => {
    try {
        const { page, limit } = req.query;
        
        // Get deleted reviews with pagination
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
 * Block user account
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
        
        // Validate reason
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
        // Check if user exists
        const user = await userModel.findById(userId);
        console.log('Результат поиска пользователя:', user);
        
        if (!user) {
            console.log('Ошибка: Пользователь не найден');
            return res.status(404).json({
                message: 'Пользователь не найден',
                details: 'Пользователь с указанным ID не существует'
            });
        }
        
        // Define role hierarchy
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
        
        // Prevent modifying users with higher or equal role level
        if (targetUserRoleLevel >= currentUserRoleLevel) {
            console.log('Ошибка: Недостаточно прав для блокировки');
            return res.status(403).json({
                message: 'Доступ запрещен',
                details: 'Вы не можете блокировать пользователей с такой же или более высокой ролью'
            });
        }
        
        // Protect head admin from being blocked
        if (user.email === 'admin@yandex.ru') {
            console.log('Ошибка: Попытка заблокировать главного администратора');
            return res.status(403).json({
                message: 'Доступ запрещен',
                details: 'Нельзя заблокировать главного администратора'
            });
        }
        
        console.log('Блокировка пользователя:', { userId, reason });
        // Block user
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
 * Unblock user account
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
        // Check if user exists
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
 * Get all restaurants
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRestaurants = async (req, res) => {
    try {
        console.log('Fetching restaurants from database...');
        const restaurants = await restaurantModel.getAll();
        console.log('Restaurants fetched:', restaurants);
        res.json({
            message: 'Список ресторанов получен',
            restaurants
        });
    } catch (error) {
        console.error('Ошибка получения ресторанов:', error);
        res.status(500).json({ message: 'Ошибка получения ресторанов' });
    }
};

/**
 * Create a new restaurant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createRestaurant = async (req, res) => {
    try {
        const restaurantData = req.body;
        const newRestaurant = await restaurantModel.create(restaurantData);
        res.status(201).json({
            message: 'Ресторан успешно создан',
            restaurant: newRestaurant
        });
    } catch (error) {
        console.error('Ошибка создания ресторана:', error);
        res.status(500).json({ message: 'Ошибка создания ресторана' });
    }
};

/**
 * Update a restaurant
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
 * Delete a restaurant
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