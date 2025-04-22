import React, { useState } from 'react';
import { Upload, ImagePlus, Check, AlertCircle, Loader } from 'lucide-react';
import { restaurantService } from '../services/restaurantService';
import { motion } from 'framer-motion';

/**
 * Component for uploading restaurant images
 * 
 * @param {Object} props
 * @param {number|string} props.restaurantId - ID of the restaurant
 * @param {Function} props.onImageUploaded - Callback function called after successful upload
 * @param {string} props.currentImage - Current image URL (optional)
 */
const RestaurantImageUploader = ({ restaurantId, onImageUploaded, currentImage }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    // Process the file upload
    const handleFileUpload = async (file) => {
        if (!file) return;
        
        // Reset states
        setError(null);
        setSuccess(false);
        setIsUploading(true);
        
        try {
            // Check file type
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                throw new Error('Неподдерживаемый формат файла. Разрешены только JPEG, PNG, GIF и WEBP');
            }
            
            // Check file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('Файл слишком большой. Максимальный размер 5MB');
            }
            
            // Upload the image
            const response = await restaurantService.uploadRestaurantImage(restaurantId, file);
            
            // Handle success
            setSuccess(true);
            
            // Call the callback with the new image URL
            if (onImageUploaded && response.imageUrl) {
                onImageUploaded(response.imageUrl);
            }
            
            // Reset success message after 3 seconds
            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        } catch (error) {
            console.error('Error uploading image:', error);
            setError(error.message || 'Произошла ошибка при загрузке изображения');
        } finally {
            setIsUploading(false);
        }
    };
    
    // Handle file input change
    const handleInputChange = (e) => {
        const file = e.target.files[0];
        handleFileUpload(file);
    };
    
    // Handle drag and drop events
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    
    const handleDragLeave = () => {
        setIsDragging(false);
    };
    
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        
        const file = e.dataTransfer.files[0];
        handleFileUpload(file);
    };
    
    return (
        <div className="w-full">
            <label 
                className={`
                    flex flex-col items-center justify-center w-full h-64 border-2 border-dashed 
                    rounded-lg cursor-pointer transition-colors
                    ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-300 dark:border-gray-700'}
                    ${isUploading ? 'pointer-events-none' : 'hover:bg-gray-50 dark:hover:bg-gray-800/20'}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                
                <input 
                    type="file" 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/gif, image/webp"
                    onChange={handleInputChange}
                    disabled={isUploading}
                />
            </label>
            
            {error && (
                <div className="mt-2 flex items-start text-red-600 dark:text-red-400">
                    <AlertCircle size={16} className="mr-1 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                </div>
            )}
        </div>
    );
};

export default RestaurantImageUploader; 