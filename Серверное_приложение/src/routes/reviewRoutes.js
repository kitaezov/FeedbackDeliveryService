/**
 * Review Routes
 */

const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken, checkRole } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Путь для хранения фотографий отзывов
const uploadsDir = path.join(__dirname, '../../public/uploads');
const reviewsDir = path.join(uploadsDir, 'reviews');
const receiptsDir = path.join(uploadsDir, 'receipts');

// Проверяем, существуют ли директории, и создаем их, если они не существуют
if (!fs.existsSync(path.join(__dirname, '../../public'))) {
    fs.mkdirSync(path.join(__dirname, '../../public'), { recursive: true });
}

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(reviewsDir)) {
    fs.mkdirSync(reviewsDir, { recursive: true });
}

if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
}

// Настраиваем хранилище для разных типов файлов
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // Разные пути назначения в зависимости от имени поля
        const destination = file.fieldname === 'receiptPhoto' 
            ? receiptsDir 
            : reviewsDir;
        
        if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
        }
        cb(null, destination);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const prefix = file.fieldname === 'receiptPhoto' ? 'receipt-' : 'review-';
        const filename = prefix + uniqueSuffix + ext;
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

// Настраиваем загрузчик с простыми настройками
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 МБ
    }
});

// Создает конфигурацию полей для обработки как обычных фотографий, так и фотографий чеков
const uploadFields = upload.fields([
    { name: 'photos', maxCount: 5 },
    { name: 'receiptPhoto', maxCount: 1 }
]);

// Обработка ошибок для multer
const handleMulterError = (err, req, res, next) => {
    console.error('Multer error details:', err);
    if (err instanceof multer.MulterError) {
        // Произошла ошибка при загрузке
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'Превышен размер файла',
                details: 'Максимальный размер файла: 5MB'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                message: 'Неожиданное поле', 
                details: `Поле не соответствует ожидаемой структуре формы: ${err.field}`
            });
        }
        return res.status(400).json({
            message: 'Ошибка при загрузке файлов',
            details: err.message
        });
    }
    if (err) {
        // Обработка других ошибок
        return res.status(500).json({
            message: 'Ошибка сервера при загрузке файлов', 
            details: err.message
        });
    }
    next();
};

/**
 * @route POST /api/reviews/with-photos
 * @desc Создать отзыв с фотографиями
 * @access Private
 */
router.post('/with-photos', authenticateToken, (req, res, next) => {
    console.log('Processing /with-photos request...');
    uploadFields(req, res, (err) => {
        console.log('Multer finished processing, err:', err ? err.message : 'none');
        if (err) {
            return handleMulterError(err, req, res, next);
        }
        console.log('Files received:', req.files ? Object.keys(req.files) : 'none');
        console.log('Body fields received:', Object.keys(req.body));
        next();
    });
}, reviewController.createReviewWithPhotos);

/**
 * @route POST /api/reviews
 * @desc Создать новый отзыв
 * @access Private
 */
router.post('/', authenticateToken, reviewController.createReview);

/**
 * @route GET /api/reviews
 * @desc Получить все отзывы
 * @access Public
 */
router.get('/', reviewController.getAllReviews);

/**
 * @route POST /api/reviews/vote
 * @desc Голосование за отзыв (вверх/вниз)
 * @access Private
 */
router.post('/vote', authenticateToken, reviewController.voteReview);

/**
 * @route GET /api/reviews/:id
 * @desc Получить отзыв по ID
 * @access Public
 */
router.get('/:id', reviewController.getReviewById);

/**
 * @route PUT /api/reviews/:id
 * @desc Обновить отзыв
 * @access Private
 */
router.put('/:id', authenticateToken, reviewController.updateReview);

/**
 * @route DELETE /api/reviews/:id
 * @desc Удалить отзыв
 * @access Private
 */
router.delete('/:id', authenticateToken, reviewController.deleteReview);

module.exports = router; 