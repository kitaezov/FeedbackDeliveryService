/**
 * Утилита для генерации заполнительных изображений в виде URL-адресов
 * Это заменяет необходимость использования внешних сервисов для заполнителей, таких как via.placeholder.com
 */

/**
 * Генерирует заполнительное изображение в виде URL-адреса
 * @param {number} width - Ширина заполнительного изображения
 * @param {number} height - Высота заполнительного изображения (по умолчанию равна ширине, если не указана)
 * @param {string} bgColor - Цвет фона (шестнадцатеричный или имя цвета)
 * @param {string} textColor - Цвет текста (шестнадцатеричный или имя цвета)
 * @param {string} text - Текст для отображения (по умолчанию размеры изображения)
 * @returns {string} - URL-адрес для заполнительного изображения
 */
export const generatePlaceholderImage = (width = 150, height = null, bgColor = '#e2e8f0', textColor = '#64748b', text = null) => {
    height = height || width;
    text = text || `${width}×${height}`;
    
    // Создать элемент canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    // Получить контекст canvas
    const ctx = canvas.getContext('2d');
    
    // Заполнить фон
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    
    // Добавить текст
    ctx.fillStyle = textColor;
    ctx.font = `bold ${Math.max(12, Math.floor(width / 10))}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
    
    // Вернуть URL-адрес данных
    return canvas.toDataURL('image/png');
};

/**
 * Генерирует заполнительное изображение для ресторана
 * @returns {string} URL-адрес для заполнительного изображения ресторана
 */
export const restaurantPlaceholder = () => {
    return generatePlaceholderImage(150, 150, '#f8fafc', '#94a3b8', 'Ресторан');
};

/**
 * Генерирует заполнительное изображение для большого ресторана
 * @returns {string} URL-адрес для заполнительного изображения большого ресторана
 */
export const largeRestaurantPlaceholder = () => {
    return generatePlaceholderImage(500, 300, '#f8fafc', '#94a3b8', 'Ресторан');
};

/**
 * Генерирует заполнительное изображение для аватара пользователя
 * @param {string} initials - Инициалы пользователя (по умолчанию "U")
 * @returns {string} URL-адрес для заполнительного изображения аватара пользователя
 */
export const userAvatarPlaceholder = (initials = 'U') => {
    return generatePlaceholderImage(100, 100, '#e0f2fe', '#0ea5e9', initials);
};

export default {
    generatePlaceholderImage,
    restaurantPlaceholder,
    largeRestaurantPlaceholder,
    userAvatarPlaceholder
}; 