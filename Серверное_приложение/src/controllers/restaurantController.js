/**
 * Restaurant Controller
 * Handles restaurant-related requests
 */

const restaurantModel = require('../models/restaurantModel');
const path = require('path');
const fs = require('fs');
const ReviewModel = require('../models/reviewModel');
const pool = require('../config/database');

/**
 * Create a new restaurant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createRestaurant = async (req, res) => {
    try {
        const restaurant = await restaurantModel.create(req.body);
        res.status(201).json(restaurant);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Get all restaurants
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllRestaurants = async (req, res) => {
    try {
        const { category } = req.query;
        const restaurants = await restaurantModel.getAll({ 
            isActive: true,
            category: category
        });
        res.json({ restaurants });
    } catch (error) {
        console.error('Error getting restaurants:', error);
        res.status(500).json({ 
            message: 'Ошибка при получении списка ресторанов',
            error: error.message 
        });
    }
};

/**
 * Get single restaurant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRestaurant = async (req, res) => {
    try {
        const restaurant = await restaurantModel.getById(req.params.id);
        
        if (!restaurant) {
            return res.status(404).json({ message: 'Ресторан не найден' });
        }
        
        res.json({ restaurant });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get restaurant by name
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRestaurantByName = async (req, res) => {
    try {
        const { name } = req.params;
        const restaurant = await restaurantModel.getByName(decodeURIComponent(name));
        
        if (!restaurant) {
            return res.status(404).json({ 
                message: 'Ресторан не найден',
                details: 'Ресторан с указанным именем не существует'
            });
        }
        
        res.json({ 
            message: 'Ресторан успешно получен',
            restaurant 
        });
    } catch (error) {
        console.error('Error getting restaurant by name:', error);
        res.status(500).json({ 
            message: 'Ошибка получения ресторана',
            details: error.message 
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
        const restaurant = await restaurantModel.getBySlug(req.params.slug);
        
        if (!restaurant) {
            return res.status(404).json({ message: 'Ресторан не найден' });
        }
        
        res.json({ restaurant });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Update restaurant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateRestaurant = async (req, res) => {
    try {
        const success = await restaurantModel.update(req.params.id, req.body);
        
        if (!success) {
            return res.status(404).json({ message: 'Ресторан не найден' });
        }
        
        const updatedRestaurant = await restaurantModel.getById(req.params.id);
        res.json(updatedRestaurant);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Delete restaurant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteRestaurant = async (req, res) => {
    try {
        const success = await restaurantModel.delete(req.params.id);
        
        if (!success) {
            return res.status(404).json({ message: 'Ресторан не найден' });
        }
        
        res.json({ message: 'Ресторан успешно удален' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Обновление критериев ресторана
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateRestaurantCriteria = async (req, res) => {
    try {
        const { id } = req.params;
        const { criteria } = req.body;
        
        // Проверяем, существует ли ресторан
        const restaurant = await restaurantModel.getById(id);
        if (!restaurant) {
            return res.status(404).json({
                message: 'Ресторан не найден',
                details: 'Ресторан с указанным ID не существует'
            });
        }
        
        // Обновляем критерии
        const success = await restaurantModel.updateCriteria(id, criteria);
        
        res.json({
            message: 'Критерии ресторана успешно обновлены',
            success
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
 * Поиск ресторанов по имени
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const searchRestaurants = async (req, res) => {
    try {
        const { q: query, category } = req.query;
        
        if (!query || query.trim() === '') {
            return res.status(400).json({
                message: 'Некорректный запрос',
                details: 'Поисковый запрос не может быть пустым'
            });
        }
        
        // Поиск ресторанов в модели с учетом категории
        const restaurants = await restaurantModel.search(query, category);
        
        res.json({
            message: 'Поиск выполнен успешно',
            restaurants,
            meta: {
                total: restaurants.length,
                query,
                category: category || 'all'
            }
        });
    } catch (error) {
        console.error('Ошибка при поиске ресторанов:', error);
        res.status(500).json({
            message: 'Ошибка при поиске ресторанов',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

/**
 * Обновление slug ресторана
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateRestaurantSlug = async (req, res) => {
    try {
        const { id } = req.params;
        const { slug } = req.body;
        
        // Проверяем, существует ли ресторан
        const restaurant = await restaurantModel.getById(id);
        if (!restaurant) {
            return res.status(404).json({
                message: 'Ресторан не найден',
                details: 'Ресторан с указанным ID не существует'
            });
        }
        
        // Проверяем, существует ли slug
        const existingRestaurant = await restaurantModel.getBySlug(slug);
        if (existingRestaurant) {
            return res.status(400).json({
                message: 'Некорректный slug',
                details: 'Ресторан с таким slug уже существует'
            });
        }
        
        // Обновляем slug
        const success = await restaurantModel.updateSlug(id, slug);
        
        res.json({
            message: 'Slug ресторана успешно обновлен',
            success
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
 * Загрузка изображения ресторана
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadRestaurantImage = async (req, res) => {
    try {
        console.log('Запрос на загрузку изображения ресторана получен');
        console.log('Файл:', req.file ? `Имя: ${req.file.filename}, размер: ${req.file.size}` : 'Файл отсутствует');
        
        // Проверяем, был ли загружен файл
        if (!req.file) {
            console.log('Ошибка: Файл не был загружен');
            return res.status(400).json({
                message: 'Файл не загружен',
                details: 'Необходимо выбрать файл для загрузки'
            });
        }

        const { id } = req.params;
        
        // Проверяем, существует ли ресторан
        const restaurant = await restaurantModel.getById(id);
        if (!restaurant) {
            return res.status(404).json({
                message: 'Ресторан не найден',
                details: 'Ресторан с указанным ID не существует'
            });
        }
        
        const imagePath = `/uploads/restaurants/${req.file.filename}`;
        console.log(`Путь к изображению: ${imagePath}`);

        // Если ресторан уже имеет изображение, удаляем старое
        if (restaurant.image_url) {
            const oldImagePath = path.join(__dirname, '../../public', restaurant.image_url);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
                console.log('Старое изображение удалено:', oldImagePath);
            }
        }

        // Обновляем изображение ресторана в базе данных
        const updatedData = { image_url: imagePath };
        const updatedRestaurant = await restaurantModel.update(id, updatedData);
        
        if (!updatedRestaurant) {
            return res.status(500).json({
                message: 'Ошибка обновления ресторана',
                details: 'Не удалось обновить изображение ресторана'
            });
        }

        res.json({
            message: 'Изображение ресторана успешно загружено',
            imageUrl: imagePath
        });
    } catch (error) {
        console.error('Ошибка загрузки изображения ресторана:', error);
        res.status(500).json({
            message: 'Ошибка загрузки изображения ресторана',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

/**
 * Обновить категорию ресторана
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateRestaurantCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { category } = req.body;
        
        if (!category) {
            return res.status(400).json({
                message: 'Категория не указана',
                details: 'Необходимо указать категорию ресторана'
            });
        }
        
        // Проверяем, существует ли ресторан
        const restaurant = await restaurantModel.getById(id);
        if (!restaurant) {
            return res.status(404).json({
                message: 'Ресторан не найден',
                details: 'Ресторан с указанным ID не существует'
            });
        }
        
        // Обновляем категорию
        const success = await restaurantModel.updateCategory(id, category);
        
        if (success) {
            const updatedRestaurant = await restaurantModel.getById(id);
            res.json({
                message: 'Категория ресторана успешно обновлена',
                restaurant: updatedRestaurant
            });
        } else {
            res.status(500).json({
                message: 'Ошибка обновления категории',
                details: 'Не удалось обновить категорию ресторана'
            });
        }
    } catch (error) {
        console.error('Ошибка обновления категории ресторана:', error);
        res.status(500).json({
            message: 'Ошибка обновления категории ресторана',
            details: error.message
        });
    }
};

/**
 * Get reviews for a specific restaurant
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getRestaurantReviews = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10, sortBy = 'latest' } = req.query;
        
        console.log(`Getting reviews for restaurant ID: ${id}, page: ${page}, limit: ${limit}, sortBy: ${sortBy}`);
        
        // Validate the restaurant ID
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Необходимо указать ID ресторана'
            });
        }
        
        // Get the restaurant to check if it exists
        const [restaurant] = await pool.execute(
            'SELECT * FROM restaurants WHERE id = ?',
            [id]
        );
        
        // If restaurant doesn't exist, return appropriate message
        if (restaurant.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Ресторан не найден'
            });
        }
        
        // Get the user ID from token if available
        const userId = req.user ? req.user.id : null;
        
        // Get reviews for this restaurant
        const reviewModel = new ReviewModel();
        const result = await reviewModel.getAll({
            page: parseInt(page),
            limit: parseInt(limit),
            restaurantName: restaurant[0].name,
            currentUserId: userId,
            sortBy
        });
        
        console.log(`Found ${result.reviews.length} reviews for restaurant ${id} (${restaurant[0].name})`);
        
        // Return the reviews
        return res.json({
            success: true,
            reviews: result.reviews,
            pagination: result.pagination,
            restaurantName: restaurant[0].name
        });
    } catch (error) {
        console.error('Error getting restaurant reviews:', error);
        return res.status(500).json({
            success: false,
            message: 'Ошибка при получении отзывов ресторана',
            error: error.message
        });
    }
};

// Экспортируем все функции контроллера
module.exports = {
    createRestaurant,
    getAllRestaurants,
    getRestaurant,
    getRestaurantByName,
    getRestaurantBySlug,
    updateRestaurant,
    deleteRestaurant,
    updateRestaurantCriteria,
    searchRestaurants,
    updateRestaurantSlug,
    uploadRestaurantImage,
    updateRestaurantCategory,
    getRestaurantReviews
}; 