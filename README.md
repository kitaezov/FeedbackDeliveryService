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

### localhost
#### Сайт
```sh
http://localhost:3000
```

## Admin Role Hierarchy

The system implements a logical role hierarchy with different permissions per role:

### Role Levels (in descending order of privileges)

1. **Head Admin** (head_admin)
   - Can manage all restaurants, users, and content
   - Can assign any role (including admin and head_admin)
   - Has access to all admin panel features
   - Only head_admin can make changes to other head_admin accounts
   - Special account: admin@yandex.ru is always head_admin

2. **Admin** (admin)
   - Can manage restaurants and all content
   - Can assign manager role to users
   - Cannot modify admins or head_admins

3. **Manager** (manager)
   - Can moderate reviews and content
   - Cannot modify user roles except downgrading to user
   - Cannot manage restaurants or other admins
   - Limited admin panel access

4. **User** (user)
   - Regular user with no admin privileges

### Running the Role System Update

When upgrading to the new role system, run:

```
cd backend
node src/scripts/updateRoles.js
```

This will:
- Update the database schema to support the role hierarchy
- Ensure the head_admin account exists (admin@yandex.ru)
- Migrate any legacy roles to the new system
