/**
 * File Upload Middleware
 * Handles file uploads using multer
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Base upload directory
const baseUploadDir = path.join(__dirname, '../../public/uploads');

// Create base directories if they don't exist
if (!fs.existsSync(path.join(__dirname, '../../public'))) {
    fs.mkdirSync(path.join(__dirname, '../../public'), { recursive: true });
}

if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // Determine the upload directory based on the file type or route
        let uploadDir = baseUploadDir;
        
        if (file.fieldname === 'avatar') {
            uploadDir = path.join(baseUploadDir, 'avatars');
        } else if (file.fieldname === 'restaurant') {
            uploadDir = path.join(baseUploadDir, 'restaurants');
        } else if (file.fieldname === 'menu') {
            uploadDir = path.join(baseUploadDir, 'menus');
        } else if (file.fieldname === 'review' || file.fieldname === 'photos') {
            uploadDir = path.join(baseUploadDir, 'reviews');
        } else if (file.fieldname === 'receiptPhoto') {
            uploadDir = path.join(baseUploadDir, 'receipts');
        }

        // Create the directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const prefix = file.fieldname + '-';
        cb(null, prefix + uniqueSuffix + ext);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    // Allow PDF files for menus
    if (file.fieldname === 'menu') {
        if (file.mimetype === 'application/pdf') {
            return cb(null, true);
        }
    }
    
    // For all other files, check if they are allowed image types
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Неподдерживаемый формат файла. Разрешены только JPEG, PNG, GIF и WEBP'), false);
    }
};

// Create multer instance with configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
});

module.exports = upload; 