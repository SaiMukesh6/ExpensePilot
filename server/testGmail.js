const dotenv = require('dotenv');
dotenv.config();

const sendEmail = require('./utils/sendEmail');

async function testGmail() {
  console.log('Sending test email via live Gmail SMTP...');
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER}`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Error: EMAIL_USER or EMAIL_PASS environment variables are missing!');
    process.exit(1);
  }

  try {
    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: 'ExpensePilot - Live Gmail SMTP Test Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #edf2f7; border-radius: 8px;">
          <h2 style="color: #10b981; text-align: center;">ExpensePilot Gmail Integration</h2>
          <p>Hello,</p>
          <p>This is a test email sent from the ExpensePilot application to verify that your Gmail SMTP configuration and App Password are working successfully.</p>
          <p>No action is required.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
          <p style="font-size: 11px; color: #a0aec0; text-align: center;">ExpensePilot Placement Project QA System</p>
        </div>
      `
    });
    console.log('🎉 Gmail SMTP Test Successful! The email was sent successfully.');
  } catch (error) {
    console.error('✗ Gmail SMTP Test Failed:', error);
  }
}

testGmail();
