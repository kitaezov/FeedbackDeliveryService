import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardTitle, CardContent } from '../../components/Card';
import ReviewCard from "../../components/ReviewCard";
import { MessageSquare, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../components/NotificationContext';
import api from '../../utils/api';

// Animation variants
const buttonVariants = {
    initial: { opacity: 0, y: 5 },
    animate: { opacity: 1, y: 0 },
    hover: { scale: 1.05, transition: { duration: 0.2, type: "spring", stiffness: 400 }},
    tap: { scale: 0.95, transition: { duration: 0.1 }}
};

// Empty Reviews Component
const EmptyReviews = ({ sortMode, themeClasses }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="p-6 bg-gray-50 dark:bg-gray-700 text-center rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[200px] flex flex-col justify-center"
    >
        <motion.div 
            className="inline-block mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ 
                type: "spring",
                stiffness: 400,
                damping: 20
            }}
        >
            <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-300 mx-auto" />
        </motion.div>
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Нет отзывов</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
            {sortMode === 'recent'
                ? 'Пока никто не оставил отзыв'
                : 'Нет популярных отзывов'}
        </p>
    </motion.div>
);

// Sort Buttons Component
const SortButtons = ({ sortMode, setSortMode, setCurrentPage, handleRefresh, isRotating, themeClasses }) => (
    <div className="flex items-center space-x-2">
        <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => {
                setSortMode('recent');
                setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                sortMode === 'recent' ? themeClasses.activeButton : themeClasses.button
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
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                sortMode === 'popular' ? themeClasses.activeButton : themeClasses.button
            }`}
        >
            Популярные
        </motion.button>

        {handleRefresh && (
            <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleRefresh}
                className={`p-1 rounded-full ${themeClasses.button}`}
            >
                <RefreshCw className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} />
            </motion.button>
        )}
    </div>
);

// Pagination Component
const Pagination = ({ currentPage, totalPages, setCurrentPage }) => (
    <div className="flex justify-center mt-3">
        <div className="flex items-center space-x-1 p-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-xs">
            <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-2 py-1 rounded text-xs transition-all ${
                    currentPage === 1 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
                Назад
            </motion.button>
            
            <div className="text-xs px-1">
                {currentPage}/{totalPages}
            </div>
            
            <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-2 py-1 rounded text-xs transition-all ${
                    currentPage === totalPages 
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
                Вперед
            </motion.button>
        </div>
    </div>
);

// Review List Component
const ReviewList = ({ paginatedReviews, user, handleLikeReview, handleDeleteReview, isDarkMode }) => (
    <div className="grid gap-3">
        <AnimatePresence initial={false}>
            {paginatedReviews.map((review) => (
                <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ReviewCard
                        review={review}
                        user={user}
                        isDarkMode={isDarkMode}
                        onLike={handleLikeReview}
                        onDelete={handleDeleteReview}
                        className="shadow-sm hover:shadow border border-gray-200 dark:border-gray-700 transition-all duration-200 rounded-lg"
                    />
                </motion.div>
            ))}
        </AnimatePresence>
    </div>
);

const ReviewsSection = ({ reviews: initialReviews = [], user, onRefresh, onNewReview, isDarkMode }) => {
    const [reviews, setReviews] = useState(initialReviews);
    const [isRotating, setIsRotating] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortMode, setSortMode] = useState('recent');
    const [deletingReviewId, setDeletingReviewId] = useState(null);
    const reviewsPerPage = 4; // Показываем меньше отзывов для компактности
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
            }
            return;
        }

        setDeletingReviewId(reviewId);
        try {
            await api.delete(`/reviews/${reviewId}`);
            setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
            
            if (notifications) {
                notifications.notifySuccess('Отзыв успешно удален');
            }
        } catch (error) {
            console.error('Ошибка при удалении отзыва:', error);
            
            if (notifications) {
                notifications.notifyError(
                    error.response?.data?.message || 'Не удалось удалить отзыв'
                );
            }
        } finally {
            setDeletingReviewId(null);
        }
    };

    const handleLikeReview = async (reviewId) => {
        if (!user || !user.token) {
            if (notifications) {
                notifications.notifyInfo('Войдите, чтобы оценить отзыв');
            }
            return;
        }

        try {
            await api.post('/reviews/like', { reviewId });
            setReviews(prevReviews => prevReviews.map(review => 
                review.id === reviewId 
                    ? { ...review, likes: (review.likes || 0) + 1 } 
                    : review
            ));
        } catch (error) {
            console.error('Ошибка при оценке отзыва:', error);
        }
    };

    // Styles configuration
    const themeClasses = {
        card: isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-800',
        button: isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
        activeButton: isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700',
        paginationButton: isDarkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        emptyState: isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-600'
    };

    // Add debugging logs
    console.log('ReviewsSection initialReviews:', initialReviews);
    console.log('ReviewsSection current reviews:', reviews);
    console.log('ReviewsSection processedReviews:', processedReviews);
    console.log('ReviewsSection paginatedReviews:', paginatedReviews);

    return (
        <div className="mb-8">
            <div className={`
                border rounded-lg shadow-md overflow-hidden
                ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-800'}
            `}>
                <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                            {sortMode === 'recent' ? 'Последние отзывы' : 'Популярные отзывы'}
                        </h3>
                        
                        <SortButtons 
                            sortMode={sortMode}
                            setSortMode={setSortMode}
                            setCurrentPage={setCurrentPage}
                            handleRefresh={handleRefresh}
                            isRotating={isRotating}
                            themeClasses={themeClasses}
                        />
                    </div>

                    <AnimatePresence>
                        {paginatedReviews.length === 0 ? (
                            <EmptyReviews 
                                sortMode={sortMode} 
                                themeClasses={themeClasses} 
                            />
                        ) : (
                            <>
                                <ReviewList 
                                    paginatedReviews={paginatedReviews}
                                    user={user}
                                    handleLikeReview={handleLikeReview}
                                    handleDeleteReview={handleDeleteReview}
                                    isDarkMode={isDarkMode}
                                />

                                {processedReviews.length > reviewsPerPage && (
                                    <Pagination 
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        setCurrentPage={setCurrentPage}
                                    />
                                )}
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ReviewsSection;