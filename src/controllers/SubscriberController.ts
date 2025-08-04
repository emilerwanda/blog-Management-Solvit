import { Request, Response, NextFunction } from "express";
import { Subscriber } from "../database/models/Subscriber";
import { SubscribeSchema, UnsubscribeSchema } from "../schemas/subscriberSchema";
import { sendSubscriptionConfirmation } from "../utils/emailService";

export class SubscriberController {
  // Subscribe to newsletter
  public static async subscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = SubscribeSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const { email, name } = value;

      // Check if already subscribed
      const existingSubscriber = await Subscriber.findOne({ where: { email } });
      if (existingSubscriber) {
        if (existingSubscriber.isActive) {
          return res.status(400).json({
            success: false,
            message: 'This email is already subscribed'
          });
        } else {
          // Reactivate subscription
          existingSubscriber.isActive = true;
          await existingSubscriber.save();
          
          // Send confirmation email
          await sendSubscriptionConfirmation(email, name);
          
          return res.status(200).json({
            success: true,
            message: 'Your subscription has been reactivated',
            data: existingSubscriber
          });
        }
      }

      // Create new subscriber
      const subscriber = await Subscriber.create({
        email,
        name,
        isActive: true
      });

      // Send confirmation email
      await sendSubscriptionConfirmation(email, name);

      return res.status(201).json({
        success: true,
        message: 'Successfully subscribed to the newsletter',
        data: subscriber
      });
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Unsubscribe from newsletter
  public static async unsubscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const email = req.query.email as string || req.body.email;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      // Validate email
      const { error } = UnsubscribeSchema.validate({ email });
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      // Find subscriber
      const subscriber = await Subscriber.findOne({ where: { email } });
      if (!subscriber || !subscriber.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found or already inactive'
        });
      }

      // Deactivate subscription (soft delete)
      subscriber.isActive = false;
      await subscriber.save();

      return res.status(200).json({
        success: true,
        message: 'Successfully unsubscribed from the newsletter'
      });
    } catch (error) {
      console.error('Error unsubscribing from newsletter:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get all subscribers (admin only)
  public static async getAllSubscribers(req: Request, res: Response, next: NextFunction) {
    try {
      const subscribers = await Subscriber.findAll({
        where: { isActive: true },
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        message: 'Subscribers retrieved successfully',
        data: subscribers
      });
    } catch (error) {
      console.error('Error retrieving subscribers:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}