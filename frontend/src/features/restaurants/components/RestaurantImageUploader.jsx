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
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isUploading ? (
                        <div className="text-center">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="mx-auto mb-3"
                            >
                                <Loader size={32} className="text-blue-500" />
                            </motion.div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Загрузка изображения...</p>
                        </div>
                    ) : success ? (
                        <div className="text-center">
                            <Check size={32} className="mx-auto mb-3 text-green-500" />
                            <p className="text-sm text-green-600 dark:text-green-400">Изображение успешно загружено</p>
                        </div>
                    ) : (
                        <>
                            {currentImage ? (
                                <div className="relative w-full h-full">
                                    <img 
                                        src={currentImage.startsWith('http://') || currentImage.startsWith('https://') 
                                            ? currentImage 
                                            : currentImage.startsWith('/') 
                                                ? `${process.env.REACT_APP_API_URL || ''}${currentImage}`
                                                : currentImage.includes('.') && !currentImage.includes(' ') && !currentImage.match(/^[a-zA-Z]+:\/\//)
                                                    ? `https://${currentImage}`
                                                    : `${process.env.REACT_APP_API_URL || ''}${currentImage}`
                                        }
                                        alt="Текущее изображение ресторана" 
                                        className="w-full h-full object-cover rounded-lg opacity-50"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGMEYwRjAiLz48cGF0aCBkPSJNODAgMTEwSDEyME0xMDAgOTBWMTMwIiBzdHJva2U9IiNBMEEwQTAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+';
                                        }}
                                    />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <ImagePlus size={32} className="mx-auto mb-3 text-blue-500" />
                                        <p className="text-sm text-center text-gray-700 dark:text-gray-300">
                                            <span className="font-medium">Нажмите для загрузки</span> или перетащите новое изображение
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Upload size={32} className="mx-auto mb-3 text-gray-400" />
                                    <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
                                        <span className="font-medium">Нажмите для загрузки</span> или перетащите изображение
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF или WEBP (макс. 5MB)</p>
                                </>
                            )}
                        </>
                    )}
                </div>
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