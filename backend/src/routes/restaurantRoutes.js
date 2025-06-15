/**
 * Маршруты ресторана
 */

const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { authenticateToken, checkRole } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = require('../middleware/upload');

// Путь для хранения изображений ресторанов
const uploadDir = path.join(__dirname, '../../public/uploads/restaurants');

// Создать директории, если они не существуют
if (!fs.existsSync(path.join(__dirname, '../../public'))) {
    fs.mkdirSync(path.join(__dirname, '../../public'), { recursive: true });
}
if (!fs.existsSync(path.join(__dirname, '../../public/uploads'))) {
    fs.mkdirSync(path.join(__dirname, '../../public/uploads'), { recursive: true });
}
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Настроить хранилище для загрузки файлов
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = 'restaurant-' + uniqueSuffix + ext;
        cb(null, filename);
    }
});

// Фильтр для проверки типа файла
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Неподдерживаемый формат файла. Разрешены только JPEG, PNG, GIF и WEBP'), false);
    }
};

// Настроить загрузчик
const uploadMulter = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
});

// Публичные маршруты
router.get('/', restaurantController.getAllRestaurants);
router.get('/search', restaurantController.searchRestaurants);
router.get('/by-name/:name', restaurantController.getRestaurantByName);
router.get('/:id', restaurantController.getRestaurant);
router.get('/by-slug/:slug', restaurantController.getRestaurantBySlug);

// Маршруты администратора (защищенные)
router.post('/', authenticateToken, checkRole('admin'), restaurantController.createRestaurant);
router.post('/:id/image', authenticateToken, checkRole('admin'), uploadMulter.single('image'), restaurantController.uploadRestaurantImage);
router.put('/:id', authenticateToken, checkRole('admin'), restaurantController.updateRestaurant);
router.put('/:id/slug', authenticateToken, checkRole('admin'), restaurantController.updateRestaurantSlug);
router.delete('/:id', authenticateToken, checkRole('admin'), restaurantController.deleteRestaurant);
router.put('/:id/criteria', authenticateToken, checkRole('admin'), restaurantController.updateRestaurantCriteria);
router.put('/:id/category', authenticateToken, restaurantController.updateRestaurantCategory);

module.exports = router; 