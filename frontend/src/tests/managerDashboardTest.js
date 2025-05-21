/**
 * Ручной скрипт тестирования для панели управления менеджером
 * 
 * Этот файл содержит инструкции для ручного тестирования функциональности панели управления менеджером.
 * Пройдите по этому списку, чтобы убедиться, что функция работает правильно.
 */

const testSteps = [
  {
    title: 'Login with Manager Credentials',
    steps: [
      '1. Navigate to /auth/login',
      '2. Enter manager@example.com for email',
      '3. Enter password123 for password',
      '4. Click the login button',
      '5. Verify that you are redirected to the homepage',
      '6. Verify that you see the manager icon in the navigation bar'
    ]
  },
  {
    title: 'Navigate to Manager Dashboard',
    steps: [
      '1. Click on the manager icon (layout dashboard) in the navigation bar',
      '2. Alternative: Click on your profile icon, then select "Панель менеджера" from the dropdown',
      '3. Alternative: Go directly to /manager in the URL',
      '4. Verify that you are redirected to the manager dashboard',
      '5. Verify that you can see the dashboard with statistics, charts, and review management'
    ]
  },
  {
    title: 'Test Manager Dashboard Functionality',
    steps: [
      '1. Check that all charts are rendering correctly',
      '2. Test the period selection (Last 7 days, Last 30 days, Last 12 months)',
      '3. Test filtering reviews by status, rating, and search term',
      '4. Test responding to a review (if test data is available)',
      '5. Test the refresh data button',
      '6. Verify that the dashboard is responsive on different screen sizes'
    ]
  },
  {
    title: 'Test Access Control',
    steps: [
      '1. Log out',
      '2. Try to navigate to /manager directly',
      '3. Verify that you are redirected to the login page',
      '4. Login with a regular user account (user@example.com / password123)',
      '5. Try to navigate to /manager directly',
      '6. Verify that you are redirected to the homepage (access denied)'
    ]
  }
];

// Экспортировать шаги теста для потенциального тестового прогонщика
export default testSteps;
