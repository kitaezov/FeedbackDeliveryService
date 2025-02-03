import {Star, ThumbsUp} from "lucide-react";
import {AnimatedButton} from "./AnimatedButton";
import React from "react";


const ReviewCard = ({review}) => (
    <div className="p-4 border-b dark:border-gray-700 transform transition-all duration-200 dark:hover:bg-gray-750">
        <div className="flex items-start space-x-4">
            <img src={review.avatar} alt={review.userName} className="w-10 h-10 rounded-full shadow-md"/>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <h3 className="font-playfair font-semibold">{review.userName}</h3>
                    <span className="text-sm text-gray-500 font-source">{review.date}</span>
                </div>
                <div className="flex items-center space-x-1 my-1">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                    ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-source leading-relaxed">{review.comment}</p>
                <div className="flex items-center space-x-4 mt-2">
                    <AnimatedButton
                        className="flex items-center space-x-1 text-gray-500 hover:text-white transition-colors">
                        <ThumbsUp className="h-4 w-4"/>
                        <span>{review.likes}</span>
                    </AnimatedButton>
                    <span className="text-gray-500 font-playfair italic">{review.restaurantName}</span>
                </div>
            </div>
        </div>
    </div>
);

export {ReviewCard};