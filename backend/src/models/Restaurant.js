const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    cuisine: {
        type: String,
        default: 'Разная'
    },
    price_range: {
        type: String,
        default: '₽₽'
    },
    image_url: {
        type: String,
        default: 'https://img.freepik.com/free-photo/restaurant-interior_1127-3392.jpg?w=740'
    },
    address: {
        type: String,
        default: 'Адрес не указан'
    },
    contact_phone: {
        type: String,
        default: 'Телефон не указан'
    },
    hours: {
        type: String,
        default: '10:00 - 22:00'
    },
    website: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: 'Описание отсутствует'
    },
    rating: {
        type: Number,
        default: 0
    },
    slug: {
        type: String,
        unique: true,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Create slug from name before saving
restaurantSchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-zA-Zа-яА-Я0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
    next();
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant; 