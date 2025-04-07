import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../../utils/api';
import { API_URL } from '../../config';
import LoadingSpinner from '../../components/LoadingSpinner';

/**
 * Компонент страницы поиска ресторанов
 * @returns {JSX.Element}
 */
const SearchPage = ({ isDarkMode }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Extract search query from URL parameters
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const query = queryParams.get('q');
        if (query) {
            setSearchQuery(query);
            performSearch(query);
        }
    }, [location.search]);

    // Search function to fetch restaurants based on query
    const performSearch = async (query) => {
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await api.get(`/restaurants/search?q=${encodeURIComponent(query)}`);
            setSearchResults(response.data.restaurants || []);
        } catch (err) {
            console.error('Error searching restaurants:', err);
            setError('Не удалось выполнить поиск. Пожалуйста, попробуйте позже.');
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle search form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            performSearch(searchQuery);
        }
    };

    return (
        <div className="mt-4 space-y-6">
            <div className={`p-6 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                
            

                {isLoading && (
                    <div className="flex justify-center my-8">
                        <LoadingSpinner size="md" />
                    </div>
                )}

                {error && (
                    <div className="text-red-500 my-4 p-3 rounded bg-red-100 dark:bg-red-900/20">
                        {error}
                    </div>
                )}

                {!isLoading && !error && searchResults.length === 0 && searchQuery && (
                    <div className={`text-center my-8 py-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <p className="text-lg">По запросу "{searchQuery}" ничего не найдено</p>
                        <p className="mt-2">Попробуйте изменить запрос или поискать другой ресторан</p>
                    </div>
                )}

                {!isLoading && searchResults.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Результаты поиска ({searchResults.length})</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {searchResults.map((restaurant) => (
                                <Link 
                                    key={restaurant.id} 
                                    to={`/restaurant/${restaurant.slug || restaurant.id}`}
                                    className={`block p-4 rounded-lg border transition-colors hover:shadow-md ${
                                        isDarkMode 
                                            ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {restaurant.logo && (
                                        <div className="w-full h-40 mb-3 overflow-hidden rounded">
                                            <img 
                                                src={restaurant.logo.startsWith('http') ? restaurant.logo : `${API_URL}/${restaurant.logo}`}
                                                alt={restaurant.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <h3 className="font-bold text-lg">{restaurant.name}</h3>
                                    
                                    {restaurant.rating && (
                                        <div className="flex items-center mt-2">
                                            <div className={`flex items-center ${
                                                restaurant.rating >= 4 
                                                    ? 'text-green-500' 
                                                    : restaurant.rating >= 3 
                                                        ? 'text-yellow-500' 
                                                        : 'text-red-500'
                                            }`}>
                                                <span className="text-lg font-semibold mr-1">{restaurant.rating.toFixed(1)}</span>
                                                <span>★</span>
                                            </div>
                                            <span className={`mx-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>•</span>
                                            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {restaurant.reviewsCount || 0} отзывов
                                            </span>
                                        </div>
                                    )}
                                    
                                    {restaurant.address && (
                                        <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {restaurant.address}
                                        </p>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage; 