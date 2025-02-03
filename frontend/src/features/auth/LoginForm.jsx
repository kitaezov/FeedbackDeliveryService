import React from "react";
import { AnimatedButton } from "../../components/AnimatedButton";


const LoginModal = ({ onClose, onSubmit, loginData, setLoginData, isRegistration }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 shadow-xl transform transition-all duration-300 scale-100">
            <h2 className="text-xl font-bold mb-4 font-playfair">
                {isRegistration ? "Регистрация" : "Войти"}
            </h2>
            <form onSubmit={onSubmit} className="space-y-4">
                {isRegistration && (
                    <div>
                        <label className="block text-sm font-medium mb-1 font-source">Имя</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 font-source"
                            value={loginData.name}
                            onChange={(e) => setLoginData({ ...loginData, name: e.target.value })}
                            required
                        />
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium mb-1 font-source">Email</label>
                    <input
                        type="email"
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 font-source"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 font-source">Пароль</label>
                    <input
                        type="password"
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 font-source"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                    />
                </div>
                <div className="flex justify-between">
                    <AnimatedButton
                        type="submit"
                        className="bg-transparent border border-gray-500 text-gray-500 px-6 py-2 rounded-lg hover:bg-gray-800 hover:text-white"
                    >
                        {isRegistration ? "Зарегистрироваться" : "Войти"}
                    </AnimatedButton>
                    <AnimatedButton
                        type="button"
                        onClick={onClose}
                        className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 font-source"
                    >
                        Отмена
                    </AnimatedButton>
                </div>
            </form>
        </div>
    </div>
);

export { LoginModal };
