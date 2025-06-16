/**
 * Исправленные функции для блокировки/разблокировки пользователей
 * Замените эти функции в вашем файле AdminPanel.jsx
 */

// Функция для блокировки пользователя с исправленным URL
// Функция для блокировки пользователя с исправленным URL
const confirmBlockUser = async () => {
    if (!userToBlock || !blockReason.trim()) return;
    
    try {
        // Исправленный URL без начального слеша admin
        // Исправленный URL без начального слеша admin
        await api.post(`admin/users/${userToBlock.id}/block`, { reason: blockReason });
        
        // Обновляем пользователя в списке
        setUsers(prevUsers => prevUsers.map(u => 
            u.id === userToBlock.id ? { ...u, is_blocked: 1, blocked_reason: blockReason } : u
        ));
        
        // Закрываем модальное окно
        setShowBlockModal(false);
        setUserToBlock(null);
        setBlockReason('');
    } catch (error) {
        console.error('Error blocking user:', error);
        alert('Ошибка при блокировке пользователя');
    }
};

// Функция для разблокировки пользователя с исправленным URL
const confirmUnblockUser = async () => {
    if (!userToUnblock) return;
    
    try {
        // Исправленный URL без начального слеша admin
        // Исправленный URL без начального слеша admin
        await api.post(`admin/users/${userToUnblock.id}/unblock`);
        
        // Обновляем пользователя в списке
        setUsers(prevUsers => prevUsers.map(u => 
            u.id === userToUnblock.id ? { ...u, is_blocked: 0, blocked_reason: null } : u
        ));
        
        // Закрываем модальное окно
        setShowUnblockModal(false);
        setUserToUnblock(null);
    } catch (error) {
        console.error('Error unblocking user:', error);
        alert('Ошибка при разблокировке пользователя');
    }
}; 