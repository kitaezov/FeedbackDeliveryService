import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Breadcrumb, Button, Modal } from '../../../common/components/ui';
import { RestaurantDetails } from '../components/RestaurantDetails';
import { ReviewForm } from '../components/ReviewForm';
import { useToast } from '../../../common/hooks';
import { useAuthContext } from '../../../common/contexts/AuthContext';
import { restaurantService } from '../services/restaurantService';
import { useScrollToTop } from '../../../common/hooks';

/**
 * Страница с подробной информацией о ресторане
 */
export const RestaurantDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuthContext();
    const { showToast } = useToast();
    
    // Хук для прокрутки страницы вверх при загрузке
    useScrollToTop();
    
    // Состояния
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    
    // Загрузка данных ресторана
    useEffect(() => {
        const fetchRestaurantData = async () => {
            try {
                setLoading(true);
                const data = await restaurantService.getRestaurantById(id);
                setRestaurant(data);
                setError(null);
            } catch (error) {
                console.error('Error fetching restaurant details:', error);
                setError('Не удалось загрузить информацию о ресторане');
                showToast({
                    title: 'Ошибка загрузки',
                    description: error.message || 'Не удалось загрузить информацию о ресторане',
                    type: 'error'
                });
            } finally {
                setLoading(false);
            }
        };
        
        fetchRestaurantData();
    }, [id, showToast]);
    
    // Обработчик открытия модального окна с формой отзыва
    const handleAddReviewClick = () => {
        if (!isAuthenticated) {
            showToast({
                title: 'Требуется авторизация',
                description: 'Чтобы оставить отзыв, необходимо войти в систему',
                type: 'warning'
            });
            navigate('/login', { state: { from: `/restaurants/${id}` } });
            return;
        }
        
        setIsReviewModalOpen(true);
    };
    
    // Обработчик закрытия модального окна
    const handleCloseModal = () => {
        setIsReviewModalOpen(false);
    };
    
    // Обработчик отправки формы отзыва
    const handleSubmitReview = async (reviewData) => {
        try {
            console.log('Submitting review:', { restaurantId: id, reviewData });
            
            // Transform the form data to match the API's expected format
            const apiReviewData = {
                restaurantName: restaurant.name,
                rating: reviewData.rating,
                comment: reviewData.text, // Frontend uses 'text', backend expects 'comment'
                ratings: {
                    food: reviewData.foodRating || reviewData.rating,
                    service: reviewData.serviceRating || reviewData.rating,
                    atmosphere: reviewData.atmosphereRating || reviewData.rating,
                    price: reviewData.priceRating || reviewData.rating,
                    cleanliness: reviewData.cleanlinessRating || reviewData.rating
                }
            };
            
            // Send to the reviews API endpoint, not the restaurant-specific endpoint
            await restaurantService.addReview(apiReviewData);
            
            // Temporarily close the modal to improve UX
            setIsReviewModalOpen(false);
            
            // Show loading toast
            showToast({
                title: 'Отправка отзыва',
                description: 'Ваш отзыв обрабатывается...',
                type: 'info'
            });
            
            // Wait a bit to allow the backend to process the review
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Обновляем данные ресторана
            const updatedData = await restaurantService.getRestaurantById(id);
            setRestaurant(updatedData);
            
            // Показываем уведомление
            showToast({
                title: 'Отзыв добавлен',
                description: 'Ваш отзыв успешно опубликован',
                type: 'success'
            });
        } catch (error) {
            console.error('Error submitting review:', error);
            showToast({
                title: 'Ошибка',
                description: error.message || 'Не удалось добавить отзыв',
                type: 'error'
            });
        }
    };
    
    if (loading) {
        return (
            <Container>
                <div className="py-10 text-center">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 max-w-md mx-auto rounded"></div>
                        <div className="h-64 bg-gray-200 dark:bg-gray-700 max-w-full mx-auto mt-6 rounded"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 max-w-lg mx-auto mt-6 rounded"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 max-w-md mx-auto mt-3 rounded"></div>
                    </div>
                    <p className="mt-6 text-gray-500 dark:text-gray-400">Загрузка информации о ресторане...</p>
                </div>
            </Container>
        );
    }
    
    if (error) {
        return (
            <Container>
                <div className="py-10 text-center">
                    <div className="text-red-500 dark:text-red-400 text-xl font-semibold">
                        <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>{error}</p>
                    </div>
                    <Button 
                        variant="secondary" 
                        className="mt-6"
                        onClick={() => navigate('/restaurants')}
                    >
                        Вернуться к списку ресторанов
                    </Button>
                </div>
            </Container>
        );
    }
    
    return (
        <div className="py-8">
            <Container>
                {/* Хлебные крошки */}
                <Breadcrumb 
                    items={[
                        { label: 'Главная', href: '/' },
                        { label: 'Рестораны', href: '/restaurants' },
                        { label: restaurant?.name || 'Загрузка...', href: '#' }
                    ]}
                    className="mb-6"
                />
                
                {/* Детальная информация о ресторане */}
                <RestaurantDetails 
                    restaurant={restaurant} 
                    onAddReview={handleAddReviewClick} 
                />
                
                {/* Модальное окно с формой отзыва */}
                <Modal
                    isOpen={isReviewModalOpen}
                    onClose={handleCloseModal}
                    title={`Отзыв о ресторане "${restaurant?.name}"`}
                >
                    <ReviewForm 
                        onSubmit={handleSubmitReview}
                        onCancel={handleCloseModal}
                    />
                </Modal>
            </Container>
        </div>
    );
}; 