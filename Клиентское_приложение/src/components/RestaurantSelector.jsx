import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const RestaurantSelector = ({ onSelect, selectedRestaurantId, isOpen, onClose }) => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await api.get('/restaurants');
                console.log('Restaurant response:', response.data);
                const restaurantsData = Array.isArray(response.data) ? response.data : 
                                      (response.data.restaurants || response.data.data || []);
                setRestaurants(restaurantsData);
                setLoading(false);
            } catch (err) {
                console.error('Error loading restaurants:', err);
                setError('Ошибка загрузки списка ресторанов');
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchRestaurants();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Выберите ресторан</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                        ✕
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center py-4">{error}</div>
                ) : restaurants.length === 0 ? (
                    <div className="text-gray-500 dark:text-gray-400 text-center py-4">
                        Нет доступных ресторанов
                    </div>
                ) : (
                    <div className="max-h-96 overflow-y-auto">
                        {restaurants.map((restaurant) => (
                            <button
                                key={restaurant.id}
                                onClick={() => {
                                    onSelect(restaurant);
                                    onClose();
                                }}
                                className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-md mb-2 ${
                                    selectedRestaurantId === restaurant.id
                                        ? 'bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700'
                                        : ''
                                }`}
                            >
                                <div className="font-medium text-gray-900 dark:text-white">{restaurant.name}</div>
                                {restaurant.address && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {restaurant.address}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantSelector; 