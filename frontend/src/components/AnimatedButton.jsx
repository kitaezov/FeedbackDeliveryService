import React from "react";

const AnimatedButton = ({children, className = '', ...props}) => (
    <button
        className={`px-6 py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 ${className}`}
        {...props}
    >
        {children}
    </button>
);
export { AnimatedButton };