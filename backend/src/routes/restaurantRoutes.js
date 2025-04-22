/**
 * Restaurant Routes
 */

const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { authenticateToken, checkRole } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Path for storing restaurant images
const uploadDir = path.join(__dirname, '../../public/uploads/restaurants');

// Create directories if they don't exist
if (!fs.existsSync(path.join(__dirname, '../../public'))) {
    fs.mkdirSync(path.join(__dirname, '../../public'), { recursive: true });
}
if (!fs.existsSync(path.join(__dirname, '../../public/uploads'))) {
    fs.mkdirSync(path.join(__dirname, '../../public/uploads'), { recursive: true });
}
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage for file uploads
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

// Filter for checking file type
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Неподдерживаемый формат файла. Разрешены только JPEG, PNG, GIF и WEBP'), false);
    }
};

// Configure uploader
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
});

// Public routes
router.get('/', restaurantController.getAllRestaurants);
router.get('/search', restaurantController.searchRestaurants);
router.get('/:id', restaurantController.getRestaurant);
router.get('/by-slug/:slug', restaurantController.getRestaurantBySlug);

// Admin routes (protected)
router.post('/', authenticateToken, checkRole('admin'), restaurantController.createRestaurant);
router.post('/:id/image', authenticateToken, checkRole('admin'), upload.single('image'), restaurantController.uploadRestaurantImage);
router.put('/:id', authenticateToken, checkRole('admin'), restaurantController.updateRestaurant);
router.put('/:id/slug', authenticateToken, checkRole('admin'), restaurantController.updateRestaurantSlug);
router.delete('/:id', authenticateToken, checkRole('admin'), restaurantController.deleteRestaurant);
router.put('/:id/criteria', authenticateToken, checkRole('admin'), restaurantController.updateRestaurantCriteria);

module.exports = router; 