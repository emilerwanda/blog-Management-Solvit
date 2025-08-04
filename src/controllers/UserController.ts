import { Request, Response, NextFunction } from "express";
import { User } from "../database/models/User";
import { AddUserSchema, LoginUserSchema } from "../schemas/userSchema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class UserController {
  // Create user
  public static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = AddUserSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const { email, name, password, gender } = value;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User Already Exists'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        email,
        name,
        password: hashedPassword,
        gender,
        role: 'user' 
      });

      const userResponse = user.toJSON() as any;
      delete userResponse.password;

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: userResponse
      });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Login user
  public static async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = LoginUserSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const { email, password } = value;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User doesn't exists please sign-in"
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password || '');
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '15min' }
      );

      return res.status(200).json({
        success: true,
        message: 'User Logins succesfuly',
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
      });
    } catch (error) {
      console.error('Error logging in:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Add other user-related methods here
}