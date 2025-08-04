// smtp-test.ts
import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config(); // load .env vars

async function testSMTP() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Test" <${process.env.SMTP_USER}>`,
      to: 'emilerwandan@gmail.com',  // Replace with your actual email
      subject: 'SMTP Test Email',
      text: 'This is a test email to verify SMTP settings.',
      html: '<b>This is a test email to verify SMTP settings.</b>',
    });

    console.log('Email sent successfully!', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

testSMTP();
