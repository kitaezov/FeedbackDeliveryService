import React, { useState } from 'react';
import { Button, TextArea } from '../../../common/components/ui';

/**
 * Компонент формы для добавления или редактирования отзыва
 * 
 * @param {Object} props
 * @param {Function} props.onSubmit - Функция отправки формы
 * @param {Function} props.onCancel - Функция отмены
 * @param {Object} props.initialValues - Начальные значения формы (для редактирования)
 * @param {boolean} props.isSubmitting - Флаг отправки формы
 * @returns {JSX.Element}
 */
export const ReviewForm = ({ 
    onSubmit, 
    onCancel, 
    initialValues = { rating: 0, text: '' },
    isSubmitting = false 
}) => {
    // Состояние формы
    const [formData, setFormData] = useState({
        rating: initialValues.rating || 0,
        text: initialValues.text || initialValues.comment || '',
    });
    const [errors, setErrors] = useState({});
    
    // Обработчик изменения рейтинга
    const handleRatingChange = (value) => {
        setFormData(prev => ({ ...prev, rating: value }));
        
        // Если была ошибка, убираем её
        if (errors.rating) {
            setErrors(prev => ({ ...prev, rating: undefined }));
        }
    };
    
    // Обработчик изменения текста отзыва
    const handleTextChange = (e) => {
        setFormData(prev => ({ ...prev, text: e.target.value }));
        
        // Если была ошибка, убираем её
        if (errors.text && e.target.value.trim()) {
            setErrors(prev => ({ ...prev, text: undefined }));
        }
    };
    
    // Валидация формы
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.rating || formData.rating < 1) {
            newErrors.rating = 'Пожалуйста, выберите рейтинг';
        }
        
        if (!formData.text.trim()) {
            newErrors.text = 'Пожалуйста, напишите текст отзыва';
        } else if (formData.text.trim().length < 10) {
            newErrors.text = 'Текст отзыва должен содержать не менее 10 символов';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    // Обработчик отправки формы
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            // Конвертируем данные формы в ожидаемый формат для API
            const reviewData = {
                ...formData,
                comment: formData.text  // Бекенд ожидает 'comment' вместо 'text'
            };
            
            console.log('Submitting review form data:', reviewData);
            onSubmit(reviewData);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Выбор рейтинга */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ваша оценка*
                </label>
                
                <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => handleRatingChange(value)}
                            className="text-2xl mr-1 focus:outline-none"
                            aria-label={`${value} звезд из 5`}
                        >
                            <span className={`text-2xl ${
                                value <= formData.rating 
                                    ? 'text-yellow-500' 
                                    : 'text-gray-300 dark:text-gray-600'
                            }`}>
                                ★
                            </span>
                        </button>
                    ))}
                    
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        {formData.rating > 0 
                            ? `${formData.rating} из 5` 
                            : 'Выберите оценку'}
                    </span>
                </div>
                
                {errors.rating && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.rating}
                    </p>
                )}
            </div>
            
            {/* Текст отзыва */}
            <div>
                <label htmlFor="review-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Текст отзыва*
                </label>
                
                <TextArea
                    id="review-text"
                    value={formData.text}
                    onChange={handleTextChange}
                    placeholder="Поделитесь вашими впечатлениями о ресторане..."
                    rows={5}
                    error={errors.text}
                />
                
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Минимум 10 символов
                </p>
            </div>
            
            {/* Кнопки формы */}
            <div className="flex justify-end space-x-2">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Отмена
                </Button>
                
                <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                >
                    {initialValues.rating > 0 ? 'Сохранить' : 'Отправить отзыв'}
                </Button>
            </div>
        </form>
    );
}; 