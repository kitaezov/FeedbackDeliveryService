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
            <div className={`w-full max-w-lg border rounded-xl shadow-xl ${
                isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-800'
            }`}>
                <div className="border-b p-8 flex flex-col items-center">
                    <motion.div
                        className={`mb-6 p-5 rounded-full bg-red-100 dark:bg-red-900/20 shadow-md`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 260, 
                            damping: 20,
                            delay: 0.2 
                        }}
                    >
                        <FolderX className={`w-20 h-20 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
                    </motion.div>
                    <motion.h2 
                        className="text-4xl font-bold text-center mb-2"
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
                        className="text-2xl mt-2 text-center font-medium"
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
                
                <div className="p-8 text-center">
                    <motion.p 
                        className={`mb-8 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
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
                        className={`inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg text-md font-medium shadow-md hover:shadow-lg hover:bg-blue-700 transition-all`}
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