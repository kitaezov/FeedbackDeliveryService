/**
 * Profile Routes
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import necessary controller
const authController = require('../controllers/authController');

// Path for storing avatars
const uploadDir = path.join(__dirname, '../../public/uploads/avatars');
console.log('Путь для загрузки аватаров:', uploadDir);

// Check if public directory exists
if (!fs.existsSync(path.join(__dirname, '../../public'))) {
    fs.mkdirSync(path.join(__dirname, '../../public'), { recursive: true });
    console.log('Создана директория public');
}

// Check if uploads directory exists
if (!fs.existsSync(path.join(__dirname, '../../public/uploads'))) {
    fs.mkdirSync(path.join(__dirname, '../../public/uploads'), { recursive: true });
    console.log('Создана директория uploads');
}

// Check if avatars directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Создана директория для аватаров');
}

// Configure storage for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        console.log('Multer destination: Сохранение файла в', uploadDir);
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
            console.log('Директория для аватаров создана при загрузке');
        }
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = 'avatar-' + uniqueSuffix + ext;
        console.log('Multer filename: Новое имя файла', filename);
        cb(null, filename);
    }
});

// Filter for checking file type
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    console.log('Multer fileFilter: Тип файла', file.mimetype);
    if (allowedTypes.includes(file.mimetype)) {
        console.log('Тип файла разрешен');
        cb(null, true);
    } else {
        console.log('Тип файла запрещен');
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

console.log('Маршруты профиля инициализированы, загрузчик настроен');

/**
 * @route POST /api/profile/avatar
 * @desc Upload user avatar
 * @access Private
 */
router.post('/avatar', authenticateToken, upload.single('avatar'), (req, res) => {
    try {
        return authController.uploadAvatar(req, res);
    } catch (error) {
        console.error('Error in avatar upload route:', error);
        res.status(500).json({
            message: 'Ошибка загрузки аватара',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
});

/**
 * @route DELETE /api/profile/avatar
 * @desc Delete user avatar
 * @access Private
 */
router.delete('/avatar', authenticateToken, (req, res) => {
    try {
        return authController.deleteAvatar(req, res);
    } catch (error) {
        console.error('Error in avatar delete route:', error);
        res.status(500).json({
            message: 'Ошибка удаления аватара',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
});

/**
 * @route PUT /api/profile
 * @desc Update user profile information
 * @access Private
 */
router.put('/', authenticateToken, (req, res) => {
    try {
        return authController.updateProfile(req, res);
    } catch (error) {
        console.error('Error in profile update route:', error);
        res.status(500).json({
            message: 'Ошибка обновления профиля',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
});

module.exports = router; 