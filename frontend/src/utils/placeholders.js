/**
 * Utility for generating placeholder images as data URLs
 * This replaces the need for external placeholder services like via.placeholder.com
 */

/**
 * Generate a placeholder image as a data URL
 * @param {number} width - Width of the placeholder image
 * @param {number} height - Height of the placeholder image (defaults to width if not provided)
 * @param {string} bgColor - Background color (hex or named color)
 * @param {string} textColor - Text color (hex or named color)
 * @param {string} text - Text to display (defaults to dimensions)
 * @returns {string} - Data URL for the placeholder image
 */
export const generatePlaceholderImage = (width = 150, height = null, bgColor = '#e2e8f0', textColor = '#64748b', text = null) => {
    height = height || width;
    text = text || `${width}×${height}`;
    
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    // Get the canvas context
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    
    // Add text
    ctx.fillStyle = textColor;
    ctx.font = `bold ${Math.max(12, Math.floor(width / 10))}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
    
    // Return data URL
    return canvas.toDataURL('image/png');
};

/**
 * Generate a restaurant placeholder image
 * @returns {string} Data URL for a restaurant placeholder image
 */
export const restaurantPlaceholder = () => {
    return generatePlaceholderImage(150, 150, '#f8fafc', '#94a3b8', 'Ресторан');
};

/**
 * Generate a large restaurant placeholder image
 * @returns {string} Data URL for a large restaurant placeholder image
 */
export const largeRestaurantPlaceholder = () => {
    return generatePlaceholderImage(500, 300, '#f8fafc', '#94a3b8', 'Ресторан');
};

/**
 * Generate a user avatar placeholder image
 * @param {string} initials - User's initials (defaults to "U")
 * @returns {string} Data URL for a user avatar placeholder image
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