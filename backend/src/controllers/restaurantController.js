/**
 * Restaurant Controller
 * Handles restaurant-related requests
 */

const restaurantModel = require('../models/restaurantModel');

/**
 * Create a new restaurant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createRestaurant = async (req, res) => {
    try {
        console.log('===== Received restaurant creation request =====');
        console.log('Request body:', req.body);
        
        const {
            name,
            address,
            description,
            imageUrl,
            website,
            contactPhone,
            criteria,
            autoGenerateLink,
            category,
            price_range,
            min_price,
            delivery_time
        } = req.body;
        
        console.log('=== Extracted fields ===');
        console.log('Category:', category);
        console.log('Price Range:', price_range);
        console.log('Min Price:', min_price);
        console.log('Delivery Time:', delivery_time);
        console.log('========================');
        
        // Validate input
        if (!name) {
            return res.status(400).json({
                message: 'Недостаточно данных',
                details: 'Название ресторана обязательно'
            });
        }
        
        // Check if restaurant already exists
        const existingRestaurant = await restaurantModel.getByName(name);
        if (existingRestaurant) {
            return res.status(409).json({
                message: 'Ресторан уже существует',
                details: 'Ресторан с таким названием уже существует'
            });
        }
        
        // Create restaurant
        const restaurantData = {
            name,
            address,
            description,
            imageUrl,
            website,
            contactPhone,
            criteria,
            autoGenerateLink: autoGenerateLink !== false, // Default to true
            category,
            price_range,
            min_price,
            delivery_time
        };
        
        console.log('=== Data being sent to model ===');
        console.log(JSON.stringify(restaurantData, null, 2));
        console.log('================================');
        
        const restaurant = await restaurantModel.create(restaurantData);
        
        console.log('=== Created restaurant ===');
        console.log('ID:', restaurant.id);
        console.log('Category:', restaurant.category);
        console.log('Price Range:', restaurant.price_range);
        console.log('Min Price:', restaurant.min_price);
        console.log('Delivery Time:', restaurant.delivery_time);
        console.log('=========================');
        
        res.status(201).json({
            message: 'Ресторан успешно создан',
            restaurant
        });
    } catch (error) {
        console.error('Ошибка создания ресторана:', error);
        res.status(500).json({
            message: 'Ошибка создания ресторана',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

/**
 * Get all restaurants
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllRestaurants = async (req, res) => {
    try {
        const { page, limit, name, isActive } = req.query;
        
        // Get restaurants with pagination
        const restaurants = await restaurantModel.getAll({
            page,
            limit,
            name,
            isActive: isActive === 'true' ? true : (isActive === 'false' ? false : undefined)
        });
        
        res.json({
            message: 'Рестораны успешно получены',
            restaurants
        });
    } catch (error) {
        console.error('Ошибка получения ресторанов:', error);
        res.status(500).json({
            message: 'Ошибка получения ресторанов',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

/**
 * Get restaurant by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRestaurantById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get restaurant
        const restaurant = await restaurantModel.getById(id);
        
        if (!restaurant) {
            return res.status(404).json({
                message: 'Ресторан не найден',
                details: 'Ресторан с указанным ID не существует'
            });
        }
        
        res.json({
            message: 'Ресторан успешно получен',
            restaurant
        });
    } catch (error) {
        console.error('Ошибка получения ресторана:', error);
        res.status(500).json({
            message: 'Ошибка получения ресторана',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

/**
 * Get restaurant by slug
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRestaurantBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        
        // Get restaurant by slug
        const restaurant = await restaurantModel.getBySlug(slug);
        
        if (!restaurant) {
            return res.status(404).json({
                message: 'Ресторан не найден',
                details: 'Ресторан с указанным URL не существует'
            });
        }
        
        res.json({
            message: 'Ресторан успешно получен',
            restaurant
        });
    } catch (error) {
        console.error('Ошибка получения ресторана по slug:', error);
        res.status(500).json({
            message: 'Ошибка получения ресторана',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

/**
 * Update restaurant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateRestaurant = async (req, res) => {
    try {
        console.log('===== Received restaurant update request =====');
        console.log('Request body:', req.body);
        
        const { id } = req.params;
        const {
            name,
            address,
            description,
            imageUrl,
            website,
            contactPhone,
            isActive,
            criteria,
            autoGenerateLink,
            category,
            price_range,
            min_price,
            delivery_time
        } = req.body;
        
        console.log('=== Extracted fields for update ===');
        console.log('ID:', id);
        console.log('Category:', category);
        console.log('Price Range:', price_range);
        console.log('Min Price:', min_price);
        console.log('Delivery Time:', delivery_time);
        console.log('=================================');
        
        // Check if restaurant exists
        const restaurant = await restaurantModel.getById(id);
        if (!restaurant) {
            return res.status(404).json({
                message: 'Ресторан не найден',
                details: 'Ресторан с указанным ID не существует'
            });
        }
        
        // If name is being updated, check if it's already taken
        if (name && name !== restaurant.name) {
            const existingRestaurant = await restaurantModel.getByName(name);
            if (existingRestaurant && existingRestaurant.id !== parseInt(id)) {
                return res.status(409).json({
                    message: 'Название ресторана занято',
                    details: 'Ресторан с таким названием уже существует'
                });
            }
        }
        
        // Prepare update data
        const updateData = {
            name,
            address,
            description,
            imageUrl,
            website,
            contactPhone,
            isActive,
            criteria,
            autoGenerateLink,
            category,
            price_range,
            min_price,
            delivery_time
        };
        
        console.log('=== Data being sent to model for update ===');
        console.log(JSON.stringify(updateData, null, 2));
        console.log('==========================================');
        
        // Update restaurant
        await restaurantModel.update(id, updateData);
        
        // Get updated restaurant
        const updatedRestaurant = await restaurantModel.getById(id);
        
        console.log('=== Updated restaurant ===');
        console.log('ID:', updatedRestaurant.id);
        console.log('Category:', updatedRestaurant.category);
        console.log('Price Range:', updatedRestaurant.price_range);
        console.log('Min Price:', updatedRestaurant.min_price);
        console.log('Delivery Time:', updatedRestaurant.delivery_time);
        console.log('=========================');
        
        res.json({
            message: 'Ресторан успешно обновлен',
            restaurant: updatedRestaurant
        });
    } catch (error) {
        console.error('Ошибка обновления ресторана:', error);
        res.status(500).json({
            message: 'Ошибка обновления ресторана',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

/**
 * Update restaurant slug manually
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateRestaurantSlug = async (req, res) => {
    try {
        const { id } = req.params;
        const { slug } = req.body;
        
        // Validate slug
        if (!slug || typeof slug !== 'string') {
            return res.status(400).json({
                message: 'Некорректный slug',
                details: 'Slug должен быть непустой строкой'
            });
        }
        
        // Clean the slug to ensure it's URL-friendly
        const cleanSlug = slug
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
        
        if (cleanSlug !== slug) {
            return res.status(400).json({
                message: 'Некорректный slug',
                details: 'Slug должен содержать только буквы, цифры, дефисы и подчеркивания'
            });
        }
        
        // Check if restaurant exists
        const restaurant = await restaurantModel.getById(id);
        if (!restaurant) {
            return res.status(404).json({
                message: 'Ресторан не найден',
                details: 'Ресторан с указанным ID не существует'
            });
        }
        
        // Check if slug is already taken
        const existingRestaurant = await restaurantModel.getBySlug(slug);
        if (existingRestaurant && existingRestaurant.id !== parseInt(id)) {
            return res.status(409).json({
                message: 'Slug уже занят',
                details: 'Ресторан с таким slug уже существует'
            });
        }
        
        // Update slug
        await restaurantModel.updateSlug(id, slug);
        
        // Get updated restaurant
        const updatedRestaurant = await restaurantModel.getById(id);
        
        res.json({
            message: 'Slug ресторана успешно обновлен',
            restaurant: updatedRestaurant
        });
    } catch (error) {
        console.error('Ошибка обновления slug ресторана:', error);
        res.status(500).json({
            message: 'Ошибка обновления slug ресторана',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

/**
 * Delete restaurant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if restaurant exists
        const restaurant = await restaurantModel.getById(id);
        if (!restaurant) {
            return res.status(404).json({
                message: 'Ресторан не найден',
                details: 'Ресторан с указанным ID не существует'
            });
        }
        
        // Delete restaurant
        await restaurantModel.delete(id);
        
        res.json({
            message: 'Ресторан успешно удален'
        });
    } catch (error) {
        console.error('Ошибка удаления ресторана:', error);
        res.status(500).json({
            message: 'Ошибка удаления ресторана',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

/**
 * Update restaurant criteria
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateRestaurantCriteria = async (req, res) => {
    try {
        const { id } = req.params;
        const { criteria } = req.body;
        
        // Check if restaurant exists
        const restaurant = await restaurantModel.getById(id);
        if (!restaurant) {
            return res.status(404).json({
                message: 'Ресторан не найден',
                details: 'Ресторан с указанным ID не существует'
            });
        }
        
        // Update criteria
        await restaurantModel.updateCriteria(id, criteria);
        
        // Get updated restaurant
        const updatedRestaurant = await restaurantModel.getById(id);
        
        res.json({
            message: 'Критерии ресторана успешно обновлены',
            restaurant: updatedRestaurant
        });
    } catch (error) {
        console.error('Ошибка обновления критериев ресторана:', error);
        res.status(500).json({
            message: 'Ошибка обновления критериев ресторана',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

/**
 * Search restaurants by name
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const searchRestaurants = async (req, res) => {
    try {
        const { q: query } = req.query;
        
        if (!query || query.trim() === '') {
            return res.status(400).json({
                message: 'Некорректный запрос',
                details: 'Поисковый запрос не может быть пустым'
            });
        }
        
        // Search restaurants in the model
        const restaurants = await restaurantModel.search(query);
        
        res.json({
            message: 'Поиск выполнен успешно',
            restaurants
        });
    } catch (error) {
        console.error('Ошибка при поиске ресторанов:', error);
        res.status(500).json({
            message: 'Ошибка при поиске ресторанов',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

// Export all the controller functions
module.exports = {
    createRestaurant,
    getAllRestaurants,
    getRestaurantById,
    getRestaurantBySlug,
    updateRestaurant,
    updateRestaurantSlug,
    deleteRestaurant,
    updateRestaurantCriteria,
    searchRestaurants
}; 