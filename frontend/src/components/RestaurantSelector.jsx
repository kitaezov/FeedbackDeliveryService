import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';

const RestaurantSelector = ({ onSelect, selectedRestaurantId, isOpen, onClose }) => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await axios.get(`${API_BASE}/api/restaurants`);
                setRestaurants(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load restaurants');
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
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Выберите ресторан</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center py-4">{error}</div>
                ) : (
                    <div className="max-h-96 overflow-y-auto">
                        {restaurants.map((restaurant) => (
                            <button
                                key={restaurant.id}
                                onClick={() => {
                                    onSelect(restaurant);
                                    onClose();
                                }}
                                className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors rounded-md mb-2 ${
                                    selectedRestaurantId === restaurant.id
                                        ? 'bg-blue-50 border border-blue-200'
                                        : ''
                                }`}
                            >
                                <div className="font-medium">{restaurant.name}</div>
                                <div className="text-sm text-gray-500">
                                    {restaurant.address}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantSelector; 