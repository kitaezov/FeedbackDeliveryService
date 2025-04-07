import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { Container, Button } from './ui';
import { ThemeToggle } from './ThemeToggle';
import logo from '../../assets/logo.png';

/**
 * Компонент шапки приложения
 * 
 * @returns {JSX.Element}
 */
export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuthContext();
    
    // Меню навигации
    const navItems = [
        { to: '/', label: 'Главная' },
        { to: '/restaurants', label: 'Рестораны' },
        { to: '/about', label: 'О нас' }
    ];
    
    // Пункты меню, видимые только авторизованным пользователям
    const authNavItems = [
        { to: '/support', label: 'Поддержка' }
    ];
    
    // Переключение мобильного меню
    const toggleMenu = () => {
        setIsMenuOpen(prevState => !prevState);
    };
    
    // Закрытие мобильного меню
    const closeMenu = () => {
        setIsMenuOpen(false);
    };
    
    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm py-4">
            <Container>
                <div className="flex items-center justify-between">
                    {/* Логотип */}
                    <Link to="/" className="flex items-center" onClick={closeMenu}>
                        <img 
                            src={logo} 
                            alt="Feedback Service Logo" 
                            className="h-8 w-auto" 
                        />
                        <span className="ml-2 text-lg font-bold text-primary-600 dark:text-primary-400">
                            Feedback
                        </span>
                    </Link>
                    
                    {/* Меню для десктопов */}
                    <nav className="hidden md:flex space-x-8">
                        {navItems.map(item => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) => 
                                    `text-sm font-medium transition-colors ${
                                        isActive 
                                            ? 'text-primary-600 dark:text-primary-400' 
                                            : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                                    }`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                        
                        {/* Пункты для авторизованных пользователей */}
                        {isAuthenticated && 
                            authNavItems.map(item => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) => 
                                        `text-sm font-medium transition-colors ${
                                            isActive 
                                                ? 'text-primary-600 dark:text-primary-400' 
                                                : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                                        }`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            ))
                        }
                    </nav>
                    
                    {/* Правая часть шапки */}
                    <div className="hidden md:flex items-center space-x-4">
                        <ThemeToggle />
                        
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <Link to="/profile/reviews">
                                    <Button variant="text">
                                        Мои отзывы
                                    </Button>
                                </Link>
                                
                                <div className="relative group">
                                    <button className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                                        <span>{user?.name || 'Пользователь'}</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-10 invisible group-hover:visible">
                                        <Link 
                                            to="/profile" 
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                        >
                                            Профиль
                                        </Link>
                                        <Link 
                                            to="/profile/reviews" 
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                        >
                                            Мои отзывы
                                        </Link>
                                        <button 
                                            onClick={logout}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                        >
                                            Выйти
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex space-x-2">
                                <Link to="/login">
                                    <Button variant="text">
                                        Вход
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button variant="primary">
                                        Регистрация
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                    
                    {/* Мобильное меню */}
                    <div className="md:hidden flex items-center space-x-4">
                        <ThemeToggle />
                        
                        <button
                            onClick={toggleMenu}
                            className="text-gray-700 dark:text-gray-300 focus:outline-none"
                            aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
                
                {/* Развернутое мобильное меню */}
                {isMenuOpen && (
                    <div className="md:hidden mt-4 pb-2">
                        <nav className="flex flex-col space-y-3">
                            {navItems.map(item => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    onClick={closeMenu}
                                    className={({ isActive }) => 
                                        `py-2 text-base font-medium ${
                                            isActive 
                                                ? 'text-primary-600 dark:text-primary-400' 
                                                : 'text-gray-700 dark:text-gray-300'
                                        }`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                            
                            {/* Авторизованные пункты меню для мобильной версии */}
                            {isAuthenticated && 
                                authNavItems.map(item => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        onClick={closeMenu}
                                        className={({ isActive }) => 
                                            `py-2 text-base font-medium ${
                                                isActive 
                                                    ? 'text-primary-600 dark:text-primary-400' 
                                                    : 'text-gray-700 dark:text-gray-300'
                                            }`
                                        }
                                    >
                                        {item.label}
                                    </NavLink>
                                ))
                            }
                            
                            {isAuthenticated ? (
                                <>
                                    <NavLink
                                        to="/profile"
                                        onClick={closeMenu}
                                        className={({ isActive }) => 
                                            `py-2 text-base font-medium ${
                                                isActive 
                                                    ? 'text-primary-600 dark:text-primary-400' 
                                                    : 'text-gray-700 dark:text-gray-300'
                                            }`
                                        }
                                    >
                                        Профиль
                                    </NavLink>
                                    <NavLink
                                        to="/profile/reviews"
                                        onClick={closeMenu}
                                        className={({ isActive }) => 
                                            `py-2 text-base font-medium ${
                                                isActive 
                                                    ? 'text-primary-600 dark:text-primary-400' 
                                                    : 'text-gray-700 dark:text-gray-300'
                                            }`
                                        }
                                    >
                                        Мои отзывы
                                    </NavLink>
                                    <button
                                        onClick={() => {
                                            logout();
                                            closeMenu();
                                        }}
                                        className="py-2 text-base font-medium text-gray-700 dark:text-gray-300 text-left"
                                    >
                                        Выйти
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col space-y-2 pt-2">
                                    <Link to="/login" onClick={closeMenu}>
                                        <Button variant="secondary" fullWidth>
                                            Вход
                                        </Button>
                                    </Link>
                                    <Link to="/register" onClick={closeMenu}>
                                        <Button variant="primary" fullWidth>
                                            Регистрация
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </nav>
                    </div>
                )}
            </Container>
        </header>
    );
}; 