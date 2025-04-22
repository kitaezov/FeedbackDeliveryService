/**
 * Restaurant Controller
 * Handles restaurant-related requests
 */

const restaurantModel = require('../models/restaurantModel');
const path = require('path');
const fs = require('fs');

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
        const restaurants = await restaurantModel.getAll({ isActive: true });
        res.json({ restaurants });
    } catch (error) {
        res.status(500).json({ message: error.message });
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

/**
 * Update restaurant slug
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateRestaurantSlug = async (req, res) => {
    try {
        const { id } = req.params;
        const { slug } = req.body;
        
        // Check if restaurant exists
        const restaurant = await restaurantModel.getById(id);
        if (!restaurant) {
            return res.status(404).json({
                message: 'Ресторан не найден',
                details: 'Ресторан с указанным ID не существует'
            });
        }
        
        // Check if slug is already in use
        const existingRestaurant = await restaurantModel.getBySlug(slug);
        if (existingRestaurant) {
            return res.status(400).json({
                message: 'Некорректный slug',
                details: 'Ресторан с таким slug уже существует'
            });
        }
        
        // Update slug
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
 * Upload restaurant image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadRestaurantImage = async (req, res) => {
    try {
        console.log('Запрос на загрузку изображения ресторана получен');
        console.log('Файл:', req.file ? `Имя: ${req.file.filename}, размер: ${req.file.size}` : 'Файл отсутствует');
        
        // Check if file was uploaded
        if (!req.file) {
            console.log('Ошибка: Файл не был загружен');
            return res.status(400).json({
                message: 'Файл не загружен',
                details: 'Необходимо выбрать файл для загрузки'
            });
        }

        const { id } = req.params;
        
        // Check if restaurant exists
        const restaurant = await restaurantModel.getById(id);
        if (!restaurant) {
            return res.status(404).json({
                message: 'Ресторан не найден',
                details: 'Ресторан с указанным ID не существует'
            });
        }
        
        const imagePath = `/uploads/restaurants/${req.file.filename}`;
        console.log(`Путь к изображению: ${imagePath}`);

        // If restaurant already has an image, delete the old one
        if (restaurant.image_url) {
            const oldImagePath = path.join(__dirname, '../../public', restaurant.image_url);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
                console.log('Старое изображение удалено:', oldImagePath);
            }
        }

        // Update restaurant image in the database
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

// Export all the controller functions
module.exports = {
    createRestaurant,
    getAllRestaurants,
    getRestaurant,
    getRestaurantBySlug,
    updateRestaurant,
    deleteRestaurant,
    updateRestaurantCriteria,
    searchRestaurants,
    updateRestaurantSlug,
    uploadRestaurantImage
}; 