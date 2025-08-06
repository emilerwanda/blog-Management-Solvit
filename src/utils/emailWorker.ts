import Queue from 'bull';
import { config } from 'dotenv';
import {
  sendNewBlogNotificationDirect,
  sendSubscriptionConfirmationDirect
} from './emailService';

config();

const emailQueue = new Queue('email:notifications', process.env.REDIS_URL || 'redis://localhost:6379');
const subscriptionQueue = new Queue('email:subscriptions', process.env.REDIS_URL || 'redis://localhost:6379');

emailQueue.process(async (job) => {
  const { blog, author, subscriberEmail } = job.data;
  console.log(`Processing blog notification for ${subscriberEmail}`);

  await sendNewBlogNotificationDirect(blog, author, subscriberEmail);

  console.log(`✅ Sent blog notification to ${subscriberEmail} for blog ${blog.id}`);
});

subscriptionQueue.process(async (job) => {
  const { email } = job.data;
  console.log(`Processing subscription confirmation for ${email}`);

  await sendSubscriptionConfirmationDirect(email);

  console.log(`✅ Sent subscription confirmation to ${email}`);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await emailQueue.close();
  await subscriptionQueue.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await emailQueue.close();
  await subscriptionQueue.close();
  process.exit(0);
});
