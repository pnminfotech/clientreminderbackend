require('dotenv').config();
const sendEmail = require('../utils/sendEmail');

const REMINDER_EMAIL = 'pnminfotech2024@gmail.com';

const testEmail = async () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('EMAIL_USER and EMAIL_PASS must both be set in backend/.env');
    }

    await sendEmail(
        REMINDER_EMAIL,
        'Client Reminders - email test',
        `Email configuration is working.\n\nSent at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`
    );
    console.log(`Test completed. Check the inbox and Spam folder for ${REMINDER_EMAIL}.`);
};

testEmail()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Email test failed:', error.message);
        process.exit(1);
    });
