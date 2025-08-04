import nodemailer from 'nodemailer';
import { Blog } from '../database/models/Blog';
import { User } from '../database/models/User';
import Redis from 'ioredis';
import { config } from 'dotenv';

config();

// Connect to Redis (optional)
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Define queue names
const EMAIL_NOTIFICATION_QUEUE = 'email:notifications';
const SUBSCRIPTION_CONFIRMATION_QUEUE = 'email:subscriptions';

// Create transporter from .env SMTP config
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ----------------------
// Send Subscription Confirmation
// ----------------------
export const sendSubscriptionConfirmation = async (email: string, name?: string) => {
  if (process.env.USE_REDIS === 'true') {
    await redis.rpush(
      SUBSCRIPTION_CONFIRMATION_QUEUE,
      JSON.stringify({ email, name })
    );
    console.log(`Queued subscription confirmation for ${email}`);
    return { queued: true };
  }

  const mailOptions = {
    from: `"Blog Platform" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Subscription Confirmation',
    html: `
      <h1>Subscription Confirmed!</h1>
      <p>Hello ${name || 'there'},</p>
      <p>Thank you for subscribing to our newsletter. You will now receive updates whenever new content is published.</p>
      <p>If you did not request this subscription, please click 
        <a href="http://localhost:5500/newsletter/unsubscribe?email=${email}">here</a> 
        to unsubscribe.
      </p>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Subscription confirmation email sent to ${email} (ID: ${info.messageId})`);
  return info;
};

// ----------------------
// Send New Blog Notification
// ----------------------
export const sendNewBlogNotification = async (
  blog: Blog,
  author: User,
  subscriberEmail: string
) => {
  if (process.env.USE_REDIS === 'true') {
    await redis.rpush(
      EMAIL_NOTIFICATION_QUEUE,
      JSON.stringify({ blog, author, subscriberEmail })
    );
    console.log(`Queued blog notification for ${subscriberEmail}`);
    return { queued: true };
  }

  const mailOptions = {
    from: `"Blog Platform" <${process.env.SMTP_USER}>`,
    to: subscriberEmail,
    subject: `New Blog Post: ${blog.title}`,
    html: `
      <h1>${blog.title}</h1>
      <p>A new blog post has been published by ${author.name}!</p>
      <p>${blog.description || ''}</p>
      <p><a href="http://localhost:5500/blogs/${blog.id}">Read the full post</a></p>
      <p>If you no longer wish to receive these notifications, 
        <a href="http://localhost:5500/newsletter/unsubscribe?email=${subscriberEmail}">unsubscribe here</a>.
      </p>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Blog notification email sent to ${subscriberEmail} (ID: ${info.messageId})`);
  return info;
};
