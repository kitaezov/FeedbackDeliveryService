export const restaurantData = {
    1: {
        id: 1,
        name: "La Belle Cuisine",
        description: "Элегантный французский ресторан с изысканной кухней и атмосферой Парижа. Специализируемся на классических французских блюдах, приготовленных с использованием свежайших локальных ингредиентов.",
        logo: "/path/to/la-belle-cuisine-logo.jpg",
        address: "ул. Гастрономическая, 12",
        workingHours: "Пн-Вс: 12:00 - 23:00",
        cuisineType: "Французская",
        averageCheck: "3000-5000 ₽",
        reviews: [], // будет заполняться динамически
        rating: 4.5,
        photos: [
            "/path/to/restaurant-interior1.jpg",
            "/path/to/restaurant-food1.jpg",
            "/path/to/restaurant-exterior.jpg"
        ]
    },
    2: {
        id: 2,
        name: "Italiano Vero",
        description: "Аутентичный итальянский ресторан, предлагающий домашние рецепты из разных регионов Италии. Свежая паста, пицца, приготовленная в дровяной печи, и винная карта от sommelier.",
        logo: "/path/to/italiano-vero-logo.jpg",
        address: "пр. Кулинаров, 45",
        workingHours: "Пн-Вс: 11:00 - 00:00",
        cuisineType: "Итальянская",
        averageCheck: "2500-4500 ₽",
        reviews: [],
        rating: 4.2,
        photos: [
            "/path/to/restaurant-interior2.jpg",
            "/path/to/restaurant-food2.jpg",
            "/path/to/restaurant-exterior2.jpg"
        ]
    }
};

export const getRestaurantByName = (name) => {
    return Object.values(restaurantData).find(
        restaurant => restaurant.name.toLowerCase() === name.toLowerCase()
    );
};