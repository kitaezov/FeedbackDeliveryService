import React, { useState } from 'react';
import { Upload, ImagePlus, Check, AlertCircle, Loader } from 'lucide-react';
import { restaurantService } from '../services/restaurantService';
import { motion } from 'framer-motion';

/**
 * Компонент для загрузки изображений ресторана
 * 
 * @param {Object} props
 * @param {number|string} props.restaurantId - ID ресторана
 * @param {Function} props.onImageUploaded - Callback функция, вызываемая после успешной загрузки
 * @param {string} props.currentImage - Текущий URL изображения (опционально)
 */
const RestaurantImageUploader = ({ restaurantId, onImageUploaded, currentImage }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    // Обработка загрузки файла
    const handleFileUpload = async (file) => {
        if (!file) return;
        
        // Сброс состояний
        setError(null);
        setSuccess(false);
        setIsUploading(true);
        
        try {
            // Проверка типа файла
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                throw new Error('Неподдерживаемый формат файла. Разрешены только JPEG, PNG, GIF и WEBP');
            }
            
            // Проверка размера файла (5MB максимум)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('Файл слишком большой. Максимальный размер 5MB');
            }
            
            // Загрузка изображения
            const response = await restaurantService.uploadRestaurantImage(restaurantId, file);
            
            // Обработка успеха
            setSuccess(true);
            
            // Вызов callback с новым URL изображения
            if (onImageUploaded && response.imageUrl) {
                onImageUploaded(response.imageUrl);
            }
            
            // Сброс сообщения об успехе через 3 секунды
            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        } catch (error) {
            console.error('Ошибка при загрузке изображения:', error);
            setError(error.message || 'Произошла ошибка при загрузке изображения');
        } finally {
            setIsUploading(false);
        }
    };
    
    // Обработка изменения файла ввода
    const handleInputChange = (e) => {
        const file = e.target.files[0];
        handleFileUpload(file);
    };
    
    // Обработка событий перетаскивания и сброса
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