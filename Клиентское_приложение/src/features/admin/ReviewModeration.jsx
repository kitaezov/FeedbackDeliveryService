    return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-200">Модерация отзывов</h2>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <button
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md font-medium transition-all focus:outline-none ${
                        tab === 'active' 
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setTab('active')}
                >
                    Активные отзывы
                </button>
                <button
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md font-medium transition-all focus:outline-none ${
                        tab === 'deleted' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setTab('deleted')}
                >
                    Удаленные отзывы
                </button>
            </div>
            
            {tab === 'active' ? (
                <div className="space-y-4">
                    {loading.reviews ? (
                        <div className="flex justify-center py-6 sm:py-8">
                            <LoadingSpinner />
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-6 sm:py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Нет активных отзывов</p>
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            {reviews.map(review => (
                                <div 
                                    key={review.id} 
                                    className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                                >
                                    <div className="p-3 sm:p-4 sm:pb-3 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                                {review.user?.avatar ? (
                                                    <img 
                                                        src={review.user.avatar} 
                                                        alt={review.user.name} 
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <User size={16} className="text-gray-500 dark:text-gray-400" />
                                                )}
                                            </div>
                                            <div className="ml-2 sm:ml-3">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                    <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
                                                        {review.user?.name || 'Анонимный пользователь'}
                                                    </h3>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatDate(review.created_at)}
                                                    </span>
                                                </div>
                                                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                    {review.restaurant?.name && (
                                                        <span>Ресторан: {review.restaurant.name}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center mt-2 sm:mt-0 w-full sm:w-auto justify-end">
                                            <div className="flex items-center mr-2 sm:mr-3">
                                                <div className="flex items-center">
                                                    {Array.from({ length: 5 }).map((_, index) => (
                                                        <Star 
                                                            key={index}
                                                            size={14} 
                                                            className={`${
                                                                index < review.rating 
                                                                    ? 'text-yellow-400 fill-yellow-400' 
                                                                    : 'text-gray-300 dark:text-gray-600'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="ml-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                                                    {review.rating.toFixed(1)}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteReview(review.id)}
                                                className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-md transition-all"
                                            >
                                                <div className="flex items-center">
                                                    <Trash size={14} className="mr-1" />
                                                    <span>Удалить</span>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-3 sm:p-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                        <p>{review.text}</p>
                                        
                                        {review.criteria && review.criteria.length > 0 && (
                                            <div className="mt-3 sm:mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                                {review.criteria.map((item, index) => (
                                                    <div key={index} className="flex flex-col p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                                                        <span className="text-xs text-gray-600 dark:text-gray-400">{item.name}</span>
                                                        <div className="flex items-center mt-1">
                                                            <div className="flex items-center">
                                                                {Array.from({ length: 5 }).map((_, idx) => (
                                                                    <Star 
                                                                        key={idx}
                                                                        size={12} 
                                                                        className={`${
                                                                            idx < item.value 
                                                                                ? 'text-yellow-400 fill-yellow-400' 
                                                                                : 'text-gray-300 dark:text-gray-600'
                                                                        }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="ml-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                                                {item.value}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {review.images && review.images.length > 0 && (
                                            <div className="mt-3 sm:mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                {review.images.map((image, index) => (
                                                    <div key={index} className="relative pt-[100%] bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                                                        <img 
                                                            src={image.url || image} 
                                                            alt={`Фото #${index + 1}`}
                                                            className="absolute top-0 left-0 w-full h-full object-cover cursor-pointer"
                                                            onClick={() => onImageClick(review.images, index)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {loading.deletedReviews ? (
                        <div className="flex justify-center py-6 sm:py-8">
                            <LoadingSpinner />
                        </div>
                    ) : deletedReviews.length === 0 ? (
                        <div className="text-center py-6 sm:py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Нет удаленных отзывов</p>
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            {deletedReviews.map(review => (
                                <div 
                                    key={review.id} 
                                    className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 border-l-4 border-l-red-500"
                                >
                                    <div className="p-3 sm:p-4 sm:pb-3 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                                {review.user?.avatar ? (
                                                    <img 
                                                        src={review.user.avatar} 
                                                        alt={review.user.name} 
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <User size={16} className="text-gray-500 dark:text-gray-400" />
                                                )}
                                            </div>
                                            <div className="ml-2 sm:ml-3">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                    <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
                                                        {review.user?.name || 'Анонимный пользователь'}
                                                    </h3>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatDate(review.created_at)}
                                                    </span>
                                                </div>
                                                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                    {review.restaurant?.name && (
                                                        <span>Ресторан: {review.restaurant.name}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center mt-2 sm:mt-0 w-full sm:w-auto justify-end">
                                            <div className="flex items-center mr-2 sm:mr-3">
                                                <div className="flex items-center">
                                                    {Array.from({ length: 5 }).map((_, index) => (
                                                        <Star 
                                                            key={index}
                                                            size={14} 
                                                            className={`${
                                                                index < review.rating 
                                                                    ? 'text-yellow-400 fill-yellow-400' 
                                                                    : 'text-gray-300 dark:text-gray-600'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="ml-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                                                    {review.rating.toFixed(1)}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleRestoreReview(review.id)}
                                                className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 rounded-md transition-all"
                                            >
                                                <div className="flex items-center">
                                                    <RefreshCw size={14} className="mr-1" />
                                                    <span>Восстановить</span>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-3 sm:p-4 text-xs sm:text-sm">
                                        <div className="mb-3 p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-900/30">
                                            <p className="text-red-700 dark:text-red-400 font-medium text-xs sm:text-sm mb-1">Причина удаления:</p>
                                            <p className="text-red-600 dark:text-red-300 text-xs sm:text-sm">{review.deletion_reason || 'Причина не указана'}</p>
                                        </div>
                                        
                                        <p className="text-gray-700 dark:text-gray-300">{review.text}</p>
                                        
                                        {review.criteria && review.criteria.length > 0 && (
                                            <div className="mt-3 sm:mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                                {review.criteria.map((item, index) => (
                                                    <div key={index} className="flex flex-col p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                                                        <span className="text-xs text-gray-600 dark:text-gray-400">{item.name}</span>
                                                        <div className="flex items-center mt-1">
                                                            <div className="flex items-center">
                                                                {Array.from({ length: 5 }).map((_, idx) => (
                                                                    <Star 
                                                                        key={idx}
                                                                        size={12} 
                                                                        className={`${
                                                                            idx < item.value 
                                                                                ? 'text-yellow-400 fill-yellow-400' 
                                                                                : 'text-gray-300 dark:text-gray-600'
                                                                        }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="ml-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                                                {item.value}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {review.images && review.images.length > 0 && (
                                            <div className="mt-3 sm:mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                {review.images.map((image, index) => (
                                                    <div key={index} className="relative pt-[100%] bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                                                        <img 
                                                            src={image.url || image} 
                                                            alt={`Фото #${index + 1}`}
                                                            className="absolute top-0 left-0 w-full h-full object-cover cursor-pointer"
                                                            onClick={() => onImageClick(review.images, index)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    ); 