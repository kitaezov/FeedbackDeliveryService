# FeedbackDeliveryService

## Описание
FeedbackDeliveryService — это сервис для сбора отзывов о ресторанах. Позволяет пользователям оценивать заведения, оставлять комментарии и анализировать рейтинги.

## Функциональность
- Добавление отзывов с оценками по различным критериям
- Авторизация и регистрация пользователей
- Лайки и комментарии к отзывам
- Просмотр статистики по рейтингам

## Технологии
- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express
- **База данных:** PostgreSQL / MongoDB
- **Аутентификация:** JWT

### Установка зависимостей
```sh
npm install
```

### Запуск проекта
```sh
cd .\frontend\
npm start
```

### Локальный хост
#### Веб-сайт
```sh
http://localhost:3000
```

## Иерархия ролей администраторов

В системе реализована логическая иерархия ролей с различными разрешениями для каждой роли:

### Уровни ролей (в порядке убывания привилегий)

1. **Главный администратор** (head_admin)
   - Может управлять всеми ресторанами, пользователями и контентом
   - Может назначать любую роль (включая admin и head_admin)
   - Имеет доступ ко всем функциям панели администратора
   - Только head_admin может вносить изменения в учетные записи других head_admin
   - Специальная учетная запись: admin@yandex.ru всегда имеет роль head_admin

2. **Администратор** (admin)
   - Может управлять ресторанами и всем контентом
   - Может назначать роль менеджера пользователям
   - Не может изменять администраторов или главных администраторов

3. **Менеджер** (manager)
   - Может модерировать отзывы и контент
   - Не может изменять роли пользователей, кроме понижения до обычного пользователя
   - Не может управлять ресторанами или другими администраторами
   - Ограниченный доступ к панели администратора

4. **Пользователь** (user)
   - Обычный пользователь без административных привилегий

## Как получить права администратора

### Учетная запись главного администратора по умолчанию
- **Email:** admin@yandex.ru
- **Пароль:** admin123
- Эта учетная запись имеет полные права head_admin по умолчанию

### Ручное назначение ролей администратора
1. Войдите в систему с учетной записью head_admin
2. Перейдите в Панель администратора → Управление пользователями
3. Найдите пользователя, которого хотите повысить
4. Нажмите "Редактировать пользователя"
5. Измените их роль на admin, manager или head_admin
6. Сохраните изменения

### Через базу данных (для разработчиков)
```sh
cd backend
node src/scripts/updateRoles.js
```

### Доступ к панели администратора
После входа в систему в качестве администратора:
1. Панель администратора доступна по адресу `/admin`
2. Или нажмите на значок администратора в верхней панели навигации

## Функции администратора

### Управление ресторанами
- Добавление новых ресторанов
- Редактирование данных о ресторанах
- Удаление ресторанов
- Управление категориями ресторанов

### Управление пользователями
- Просмотр всех пользователей
- Редактирование информации о пользователях
- Изменение ролей пользователей
- Блокировка пользователей

### Модерация отзывов
- Просмотр всех отзывов
- Редактирование или удаление неприемлемых отзывов
- Скрытие отзывов от публичного просмотра

### Панель аналитики
- Просмотр статистики сайта
- Мониторинг активности пользователей
- Отслеживание популярных ресторанов

## Запуск обновления системы ролей

При обновлении до новой системы ролей выполните:

```sh
cd backend
node src/scripts/updateRoles.js
```

Это:
- Обновит схему базы данных для поддержки иерархии ролей
- Убедится, что учетная запись head_admin существует (admin@yandex.ru)
- Перенесет устаревшие роли в новую систему
