import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import ReviewCard from "../../components/ReviewCard";
import { MessageSquare, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../components/NotificationContext';
import api from '../../utils/api';

// Animation variants for buttons and elements
const buttonVariants = {
    initial: { opacity: 0, y: 5 },
    animate: { opacity: 1, y: 0 },
    hover: {
        scale: 1.05,
        transition: { 
            duration: 0.2,
            type: "spring", 
            stiffness: 400 
        }
    },
    tap: {
        scale: 0.95,
        transition: { 
            duration: 0.1 
        }
    }
};

const ReviewsSection = ({ reviews: initialReviews = [], user, onRefresh, onNewReview, isDarkMode }) => {
    const [reviews, setReviews] = useState(initialReviews);
    const [isRotating, setIsRotating] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortMode, setSortMode] = useState('recent');
    const [deletingReviewId, setDeletingReviewId] = useState(null);
    const reviewsPerPage = 10;
    const notifications = useNotification();

    React.useEffect(() => {
        setReviews(initialReviews);
    }, [initialReviews]);

    const addNewReview = useCallback((newReview) => {
        setReviews(prevReviews => [newReview, ...prevReviews]);
        setSortMode('recent');
        setCurrentPage(1);
    }, []);

    React.useEffect(() => {
        if (onNewReview) {
            onNewReview(addNewReview);
        }
    }, [addNewReview, onNewReview]);

    const processedReviews = useMemo(() => {
        let sorted = [...reviews];
        if (sortMode === 'recent') {
            sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (sortMode === 'popular') {
            sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        }
        return sorted;
    }, [reviews, sortMode]);

    const paginatedReviews = useMemo(() => {
        const startIndex = (currentPage - 1) * reviewsPerPage;
        return processedReviews.slice(startIndex, startIndex + reviewsPerPage);
    }, [processedReviews, currentPage]);

    const totalPages = Math.ceil(processedReviews.length / reviewsPerPage);

    const handleRefresh = () => {
        if (onRefresh) {
            setIsRotating(true);
            onRefresh();
            setTimeout(() => setIsRotating(false), 1000);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!user || !user.token) {
            if (notifications) {
                notifications.notifyError('Для удаления отзыва необходимо авторизоваться');
            } else {
                alert('Для удаления отзыва необходимо авторизоваться');
            }
            return;
        }

        setDeletingReviewId(reviewId);
        try {
            await api.delete(`/reviews/${reviewId}`);

            // Удаляем отзыв из локального состояния
            setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
            
            if (notifications) {
                notifications.notifySuccess('Отзыв успешно удален');
            } else {
                alert('Отзыв успешно удален');
            }
        } catch (error) {
            console.error('Ошибка при удалении отзыва:', error);
            
            if (notifications) {
                notifications.notifyError(
                    error.response?.data?.message || 'Не удалось удалить отзыв'
                );
            } else {
                alert(error.response?.data?.message || 'Не удалось удалить отзыв');
            }
        } finally {
            setDeletingReviewId(null);
        }
    };

    const handleLikeReview = async (reviewId) => {
        if (!user || !user.token) {
            if (notifications) {
                notifications.notifyInfo('Войдите, чтобы оценить отзыв');
            } else {
                alert('Войдите, чтобы оценить отзыв');
            }
            return;
        }

        try {
            await api.post('/reviews/like', {
                reviewId
            });
            
            // Обновляем лайки локально
            setReviews(prevReviews => prevReviews.map(review => 
                review.id === reviewId 
                    ? { ...review, likes: (review.likes || 0) + 1 } 
                    : review
            ));
        } catch (error) {
            console.error('Ошибка при оценке отзыва:', error);
            if (notifications) {
                
            } else {
               
            }
        }
    };

    // Styles configuration
    const themeClasses = {
        card: isDarkMode
            ? 'bg-gray-900 border-gray-700 text-gray-100'
            : 'bg-white border-gray-200 text-gray-800',
        button: isDarkMode
            ? 'hover:bg-gray-700'
            : 'hover:bg-gray-100',
        activeButton: isDarkMode
            ? 'bg-gray-700 text-white'
            : 'bg-gray-200 text-gray-700',
        paginationButton: isDarkMode
            ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        emptyState: isDarkMode
            ? 'bg-gray-800 text-gray-300'
            : 'bg-gray-50 text-gray-600'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="w-full overflow-hidden review-section border border-gray-200 dark:border-gray-700 shadow-xl dark:shadow-gray-900/30 rounded-2xl">
                <CardContent className="p-0">
                    <div className="relative p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <CardTitle className="text-xl font-semibold">
                            {sortMode === 'recent' ? 'Последние отзывы' : 'Популярные отзывы'}
                        </CardTitle>
                        
                        <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center space-x-2">
                            <motion.button
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                onClick={() => {
                                    setSortMode('recent');
                                    setCurrentPage(1);
                                }}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm hover:shadow-md ${
                                    sortMode === 'recent'
                                        ? themeClasses.activeButton
                                        : themeClasses.button
                                }`}
                            >
                                Новые
                            </motion.button>

                            <motion.button
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                onClick={() => {
                                    setSortMode('popular');
                                    setCurrentPage(1);
                                }}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm hover:shadow-md ${
                                    sortMode === 'popular'
                                        ? themeClasses.activeButton
                                        : themeClasses.button
                                }`}
                            >
                                Популярные
                            </motion.button>

                            {onRefresh && (
                                <motion.button
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    onClick={handleRefresh}
                                    className={`p-2 rounded-full shadow-sm hover:shadow-md ${themeClasses.button}`}
                                >
                                    <RefreshCw className={`w-5 h-5 ${isRotating ? 'animate-spin' : ''}`} />
                                </motion.button>
                            )}
                        </div>
                    </div>

                    <div className="p-4 md:p-6">
                        <AnimatePresence>
                            {paginatedReviews.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className={`flex flex-col items-center justify-center py-12 px-4 ${themeClasses.emptyState} rounded-lg border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-300`}
                                >
                                    <MessageSquare className="w-12 h-12 mb-4 opacity-30" />
                                    <h3 className="text-lg font-medium mb-2">Нет отзывов</h3>
                                    <p className="text-sm text-center max-w-md">
                                        {sortMode === 'recent'
                                            ? 'Станьте первым, кто оставит отзыв о ресторане!'
                                            : 'Пока никто не оценил отзывы. Будьте первым!'}
                                    </p>
                                </motion.div>
                            ) : (
                                <div className="grid gap-6 md:gap-8">
                                    <AnimatePresence initial={false}>
                                        {paginatedReviews.map((review) => (
                                            <motion.div
                                                key={review.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <ReviewCard
                                                    review={review}
                                                    user={user}
                                                    isDarkMode={isDarkMode}
                                                    onLike={handleLikeReview}
                                                    onDelete={handleDeleteReview}
                                                    className="shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 rounded-2xl"
                                                />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {processedReviews.length > reviewsPerPage && (
                                        <div className="flex justify-center mt-8">
                                            <div className="flex items-center space-x-2 shadow-md p-1.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                                <motion.button
                                                    variants={buttonVariants}
                                                    whileHover="hover"
                                                    whileTap="tap"
                                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={currentPage === 1}
                                                    className={`px-3 py-2 rounded-md border text-sm transition-all duration-200 ${
                                                        currentPage === 1 
                                                            ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500' 
                                                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 shadow-sm hover:shadow-md'
                                                    }`}
                                                >
                                                    Назад
                                                </motion.button>
                                                
                                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {currentPage} из {totalPages}
                                                </div>
                                                
                                                <motion.button
                                                    variants={buttonVariants}
                                                    whileHover="hover"
                                                    whileTap="tap"
                                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                    disabled={currentPage === totalPages}
                                                    className={`px-3 py-2 rounded-md border text-sm transition-all duration-200 ${
                                                        currentPage === totalPages 
                                                            ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500' 
                                                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 shadow-sm hover:shadow-md'
                                                    }`}
                                                >
                                                    Вперед
                                                </motion.button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ReviewsSection;