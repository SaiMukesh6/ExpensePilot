const nodemailer = require('nodemailer');

/**
 * Utility to send email using Nodemailer with Gmail SMTP
 * @param {Object} options - Email options (to, subject, html)
 */
const sendEmail = async (options) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('SMTP email credentials are not defined in environment variables');
  }

  // Define Gmail SMTP email transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // Gmail App Password
    }
  });

  const mailOptions = {
    from: `"ExpensePilot" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
