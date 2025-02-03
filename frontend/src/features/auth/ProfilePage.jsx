import React, {useState} from "react";
import {LoadingSpinner} from "../../components/LoadingSpinner";
import {Card, CardContent, CardHeader, CardTitle} from "../../components/Card";
import {Edit} from "lucide-react";
import {ReviewCard} from '../../components/ReviewCard';


const ProfilePage = ({user, onUpdateUser, onLogout}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState(user);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        onUpdateUser(editedUser);
        setIsEditing(false);
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            {isLoading && <LoadingSpinner/>}

            <Card>
                <CardHeader>
                    <CardTitle>Профиль пользователя</CardTitle>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Имя</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    value={editedUser.name}
                                    onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    value={editedUser.email}
                                    onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Новый пароль</label>
                                <input
                                    type="password"
                                    className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    placeholder="Оставьте пустым, чтобы не менять"
                                    onChange={(e) => setEditedUser({...editedUser, newPassword: e.target.value})}
                                />
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                >
                                    Сохранить
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-semibold">{user.name}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                                </div>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <Edit className="h-5 w-5"/>
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <div className="text-2xl font-bold">{user.totalReviews}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Отзывов</div>
                                </div>
                                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <div className="text-2xl font-bold">{user.averageRating}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Средняя оценка</div>
                                </div>
                                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <div className="text-2xl font-bold">{user.totalLikes}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Лайков получено</div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Мои отзывы</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {user.reviews.map(review => (
                            <ReviewCard key={review.id} review={{...review, userName: user.name, avatar: user.avatar}}/>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export {ProfilePage};