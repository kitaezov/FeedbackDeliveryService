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

// Path for storing review photos
const uploadDir = path.join(__dirname, '../../public/uploads/reviews');

// Check if directories exist and create them if they don't
if (!fs.existsSync(path.join(__dirname, '../../public'))) {
    fs.mkdirSync(path.join(__dirname, '../../public'), { recursive: true });
}

if (!fs.existsSync(path.join(__dirname, '../../public/uploads'))) {
    fs.mkdirSync(path.join(__dirname, '../../public/uploads'), { recursive: true });
}

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage for review photos
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = 'review-' + uniqueSuffix + ext;
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

/**
 * @route POST /api/reviews/with-photos
 * @desc Create a review with photos
 * @access Private
 */
router.post('/with-photos', authenticateToken, upload.array('photos', 5), reviewController.createReviewWithPhotos);

/**
 * @route POST /api/reviews
 * @desc Create a new review
 * @access Private
 */
router.post('/', authenticateToken, reviewController.createReview);

/**
 * @route GET /api/reviews
 * @desc Get all reviews
 * @access Public
 */
router.get('/', reviewController.getAllReviews);

/**
 * @route POST /api/reviews/like
 * @desc Like a review
 * @access Private
 */
router.post('/like', authenticateToken, reviewController.likeReview);

/**
 * @route GET /api/reviews/:id
 * @desc Get review by ID
 * @access Public
 */
router.get('/:id', reviewController.getReviewById);

/**
 * @route PUT /api/reviews/:id
 * @desc Update review
 * @access Private
 */
router.put('/:id', authenticateToken, reviewController.updateReview);

/**
 * @route DELETE /api/reviews/:id
 * @desc Delete review
 * @access Private
 */
router.delete('/:id', authenticateToken, reviewController.deleteReview);

module.exports = router; 