import React from "react";

export const Button = ({ children, className = "", ...props }) => {
    return (
        <button
            className={`bg-gray-700 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition-colors ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
