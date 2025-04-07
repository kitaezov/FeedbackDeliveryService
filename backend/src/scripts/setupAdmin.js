/**
 * Setup Head Admin Script
 * Creates or updates the head admin account (admin@yandex.ru)
 */

require('dotenv').config({ path: '../../.env' });
const userModel = require('../models/userModel');

async function setupHeadAdmin() {
    try {
        console.log('Setting up head admin account...');
        const headAdmin = await userModel.ensureHeadAdmin();
        console.log('Head admin account set up successfully:', {
            email: headAdmin.email,
            role: headAdmin.role
        });
        process.exit(0);
    } catch (error) {
        console.error('Error setting up head admin:', error);
        process.exit(1);
    }
}

setupHeadAdmin(); 