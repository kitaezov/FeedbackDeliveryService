import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserReviews } from '../hooks';
import { useAuth } from '../../../common/hooks/useAuth';
import { 
    Container, 
    Breadcrumbs,
    Heading,
    Card,
    Button,
    LoadingSpinner,
    Alert,
    Select,
    Pagination
} from '../../../common/components/ui';
import { StarRating } from '../components';
import { 
    Star, 
    Calendar, 
    Trash2, 
    AlertCircle,
    ExternalLink,
    SortDesc,
    Filter
} from 'lucide-react';

// Анимация для компонентов
const itemVariants = {
    hidden: { 
        opacity: 0, 
        y: 20 
    },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
            type: "spring", 
            stiffness: 400,
            damping: 25
        }
    },
    exit: { 
        opacity: 0, 
        y: -20,
        transition: { 
            duration: 0.2 
        }
    }
};

// Анимация для карточек
const cardVariants = {
    hidden: { 
        opacity: 0, 
        y: 20 
    },
    visible: (i) => ({ 
        opacity: 1, 
        y: 0,
        transition: { 
            delay: i * 0.1,
            type: "spring", 
            stiffness: 400,
            damping: 25
        }
    }),
    hover: {
        y: -5,
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        transition: { 
            duration: 0.2 
        }
    }
};

// Анимация для кнопок
const buttonVariants = {
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

/**
 * Страница с отзывами пользователя
 */
export const UserReviewsPage = () => {
    const { user } = useAuth();
    const [sortOption, setSortOption] = useState('createdAt:desc');
    
    const {
        reviews,
        isLoading,
        error,
        metadata,
        deletingReviewId,
        goToPage,
        deleteReview,
        sortReviews
    } = useUserReviews({ sortBy: sortOption });
    
    // Обработчик удаления отзыва
    const handleDeleteReview = (review) => {
        if (window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
            deleteReview(review);
        }
    };
    
    // Обработчик изменения сортировки
    const handleSortChange = (e) => {
        const value = e.target.value;
        setSortOption(value);
        sortReviews(value);
    };
    
    // Если пользователь не авторизован
    if (!user) {
        return (
            <Container>
                <motion.div 
                    className="py-20 text-center shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg p-8 mx-auto max-w-lg"
                    initial="hidden"
                    animate="visible"
                    variants={itemVariants}
                >
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Необходима авторизация
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Для просмотра ваших отзывов необходимо войти в аккаунт.
                    </p>
                    <Link to="/login">
                        <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm hover:shadow-md"
                        >
                            Войти
                        </motion.button>
                    </Link>
                </motion.div>
            </Container>
        );
    }
    
    return (
        <Container size="xl" className="py-6 review-section">
            {/* Хлебные крошки */}
            <motion.div 
                initial="hidden"
                animate="visible"
                variants={itemVariants}
                className="mb-6"
            >
                <Breadcrumbs>
                    <Breadcrumbs.Item href="/">Главная</Breadcrumbs.Item>
                    <Breadcrumbs.Item href="/profile">Профиль</Breadcrumbs.Item>
                    <Breadcrumbs.Item isCurrentPage>Мои отзывы</Breadcrumbs.Item>
                </Breadcrumbs>
            </motion.div>
            
            {/* Заголовок страницы */}
            <motion.div 
                className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6"
                initial="hidden"
                animate="visible"
                variants={itemVariants}
            >
                <Heading level={1} className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
                    Мои отзывы о ресторанах
                </Heading>
                
                {/* Выпадающий список для сортировки */}
                <div className="w-full md:w-auto flex items-center gap-2">
                    <SortDesc size={20} className="text-gray-500 dark:text-gray-400" />
                    <Select
                        value={sortOption}
                        onChange={handleSortChange}
                        className="w-full md:w-64 pl-2 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                    >
                        <option value="createdAt:desc">Сначала новые</option>
                        <option value="createdAt:asc">Сначала старые</option>
                        <option value="rating:desc">По убыванию рейтинга</option>
                        <option value="rating:asc">По возрастанию рейтинга</option>
                    </Select>
                </div>
            </motion.div>
            
            {/* Опции сортировки */}
            <motion.div 
                className="mb-6"
                initial="hidden"
                animate="visible"
                variants={itemVariants}
            >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {metadata.totalCount > 0 ? (
                            <span>Всего отзывов: {metadata.totalCount}</span>
                        ) : !isLoading && (
                            <span>У вас пока нет отзывов</span>
                        )}
                    </div>
                </div>
            </motion.div>
            
            {/* Индикатор загрузки */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div 
                        className="flex justify-center py-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <LoadingSpinner size="large" />
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Сообщение об ошибке */}
            <AnimatePresence>
                {error && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-6"
                    >
                        <Alert 
                            type="error" 
                            title="Ошибка загрузки" 
                            message={error}
                            className="flex items-center px-4 py-3 rounded-lg shadow-lg border bg-red-50 border-red-300 text-red-700 dark:bg-red-900/40 dark:border-red-700 dark:text-red-200"
                        >
                            <div className="mr-3">
                                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400"/>
                            </div>
                            <div className="text-sm font-medium">
                                {error}
                            </div>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Список отзывов */}
            <AnimatePresence>
                {!isLoading && !error && reviews.length > 0 && (
                    <motion.div 
                        className="space-y-6 mb-8"
                        initial="hidden"
                        animate="visible"
                        variants={itemVariants}
                    >
                        {reviews.map((review, index) => (
                            <motion.div
                                key={review.id}
                                custom={index}
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                whileHover="hover"
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between mb-4">
                                        <div>
                                            <Link 
                                                to={`/restaurants/${review.restaurantId}`}
                                                className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-500 transition-colors flex items-center gap-1"
                                            >
                                                {review.restaurant?.name || 'Ресторан'}
                                                <ExternalLink size={16} />
                                            </Link>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="flex items-center">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <Star
                                                            key={star}
                                                            size={18}
                                                            fill={star <= review.rating ? "#FFB800" : "none"}
                                                            stroke={star <= review.rating ? "#FFB800" : "#94a3b8"}
                                                            className="mr-1"
                                                        />
                                                    ))}
                                                </div>
                                                <span className="font-medium text-yellow-600 dark:text-yellow-500">
                                                    {review.rating}
                                                </span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <motion.button
                                            variants={buttonVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                            onClick={() => handleDeleteReview(review)}
                                            disabled={deletingReviewId === review.id}
                                            className="inline-flex items-center justify-center p-2 border border-transparent text-sm font-medium rounded-md text-red-600 hover:text-white bg-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 border-red-300 hover:border-red-600 transition-colors dark:bg-gray-700 dark:border-red-600 dark:text-red-400 dark:hover:text-white"
                                        >
                                            {deletingReviewId === review.id ? (
                                                <LoadingSpinner size="small" className="w-5 h-5" />
                                            ) : (
                                                <Trash2 size={18} />
                                            )}
                                        </motion.button>
                                    </div>
                                    <div className="mt-4 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md border border-gray-100 dark:border-gray-600">
                                        {review.comment}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Сообщение, если нет отзывов */}
            <AnimatePresence>
                {!isLoading && !error && reviews.length === 0 && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={itemVariants}
                    >
                        <Card className="p-6 text-center shadow-md border border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                У вас пока нет отзывов
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Посетите страницы ресторанов, чтобы оставить свой первый отзыв
                            </p>
                            <Link to="/restaurants">
                                <motion.button
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm hover:shadow-md"
                                >
                                    Посмотреть рестораны
                                </motion.button>
                            </Link>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Пагинация */}
            <AnimatePresence>
                {metadata.totalPages > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="mt-8"
                    >
                        <Pagination
                            currentPage={metadata.currentPage}
                            totalPages={metadata.totalPages}
                            onPageChange={(page) => goToPage(page)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </Container>
    );
}; 