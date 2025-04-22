import axios from 'axios';

// Create API instance with base URL from environment or fallback
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 15000, // 15 seconds timeout
    headers: {
        'Content-Type': 'application/json'
    }
});

// Function to fix URLs that might be missing the /api prefix
export const fixApiUrl = (url) => {
    // If it's already a full URL, return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    
    // Remove leading slash from all paths since baseURL already includes the trailing slash
    // This prevents baseURL/api + /api/route from becoming baseURL/api/api/route
    return url.startsWith('/') ? url.substring(1) : url;
};

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        // If token exists, add it to the headers
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Fix the URL to ensure it has the correct /api prefix
        config.url = fixApiUrl(config.url);
        
        // Don't set Content-Type for FormData (multipart/form-data)
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        
        console.log('Отправка запроса:', {
            url: config.url,
            method: config.method,
            baseURL: config.baseURL,
            headers: config.headers
        });
        
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        console.log('Ответ с сервера:', {
            status: response.status,
            url: response.config.url,
            data: response.data
        });
        
        // Standardize response format
        if (response.data && typeof response.data === 'object') {
            // If the response data has a data property, use that as the response
            if (response.data.data !== undefined) {
                return { 
                    ...response, 
                    originalData: response.data,
                    data: response.data.data 
                };
            }
            
            // If the response data has a results property, use that as the response
            if (response.data.results !== undefined) {
                return { 
                    ...response, 
                    originalData: response.data,
                    data: response.data.results 
                };
            }
            
            // If the response data has an items property, use that as the response
            if (response.data.items !== undefined) {
                return { 
                    ...response, 
                    originalData: response.data,
                    data: response.data.items 
                };
            }
        }
        
        return response;
    },
    (error) => {
        // Handle errors
        if (error.response) {
            // Server responded with an error status
            console.error('API Error Response:', error.response.data);
            
            // Handle 401 Unauthorized errors
            if (error.response.status === 401) {
                // Clear stored credentials and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                // Emit an event that can be listened to for auth state changes
                const event = new CustomEvent('auth-error', { 
                    detail: { message: 'Session expired. Please log in again.' } 
                });
                document.dispatchEvent(event);
            }
            
            // Add more structured error information
            error.friendlyMessage = error.response.data?.message || 
                                   error.response.data?.error || 
                                   'Произошла ошибка при взаимодействии с сервером';
        } else if (error.request) {
            // Request was made but no response received
            console.error('API Error Request:', error.request);
            error.friendlyMessage = 'Не удалось получить ответ от сервера. Проверьте подключение к интернету.';
        } else {
            // Error in setting up the request
            console.error('API Error Setup:', error.message);
            error.friendlyMessage = 'Ошибка при настройке запроса. Попробуйте позже.';
        }
        
        return Promise.reject(error);
    }
);

// Custom methods for common requests
api.customGet = async (url, params = {}, options = {}) => {
    try {
        const response = await api.get(url, { params, ...options });
        return response.data;
    } catch (error) {
        console.error(`Error in customGet for ${url}:`, error);
        throw error;
    }
};

api.customPost = async (url, data = {}, options = {}) => {
    try {
        const response = await api.post(url, data, options);
        return response.data;
    } catch (error) {
        console.error(`Error in customPost for ${url}:`, error);
        throw error;
    }
};

export default api; 