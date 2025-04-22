import axios from 'axios';

// Create API instance with base URL from environment or fallback
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 10000, // 10 seconds timeout
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        // If token exists, add it to the headers
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
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
        } else if (error.request) {
            // Request was made but no response received
            console.error('API Error Request:', error.request);
        } else {
            // Error in setting up the request
            console.error('API Error Setup:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default api; 