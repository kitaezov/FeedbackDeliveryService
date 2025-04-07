import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

const AnimatedRefreshButton = ({ onRefresh }) => {
    const [isRotating, setIsRotating] = useState(false);

    const handleRefresh = () => {
        if (onRefresh) {
            setIsRotating(true);
            onRefresh();

            // Stop rotation after the refresh action is complete
            setTimeout(() => {
                setIsRotating(false);
            }, 1000); // Adjust timing as needed
        }
    };
};

export default AnimatedRefreshButton;