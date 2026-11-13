const nodemailer = require('nodemailer');

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use Gmail, or any SMTP provider like Mailgun or SendGrid
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app password (for Gmail, use an app-specific password)
    },
});

// Function to send email
const sendEmail = async (to, subject, text,attachmentPath = null) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('EMAIL_USER and EMAIL_PASS must both be set in backend/.env');
    }

    const mailOptions = {
        from: process.env.EMAIL_USER, // Sender address
        to: to,                        // Recipient address
        subject: subject,              // Email subject
        text: text ,                    // Email body
        attachments: attachmentPath ? [
            {
                filename: 'Expiring_Policies.xlsx',
                path: attachmentPath
            }
        ] : []
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to ' + to);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = sendEmail;
