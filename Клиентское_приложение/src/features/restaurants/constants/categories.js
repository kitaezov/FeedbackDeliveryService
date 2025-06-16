/**
 * Категории ресторанов
 */
export const RESTAURANT_CATEGORIES = {
    'all': 'Все рестораны',
    'italian': 'Итальянская кухня',
    'asian': 'Азиатская кухня',
    'russian': 'Русская кухня',
    'seafood': 'Морепродукты',
    'french': 'Французская кухня',
    'georgian': 'Грузинская кухня',
    'mexican': 'Мексиканская кухня',
    'american': 'Американская кухня'
};

/**
 * Получить название категории по её ID
 * @param {string} categoryId - ID категории
 * @returns {string} - Название категории или ID, если категория не найдена
 */
export const getCategoryName = (categoryId) => {
    return RESTAURANT_CATEGORIES[categoryId] || categoryId;
};

/**
 * Получить список категорий для выпадающего списка
 * @returns {Array<{id: string, name: string}>} - Массив объектов категорий
 */
export const getCategoriesList = () => {
    return Object.entries(RESTAURANT_CATEGORIES).map(([id, name]) => ({
        id,
        name
    }));
}; 