import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2, AlertTriangle } from 'lucide-react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const CriteriaEditor = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [restaurant, setRestaurant] = useState(null);
    const [criteria, setCriteria] = useState([]);

    // Check if user is admin
    useEffect(() => {
        if (!user || !user.token || !['admin', 'head_admin'].includes(user.role)) {
            navigate('/');
        }
    }, [user, navigate]);

    // Load restaurant data
    useEffect(() => {
        const fetchRestaurant = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/restaurants/${id}`);
                const restaurantData = response.data.restaurant;
                setRestaurant(restaurantData);
                
                // Initialize criteria from restaurant data
                let initialCriteria = [];
                if (restaurantData && restaurantData.criteria) {
                    try {
                        const parsedCriteria = typeof restaurantData.criteria === 'string' 
                            ? JSON.parse(restaurantData.criteria) 
                            : restaurantData.criteria;
                            
                        initialCriteria = Object.entries(parsedCriteria).map(([key, value]) => ({
                            name: key,
                            weight: typeof value === 'number' ? value : 1,
                            isNew: false
                        }));
                    } catch (e) {
                        console.error('Error parsing criteria:', e);
                    }
                }
                
                // Add at least one empty criterion if none exist
                if (initialCriteria.length === 0) {
                    initialCriteria = [{ name: '', weight: 1, isNew: true }];
                }
                
                setCriteria(initialCriteria);
            } catch (error) {
                console.error('Error loading restaurant:', error);
                setError('Не удалось загрузить данные ресторана');
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurant();
    }, [id]);

    // Add new criterion
    const handleAddCriterion = () => {
        setCriteria([...criteria, { name: '', weight: 1, isNew: true }]);
    };

    // Remove criterion
    const handleRemoveCriterion = (index) => {
        const newCriteria = [...criteria];
        newCriteria.splice(index, 1);
        setCriteria(newCriteria);
    };

    // Update criterion name
    const handleChangeCriterionName = (index, value) => {
        const newCriteria = [...criteria];
        newCriteria[index].name = value;
        setCriteria(newCriteria);
    };

    // Update criterion weight
    const handleChangeCriterionWeight = (index, value) => {
        const newCriteria = [...criteria];
        const numValue = parseFloat(value);
        // Ensure weight is between 0.1 and 10, and is a number
        if (!isNaN(numValue) && numValue >= 0.1 && numValue <= 10) {
            newCriteria[index].weight = numValue;
            setCriteria(newCriteria);
        }
    };

    // Save changes
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            // Check if all criteria have names
            const emptyNameIndex = criteria.findIndex(c => !c.name.trim());
            if (emptyNameIndex !== -1) {
                setError('Все критерии должны иметь название');
                setSaving(false);
                return;
            }

            // Convert criteria array to object format expected by API
            const criteriaObject = criteria.reduce((obj, criterion) => {
                obj[criterion.name.trim()] = criterion.weight;
                return obj;
            }, {});

            // Update restaurant criteria
            await api.put(`/restaurants/${id}/criteria`, { criteria: criteriaObject });
            
            navigate('/admin');
        } catch (error) {
            console.error('Error saving criteria:', error);
            setError(error.response?.data?.message || 'Ошибка при сохранении критериев');
        } finally {
            setSaving(false);
        }
    };

    if (loading || !restaurant) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-4 sm:py-8">
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                    <div>
                        <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
                            Критерии оценки ресторана
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600">
                            {restaurant.name}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/admin')}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded flex items-center text-sm"
                    >
                        <ArrowLeft size={16} className="mr-1" /> Назад
                    </button>
                </div>

                {error && (
                    <div className="p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded mx-3 sm:mx-6 mt-3 sm:mt-6 text-sm sm:text-base">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-4 sm:p-6">
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                            <h2 className="text-base sm:text-xl font-semibold text-gray-800">Настройка критериев</h2>
                            <button
                                type="button"
                                onClick={handleAddCriterion}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded flex items-center text-sm overflow-hidden w-full sm:w-auto justify-center sm:justify-start"
                            >
                                <Plus size={16} className="mr-1" /> Добавить критерий
                            </button>
                        </div>
                        
                        <div className="p-3 sm:p-4 bg-gray-100 border border-gray-300 rounded text-sm">
                            <div className="flex items-start">
                                <AlertTriangle size={18} className="text-gray-600 mr-2 mt-0.5" />
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-800">
                                        <strong>Важно:</strong> Критерии оценки используются при отображении рейтинга ресторана.
                                    </p>
                                    <ul className="text-xs sm:text-sm text-gray-700 mt-1 list-disc list-inside">
                                        <li>Каждый критерий должен иметь уникальное имя</li>
                                        <li>Вес определяет важность критерия (от 0.1 до 10)</li>
                                        <li>Удаление критерия повлияет на расчет общего рейтинга</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                            {criteria.map((criterion, index) => (
                                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 border border-gray-200 rounded">
                                    <div className="w-full sm:flex-grow">
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                            Название критерия
                                        </label>
                                        <input
                                            type="text"
                                            value={criterion.name}
                                            onChange={(e) => handleChangeCriterionName(index, e.target.value)}
                                            placeholder="Например: Вкус, Сервис, Цена и т.д."
                                            className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div className="w-full sm:w-32">
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                            Вес
                                        </label>
                                        <input
                                            type="number"
                                            value={criterion.weight}
                                            onChange={(e) => handleChangeCriterionWeight(index, e.target.value)}
                                            min="0.1"
                                            max="10"
                                            step="0.1"
                                            className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div className="flex sm:items-end w-full sm:w-auto sm:pb-1.5 justify-end">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCriterion(index)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                            title="Удалить критерий"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {criteria.length === 0 && (
                                <div className="text-center py-4 text-gray-500 text-sm">
                                    Нет критериев. Добавьте критерии для оценки ресторана.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded flex items-center disabled:opacity-50 text-sm"
                        >
                            {saving ? (
                                <>Сохранение...</>
                            ) : (
                                <>
                                    <Save size={16} className="mr-2" />
                                    Сохранить критерии
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CriteriaEditor; 