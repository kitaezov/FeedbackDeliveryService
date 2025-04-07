import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import ReviewCard from "../../components/ReviewCard";
import { MessageSquare, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../components/NotificationContext';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

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
            toast.error('Вы должны войти, чтобы оценить отзыв.');
            return;
        }

        try {
            const response = await api.post('/reviews/like', {
                reviewId
            });

            if (response.status === 200) {
                const updatedReviews = reviews.map((review) => {
                    if (review.id === reviewId) {
                        return { ...review, likes: (review.likes || 0) + 1 };
                    }
                    return review;
                });
                
                setReviews(updatedReviews);
                toast.success('Отзыв оценен!');
            }
        } catch (error) {
            console.error('Error liking review:', error);
            
            if (error.response) {
                if (error.response.status === 400) {
                    if (error.response.data.message === 'You cannot like your own review') {
                        toast.error('Вы не можете оценить свой собственный отзыв.');
                    } else if (error.response.data.message === 'You have already liked this review') {
                        toast.error('Вы уже оценили этот отзыв.');
                    } else {
                        toast.error(error.response.data.message || 'Ошибка при оценке отзыва.');
                    }
                } else if (error.response.status === 404) {
                    toast.error('Отзыв не найден.');
                } else if (error.response.status === 401) {
                    toast.error('Необходимо авторизоваться для оценки отзывов.');
                } else {
                    toast.error('Произошла ошибка при оценке отзыва.');
                }
            } else {
                toast.error('Не удалось подключиться к серверу. Попробуйте позже.');
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
        <Card className="w-full overflow-hidden review-section">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-semibold">
                        {sortMode === 'recent' ? 'Последние отзывы' : 'Популярные отзывы'}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setSortMode('recent');
                                setCurrentPage(1);
                            }}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                sortMode === 'recent'
                                    ? themeClasses.activeButton
                                    : themeClasses.button
                            }`}
                        >
                            Новые
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setSortMode('popular');
                                setCurrentPage(1);
                            }}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                sortMode === 'popular'
                                    ? themeClasses.activeButton
                                    : themeClasses.button
                            }`}
                        >
                            Популярные
                        </motion.button>

                        {onRefresh && (
                            <motion.button
                                whileHover={{ rotate: 20 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleRefresh}
                                className={`p-2 rounded-full ${themeClasses.button}`}
                            >
                                <RefreshCw className={`w-5 h-5 ${isRotating ? 'animate-spin' : ''}`} />
                            </motion.button>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 md:p-6">
                <AnimatePresence>
                    {paginatedReviews.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className={`flex flex-col items-center justify-center py-12 px-4 ${themeClasses.emptyState} rounded-lg`}
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
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {processedReviews.length > reviewsPerPage && (
                                <div className="flex justify-center space-x-2 mt-6">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className={`px-3 py-1 rounded-md ${themeClasses.paginationButton} ${
                                            currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        &larr;
                                    </motion.button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                                        <motion.button
                                            key={pageNumber}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setCurrentPage(pageNumber)}
                                            className={`px-3 py-1 rounded-md ${
                                                currentPage === pageNumber
                                                    ? themeClasses.activeButton
                                                    : themeClasses.paginationButton
                                            }`}
                                        >
                                            {pageNumber}
                                        </motion.button>
                                    ))}

                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className={`px-3 py-1 rounded-md ${themeClasses.paginationButton} ${
                                            currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        &rarr;
                                    </motion.button>
                                </div>
                            )}
                        </div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
};

export default ReviewsSection;