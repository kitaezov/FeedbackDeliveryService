# FeedbackDeliveryService

## Description
FeedbackDeliveryService is a service for collecting restaurant reviews. It allows users to rate establishments, leave comments, and analyze ratings.

## Functionality
- Adding reviews with ratings based on various criteria
- User authorization and registration
- Likes and comments on reviews
- Viewing statistics on ratings

## Technologies
- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** PostgreSQL / MongoDB
- **Authentication:** JWT

### Installing Dependencies
```sh
npm install
```

### Starting the Project
```sh
cd .\frontend\
npm start
```

### localhost
#### Website
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

## How to Get Admin Access

### Default Head Admin Account
- **Email:** admin@yandex.ru
- **Password:** admin123
- This account has full head_admin privileges by default

### Manually Assigning Admin Roles
1. Log in with the head_admin account
2. Navigate to Admin Panel → User Management
3. Find the user you want to promote
4. Click "Edit User"
5. Change their role to admin, manager, or head_admin
6. Save changes

### Through Database (for developers)
```sh
cd backend
node src/scripts/updateRoles.js
```

### Admin Panel Access
Once logged in as an admin:
1. The admin panel is accessible at `/admin`
2. Or click on the admin icon in the top navbar

## Admin Features

### Restaurant Management
- Add new restaurants
- Edit restaurant details
- Delete restaurants
- Manage restaurant categories

### User Management
- View all users
- Edit user information
- Change user roles
- Block users

### Review Moderation
- View all reviews
- Edit or delete inappropriate reviews
- Hide reviews from public view

### Analytics Dashboard
- View site statistics
- Monitor user activity
- Track popular restaurants

## Running the Role System Update

When upgrading to the new role system, run:

```sh
cd backend
node src/scripts/updateRoles.js
```

This will:
- Update the database schema to support the role hierarchy
- Ensure the head_admin account exists (admin@yandex.ru)
- Migrate any legacy roles to the new system
