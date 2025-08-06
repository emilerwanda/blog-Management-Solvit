import nodemailer from 'nodemailer';
import { Blog } from '../database/models/Blog';
import { User } from '../database/models/User';
import Queue from 'bull';
import { config } from 'dotenv';

config();

// Initialize Bull queues
const emailQueue = new Queue('email:notifications', process.env.REDIS_URL || 'redis://localhost:6379');
const subscriptionQueue = new Queue('email:subscriptions', process.env.REDIS_URL || 'redis://localhost:6379');

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Queues a subscription confirmation email job
 */
export const queueSubscriptionConfirmation = async (email: string) => {
  await subscriptionQueue.add({ email });
  console.log(`Queued subscription confirmation for ${email}`);
};

/**
 * Queues a new blog notification email job
 */
export const queueNewBlogNotification = async (blog: Blog, author: User, subscriberEmail: string) => {
  await emailQueue.add({ blog, author, subscriberEmail });
  console.log(`Queued blog notification for ${subscriberEmail}`);
};

/**
 * Sends subscription confirmation email immediately
 */
export const sendSubscriptionConfirmationDirect = async (email: string) => {
  const mailOptions = {
    from: `"Blog Platform" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Subscription Confirmation',
    html: `
      <h1>Subscription Confirmed!</h1>
      <p>Hello there,</p>
      <p>Thank you for subscribing to our newsletter. You will now receive updates whenever new content is published.</p>
      <p>If you did not request this subscription, please click 
        <a href="http://localhost:5500/newsletter/unsubscribe?email=${email}">here</a> 
        to unsubscribe.
      </p>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Subscription confirmation email sent to ${email} (ID: ${info.messageId})`);
};

/**
 * Sends blog notification email immediately
 */
export const sendNewBlogNotificationDirect = async (blog: Blog, author: User, subscriberEmail: string) => {
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
};
