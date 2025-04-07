import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FolderX } from 'lucide-react';

const NotFoundPage = ({ isDarkMode }) => {
    const navigate = useNavigate();
    
    return (
        <motion.div 
            className="h-full flex flex-col items-center justify-center px-4"
            initial="initial"
            animate="animate"
            variants={{
                initial: { opacity: 0, y: 20 },
                animate: { 
                    opacity: 1, 
                    y: 0,
                    transition: {
                        duration: 0.6,
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        staggerChildren: 0.1
                    }
                }
            }}
            style={{ minHeight: '70vh' }}
        >
            <div className={`w-full max-w-lg border rounded-lg shadow-lg ${
                isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-800'
            }`}>
                <div className="border-b p-6 flex flex-col items-center">
                    <motion.div
                        className={`mb-4 p-4 rounded-full bg-red-100 dark:bg-red-900/20`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 260, 
                            damping: 20,
                            delay: 0.2 
                        }}
                    >
                        <FolderX className={`w-16 h-16 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
                    </motion.div>
                    <motion.h2 
                        className="text-3xl font-bold text-center"
                        variants={{
                            initial: { opacity: 0, y: 20 },
                            animate: { 
                                opacity: 1, 
                                y: 0,
                                transition: { duration: 0.4 }
                            }
                        }}
                    >
                        404
                    </motion.h2>
                    <motion.p 
                        className="text-xl mt-2 text-center"
                        variants={{
                            initial: { opacity: 0, y: 20 },
                            animate: { 
                                opacity: 1, 
                                y: 0,
                                transition: { duration: 0.4 }
                            }
                        }}
                    >
                        Страница не найдена
                    </motion.p>
                </div>
                
                <div className="p-6 text-center">
                    <motion.p 
                        className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                        variants={{
                            initial: { opacity: 0, y: 20 },
                            animate: { 
                                opacity: 1, 
                                y: 0,
                                transition: { duration: 0.4 }
                            }
                        }}
                    >
                        Упс! Страница, которую вы ищете, не существует или была перемещена.
                    </motion.p>
                    
                    <motion.button
                        onClick={() => navigate('/')}
                        className={`inline-flex items-center bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        variants={{
                            initial: { opacity: 0, y: 20 },
                            animate: { 
                                opacity: 1, 
                                y: 0,
                                transition: { duration: 0.4 }
                            }
                        }}
                    >
                        Вернуться на главную
                    </motion.button>

                    
                </div>
            </div>
        </motion.div>
    );
};

export default NotFoundPage; 