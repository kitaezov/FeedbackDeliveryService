import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardTitle, CardContent } from "../../components/Card";
import { ChevronDown, ThumbsUp, Clock, ChevronRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const RestaurantCharts = ({ reviews = [], isDarkMode = false }) => {
    const [expanded, setExpanded] = useState(false);
    const [sortMode, setSortMode] = useState('rating');

    const restaurantData = useMemo(() => {
        // Aggregate restaurant data from reviews
        const aggregatedData = {};

        reviews.forEach(review => {
            if (!review || !review.restaurantName) return;

            const {
                restaurantName,
                rating = 0,
                ratings = {},
                likes = 0,
                date,
            } = review;

            if (!aggregatedData[restaurantName]) {
                aggregatedData[restaurantName] = {
                    name: restaurantName,
                    totalReviews: 0,
                    totalRating: 0,
                    totalFoodRating: 0,
                    totalServiceRating: 0,
                    totalAtmosphereRating: 0,
                    totalPriceRating: 0,
                    totalCleanlinessRating: 0,
                    totalLikes: 0,
                    latestDate: null
                };
            }

            const restaurant = aggregatedData[restaurantName];

            // Safe conversion to number
            const safeNumber = (value) => isNaN(Number(value)) ? 0 : Number(value);

            // Increment counters
            restaurant.totalReviews += 1;
            restaurant.totalRating += safeNumber(rating);
            restaurant.totalFoodRating += safeNumber(ratings.food);
            restaurant.totalServiceRating += safeNumber(ratings.service);
            restaurant.totalAtmosphereRating += safeNumber(ratings.atmosphere);
            restaurant.totalPriceRating += safeNumber(ratings.price);
            restaurant.totalCleanlinessRating += safeNumber(ratings.cleanliness);
            restaurant.totalLikes += safeNumber(likes);

            // Track latest review date
            const reviewDate = date ? new Date(date) : null;
            if (reviewDate && (!restaurant.latestDate || reviewDate > restaurant.latestDate)) {
                restaurant.latestDate = reviewDate;
            }
        });

        // Process and calculate averages
        const processedData = Object.values(aggregatedData)
            .filter(restaurant => restaurant.totalReviews > 0)
            .map(restaurant => {
                const {
                    totalReviews,
                    totalRating,
                    totalFoodRating,
                    totalServiceRating,
                    totalAtmosphereRating,
                    totalPriceRating,
                    totalCleanlinessRating,
                    totalLikes,
                    latestDate
                } = restaurant;

                return {
                    name: restaurant.name,
                    avgRating: Number((totalRating / totalReviews).toFixed(1)),
                    avgFoodRating: Number((totalFoodRating / totalReviews).toFixed(1)),
                    avgServiceRating: Number((totalServiceRating / totalReviews).toFixed(1)),
                    avgAtmosphereRating: Number((totalAtmosphereRating / totalReviews).toFixed(1)),
                    avgPriceRating: Number((totalPriceRating / totalReviews).toFixed(1)),
                    avgCleanlinessRating: Number((totalCleanlinessRating / totalReviews).toFixed(1)),
                    totalReviews,
                    totalLikes,
                    latestDate
                };
            });

        // Sort based on selected criteria
        switch (sortMode) {
            case 'newest':
                return processedData
                    .sort((a, b) => {
                        if (!a.latestDate) return 1;
                        if (!b.latestDate) return -1;
                        return b.latestDate - a.latestDate;
                    });
            case 'rating':
                return processedData.sort((a, b) => b.avgRating - a.avgRating);
            case 'likes':
                return processedData.sort((a, b) => b.totalLikes - a.totalLikes);
            default:
                return processedData;
        }
    }, [reviews, sortMode]);

    // Limit displayed restaurants
    const displayedData = expanded ? restaurantData : restaurantData.slice(0, 5);

    // Early return if no data
    if (restaurantData.length === 0) {
        return null;
    }

    // Theme classes for styling
    const themeClasses = {
        container: isDarkMode
            ? 'bg-gray-900 text-gray-100'
            : 'bg-white text-gray-800',
        card: isDarkMode
            ? 'border-gray-700 hover:bg-gray-800'
            : 'border-gray-100 hover:bg-gray-50',
        text: isDarkMode ? 'text-gray-300' : 'text-gray-600',
        button: isDarkMode
            ? 'bg-gray-800 hover:bg-gray-700 focus:ring-gray-600 text-gray-200'
            : 'bg-gray-50 hover:bg-gray-100 focus:ring-gray-400 text-gray-700'
    };

    return (
        <Card className={`shadow-sm ${themeClasses.container}`}>
            <CardHeader className="border-b dark:border-gray-700">
            </CardHeader>
            <CardContent className="p-4 md:p-6 lg:p-8">
                <div className="grid gap-4 md:gap-6">
                    {displayedData.map((restaurant, index) => (
                        <RestaurantRow
                            key={restaurant.name}
                            restaurant={restaurant}
                            index={index}
                            themeClasses={themeClasses}
                            isDarkMode={isDarkMode}
                        />
                    ))}
                </div>

                {restaurantData.length > 5 && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className={`
                                px-6 py-2.5 rounded-full text-sm font-medium
                                transition-colors duration-200 inline-flex items-center
                                ${themeClasses.button}
                            `}
                        >
                            {expanded ? "Показать меньше" : "Показать больше"}
                            <ChevronDown
                                className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                                    expanded ? "transform rotate-180" : ""
                                }`}
                            />
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const SortButton = ({ sortMode, setSortMode, themeClasses, isDarkMode }) => {
    const [isOpen, setIsOpen] = useState(false);

    const sortOptions = [
        {
            value: 'rating',
            label: 'По рейтингу',
            icon: <Star className="w-4 h-4 text-yellow-500" />
        },
        {
            value: 'newest',
            label: 'Новые',
            icon: <Clock className="w-4 h-4 text-blue-500" />
        },
        {
            value: 'likes',
            label: 'Популярные',
            icon: <ThumbsUp className="w-4 h-4 text-red-500" />
        }
    ];

    const currentOption = sortOptions.find(option => option.value === sortMode);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    px-3 py-2 rounded-md text-sm font-medium
                    flex items-center justify-between min-w-[140px]
                    transition-colors focus:outline-none focus:ring-2
                    ${themeClasses.button}
                `}
            >
                <span className="flex items-center">
                    {currentOption?.icon}
                    <span className="ml-2">{currentOption?.label}</span>
                </span>
                <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                        isOpen ? "transform rotate-180" : ""
                    }`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`
                            absolute right-0 mt-2 min-w-[160px] z-10
                            rounded-md shadow-lg overflow-hidden
                            ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
                        `}
                    >
                        <div className="py-1">
                            {sortOptions.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        setSortMode(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`
                                        w-full text-left px-4 py-2.5 text-sm flex items-center
                                        ${sortMode === option.value
                                            ? isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                                            : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    {option.icon}
                                    <span className="ml-2">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Component to display a single restaurant row
const RestaurantRow = ({ restaurant, index, themeClasses, isDarkMode }) => {
    const { 
        name, 
        avgRating, 
        avgFoodRating,
        avgServiceRating, 
        avgAtmosphereRating,
        totalReviews 
    } = restaurant;

    // Format restaurant name for URL
    const restaurantSlug = name.toLowerCase().replace(/\s+/g, '-');

    // Rating color based on value
    const getRatingColor = (rating) => {
        if (rating >= 4.5) return isDarkMode ? 'text-emerald-400' : 'text-emerald-600';
        if (rating >= 4.0) return isDarkMode ? 'text-green-400' : 'text-green-600';
        if (rating >= 3.5) return isDarkMode ? 'text-yellow-400' : 'text-yellow-500';
        return isDarkMode ? 'text-red-400' : 'text-red-600';
    };

    // Star rendering helper
    const renderStars = (rating) => {
        return (
            <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                    <span
                        key={star}
                        className={`text-lg ${
                            star <= Math.round(rating)
                                ? getRatingColor(rating)
                                : isDarkMode ? 'text-gray-700' : 'text-gray-300'
                        }`}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };
};

RestaurantCharts.propTypes = {
    reviews: PropTypes.arrayOf(PropTypes.shape({
        restaurantName: PropTypes.string.isRequired,
        ratings: PropTypes.object,
        likes: PropTypes.number,
        timestamp: PropTypes.number
    })),
    isDarkMode: PropTypes.bool
};

export default RestaurantCharts;