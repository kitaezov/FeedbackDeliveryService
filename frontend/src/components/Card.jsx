import React from "react";

const Card = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className}`}>
        {children}
    </div>
);

const CardHeader = ({ children }) => (
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        {children}
    </div>
);

const CardTitle = ({ children }) => (
    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
        {children}
    </h2>
);

const CardContent = ({ children }) => (
    <div className="p-6">
        {children}
    </div>
);

export { Card, CardHeader, CardTitle, CardContent };
