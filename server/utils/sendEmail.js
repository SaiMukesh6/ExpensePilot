const nodemailer = require('nodemailer');

/**
 * Utility to send email using Nodemailer with Gmail SMTP
 * @param {Object} options - Email options (to, subject, html)
 */
const sendEmail = async (options) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('SMTP email credentials are not defined in environment variables');
  }

  // Define Gmail SMTP email transporter explicitly with timeouts
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // Gmail App Password
    },
    connectionTimeout: 15000, // 15 seconds
    greetingTimeout: 15000,   // 15 seconds
    socketTimeout: 30000      // 30 seconds
  });

  const mailOptions = {
    from: `"ExpensePilot" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Nodemailer SMTP Error Details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack
    });
    throw error;
  }
};

module.exports = sendEmail;
