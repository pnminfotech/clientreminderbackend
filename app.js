require('dotenv').config();

const express = require('express'); 
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const policyRoutes = require('./routes/policyRoutes');
const userRoutes = require('./routes/userRoutes');
const cron = require('node-cron');
const checkPoliciesForNotifications = require('./utils/checkPoliciesForNotifications');

const app = express();

// Middleware
const allowedOrigins = (process.env.ALLOWED_ORIGINS ||
    'https://pnminfotech.com,http://localhost:3000,http://localhost:3001')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const corsOptions = {
    origin(origin, callback) {
        // Requests without an Origin header (for example, server-to-server calls)
        // are not subject to browser CORS checks.
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
  

app.use(bodyParser.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api', policyRoutes);

// Test route to send email
// app.get('/test-email', async (req, res) => {
//     try {
//         await sendEmail('pnminfotech2024@gmail.com', 'Test Email', 'This is a test email');
//         res.send('Test email sent successfully!');
//     } catch (error) {
//         console.error('Error sending test email:', error);
//         res.status(500).send('Failed to send test email');
//     }
// });

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Do not accept requests or query policies until MongoDB is ready.
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        // Check once after a successful database connection.
        await checkPoliciesForNotifications();

        // Check every day at 9:00 AM India time.
        cron.schedule('0 9 * * *', () => {
            console.log('Running daily client reminder check...');
            checkPoliciesForNotifications();
        }, { timezone: 'Asia/Kolkata' });
    } catch (error) {
        console.error('Backend startup failed:', error);
        process.exit(1);
    }
};

startServer();
