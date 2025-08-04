import Redis from 'ioredis';
import { config } from 'dotenv';
import {
  sendNewBlogNotificationDirect,
  sendSubscriptionConfirmationDirect
} from './emailService';

config();

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const EMAIL_NOTIFICATION_QUEUE = 'email:notifications';
const SUBSCRIPTION_CONFIRMATION_QUEUE = 'email:subscriptions';

// Process new blog notifications
async function processNotifications() {
  console.log('Email worker started - processing notifications');
  
  while (true) {
    try {
      const result = await redis.blpop(EMAIL_NOTIFICATION_QUEUE, 0);
      if (result && result[1]) {
        const data = JSON.parse(result[1]);
        console.log(`Processing blog notification for ${data.subscriberEmail}`);

        await sendNewBlogNotificationDirect(data.blog, data.author, data.subscriberEmail);

        console.log(`✅ Sent blog notification to ${data.subscriberEmail} for blog ${data.blog.id}`);
      }
    } catch (error) {
      console.error('❌ Error processing blog notification:', error);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// Process subscription confirmations
async function processSubscriptions() {
  console.log('Email worker started - processing subscriptions');
  
  while (true) {
    try {
      const result = await redis.blpop(SUBSCRIPTION_CONFIRMATION_QUEUE, 0);
      if (result && result[1]) {
        const data = JSON.parse(result[1]);
        console.log(`Processing subscription confirmation for ${data.email}`);

        await sendSubscriptionConfirmationDirect(data.email, data.name);

        console.log(`✅ Sent subscription confirmation to ${data.email}`);
      }
    } catch (error) {
      console.error('❌ Error processing subscription confirmation:', error);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// Start workers
processNotifications().catch(console.error);
processSubscriptions().catch(console.error);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await redis.quit();
  process.exit(0);
});
