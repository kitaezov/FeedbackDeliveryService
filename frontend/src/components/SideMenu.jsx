import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Home, User, LogOut, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SideMenu = ({
                      isMenuOpen,
                      setIsMenuOpen,
                      user,
                      navigateTo,
                      handleLogout
                  }) => {
    const navigate = useNavigate();
    
    const menuVariants = {
        hidden: {
            x: "-100%",
            opacity: 0,
            transition: {
                type: "tween",
                duration: 0.3
            }
        },
        visible: {
            x: "0%",
            opacity: 1,
            transition: {
                type: "tween",
                duration: 0.3
            }
        }
    };

    const menuItemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.3
            }
        }
    };

    return (
        <AnimatePresence>
            {isMenuOpen && (
                <motion.div
                    key="side-menu"
                    variants={menuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="fixed left-0 top-[56px] z-40 w-64 h-full bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-tr-xl rounded-br-xl p-6 overflow-hidden"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">Menu</h2>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="text-gray-300 hover:text-white transition-colors rounded-full p-2 hover:bg-gray-700"
                        >
                            ✕
                        </button>
                    </div>

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.1,
                                    delayChildren: 0.2
                                }
                            }
                        }}
                        className="space-y-2"
                    >
                        <motion.button
                            variants={menuItemVariants}
                            onClick={() => {
                                navigate('/');
                                setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center space-x-3 p-3 text-gray-200 hover:bg-gray-700/50 rounded-lg transition-all group"
                        >
                            <Home className="h-5 w-5 text-blue-400 group-hover:text-blue-300 transition-colors"/>
                            <span className="font-medium group-hover:text-white">Главная</span>
                        </motion.button>

                        {user && (
                            <>
                                <motion.button
                                    variants={menuItemVariants}
                                    onClick={() => {
                                        navigate('/profile');
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full flex items-center space-x-3 p-3 text-gray-200 hover:bg-gray-700/50 rounded-lg transition-all group"
                                >
                                    <User className="h-5 w-5 text-green-400 group-hover:text-green-300 transition-colors"/>
                                    <span className="font-medium group-hover:text-white">Профиль</span>
                                </motion.button>

                                {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'moderator' || 
                                user.role === 'глав_админ' || user.role === 'head_admin' || 
                                user.role === 'manager' || user.role === 'менеджер') && (
                                    <motion.button
                                        variants={menuItemVariants}
                                        onClick={() => {
                                            navigate('/admin');
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full flex items-center space-x-3 p-3 text-yellow-400 hover:bg-gray-700/50 rounded-lg transition-all group"
                                    >
                                        <ShieldCheck className="h-5 w-5 group-hover:text-yellow-300 transition-colors"/>
                                        <span className="font-medium group-hover:text-white">Панель Администратора</span>
                                    </motion.button>
                                )}

                                <motion.button
                                    variants={menuItemVariants}
                                    onClick={() => {
                                        handleLogout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full flex items-center space-x-3 p-3 text-red-400 hover:bg-gray-700/50 rounded-lg transition-all group"
                                >
                                    <LogOut className="h-5 w-5 group-hover:text-red-300 transition-colors"/>
                                    <span className="font-medium group-hover:text-white">Выход</span>
                                </motion.button>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SideMenu;