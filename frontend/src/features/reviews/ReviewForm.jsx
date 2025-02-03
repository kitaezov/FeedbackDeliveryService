import React, {useState} from "react";
import {User} from "lucide-react";
import {CompactRatingCategory} from "../../components/RatingStars";
import {AnimatedButton} from "../../components/AnimatedButton";


const restaurantsList = [
    {id: 1, name: "La Belle Cuisine", cuisine: "Французская", priceRange: "₽₽₽"},
    {id: 2, name: "Family Kitchen", cuisine: "Домашняя", priceRange: "₽₽"},
    {id: 3, name: "Meat & Grill", cuisine: "Стейк-хаус", priceRange: "₽₽₽"},
    {id: 4, name: "Italiano Vero", cuisine: "Итальянская", priceRange: "₽₽"},
    {id: 5, name: "Sea Food Paradise", cuisine: "Морепродукты", priceRange: "₽₽₽₽"},
    {id: 6, name: "Sushi Master", cuisine: "Японская", priceRange: "₽₽₽"},
    {id: 7, name: "Spice Garden", cuisine: "Индийская", priceRange: "₽₽"},
    {id: 8, name: "El Taco Loco", cuisine: "Мексиканская", priceRange: "₽₽"}
];


const ratingCategories = [
    {
        id: 'food',
        name: 'Качество блюд',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-gray-600">
                <path d="M3 3l7.5 7.5"/>
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
            </svg>
        )
    },
    {
        id: 'service',
        name: 'Уровень сервиса',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-gray-600">
                <path d="M15.6 11.6 22 7v10l-6.4-4.4a2 2 0 0 1 0-3.2z"/>
                <path d="M3.33 7H11a2 2 0 0 1 2 2v10H3.33A1.33 1.33 0 0 1 2 17.33V8.67A1.33 1.33 0 0 1 3.33 7z"/>
            </svg>
        )
    },
    {
        id: 'atmosphere',
        name: 'Атмосфера заведения',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-gray-600">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M12 12l3-3"/>
            </svg>
        )
    },
    {
        id: 'price',
        name: 'Соотношение цена/качество',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-gray-600">
                <line x1="12" y1="2" x2="12" y2="22"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
        )
    },
    {
        id: 'cleanliness',
        name: 'Чистота помещения',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-gray-600">
                <path d="M20 11V8A8 8 0 0 0 4.4 6.4"/>
                <path d="M20 20v-3a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v3"/>
                <circle cx="12" cy="11" r="3"/>
            </svg>
        )
    }
];

const ReviewForm = ({onSubmit, user}) => {
    const [selectedRestaurant, setSelectedRestaurant] = useState('');
    const [ratings, setRatings] = useState({});
    const [hoveredRatings, setHoveredRatings] = useState({});
    const [feedback, setFeedback] = useState('');

    if (!user) {
        return (
            <div className="text-center py-8">
                <User className="w-16 h-16 mx-auto text-gray-400 mb-4"/>
                <h3 className="text-xl font-semibold mb-2">Требуется авторизация</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Чтобы оставить отзыв, необходимо войти или зарегистрироваться
                </p>
            </div>
        );
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedRestaurant || Object.keys(ratings).length < ratingCategories.length) {
            alert('Пожалуйста, оцените все категории');
            return;
        }

        const averageRating = Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length;

        const newReview = {
            id: Date.now(),
            restaurantName: selectedRestaurant,
            rating: averageRating,
            ratings: ratings,
            comment: feedback,
            date: new Date().toISOString().split('T')[0],
            likes: 0,
            userName: user.name,
            avatar: user.avatar
        };

        onSubmit(newReview);
        setSelectedRestaurant('');
        setRatings({});
        setFeedback('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium mb-2 font-source">Выберите ресторан</label>
                <select
                    value={selectedRestaurant}
                    onChange={(e) => setSelectedRestaurant(e.target.value)}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 font-source"
                    required
                >
                    <option value="">Выберите ресторан</option>
                    {restaurantsList.map(restaurant => (
                        <option key={restaurant.id} value={restaurant.name}>
                            {restaurant.name} - {restaurant.cuisine} ({restaurant.priceRange})
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid gap-2">
                {ratingCategories.map(category => (
                    <CompactRatingCategory
                        key={category.id}
                        category={category}
                        rating={ratings[category.id]}
                        onRate={(value) => setRatings(prev => ({...prev, [category.id]: value}))}
                        hoveredRating={hoveredRatings[category.id]}
                        onHover={(value) => setHoveredRatings(prev => ({...prev, [category.id]: value}))}
                    />
                ))}
            </div>

            <div>
                <label className="block text-sm font-medium mb-2 font-source">Ваш отзыв</label>
                <textarea
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 font-source min-h-[100px]"
                    placeholder="Расскажите о вашем опыте..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    required
                />
            </div>

            <AnimatedButton
                type="submit"
                className="bg-transparent border border-gray-500 text-gray-500 px-6 py-2 rounded-lg hover:bg-gray-800 hover:text-white"
            >
                Отправить отзыв
            </AnimatedButton>
        </form>
    );
};

export {ReviewForm};
