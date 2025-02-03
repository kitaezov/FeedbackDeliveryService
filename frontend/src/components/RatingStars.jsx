import React, {useState} from "react";
import {ChevronDown, ChevronUp, Star} from "lucide-react";

const CompactRatingCategory = ({category, rating, onRate, hoveredRating, onHover}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="border rounded-lg p-2 bg-white dark:bg-gray-700 shadow-sm">
            <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center space-x-2">
                    <span className="text-xl">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                    {rating && <span className="text-sm text-orange-500">{rating}/5</span>}
                    {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </div>
            </div>

            {isExpanded && (
                <div className="flex space-x-1 mt-2 justify-center">
                    {[...Array(5)].map((_, i) => (
                        <button
                            type="button"
                            key={i}
                            onMouseEnter={() => onHover(i + 1)}
                            onMouseLeave={() => onHover(0)}
                            onClick={() => onRate(i + 1)}
                            className={`h-6 w-6 transform transition-all duration-200 hover:scale-110 ${
                                i < (hoveredRating || rating || 0)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                            }`}
                        >
                            <Star/>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};


export { CompactRatingCategory };
