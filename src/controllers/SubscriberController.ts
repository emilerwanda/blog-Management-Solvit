import { Request, Response, NextFunction } from "express";
import { AllModal } from "../database/models/index";
import { SubscribeSchema, UnsubscribeSchema } from "../schemas/subscriberSchema";
import { queueSubscriptionConfirmation } from "../utils/emailService";
import { sequelize } from "../database/config/sequelize";

const { subscriber: Subscriber} = AllModal(sequelize);

export class SubscriberController {
  
  public static async subscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = SubscribeSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const { email } = value;

     
      const existingSubscriber = await Subscriber.findOne({ where: { email } });
      if (existingSubscriber) {
        if (existingSubscriber.isSubscribed) {
          return res.status(400).json({
            success: false,
            message: 'This email is already subscribed'
          });
        } else {
         
          existingSubscriber.isSubscribed = true;
          await existingSubscriber.save();
          
          // Send confirmation email
          await queueSubscriptionConfirmation(email);
          
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
        isSubscribed: true
      });

      // Send confirmation email
      await queueSubscriptionConfirmation(email);

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
      if (!subscriber || !subscriber.isSubscribed) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found or already inactive'
        });
      }

      // Deactivate subscription (soft delete)
      subscriber.isSubscribed = false;
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
        where: { isSubscribed: true },
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