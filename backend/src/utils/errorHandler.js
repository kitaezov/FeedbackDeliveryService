/**
 * Error Handler Utility
 * Provides standardized error handling for API responses
 */

/**
 * Handle API errors with standardized response format
 * @param {Object} res - Express response object
 * @param {string} message - User-friendly error message
 * @param {number} statusCode - HTTP status code
 * @param {Error} error - Original error object
 * @returns {Object} - JSON response with error details
 */
const errorHandler = (res, message, statusCode = 500, error = null) => {
    // Log error details to console for debugging
    console.error(`API Error (${statusCode}): ${message}`);
    if (error) {
        console.error('Original error:', error);
    }
    
    // Send standardized error response
    return res.status(statusCode).json({
        success: false,
        message: message,
        details: error?.message || 'No additional details available',
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    errorHandler
}; 