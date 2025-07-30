import { Router, Request, Response, NextFunction } from "express";
import { User } from "../database/models/User";
import { isAuthenticated } from "../midlewares/authUserMiddleware";
import { AddUserSchema, LoginUserSchema } from "../schemas/userSchema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userRouter = Router();


userRouter.post('/users', async (req: Request, res: Response, next: NextFunction) => {
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
});


userRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
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
            data: token
        });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


userRouter.get('/users', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });

        return res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: users
        });
    } catch (error) {
        console.error('Error retrieving users:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


userRouter.get('/users/:id', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            data: user
        });
    } catch (error) {
        console.error('Error retrieving user:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


userRouter.put('/users/:id', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        delete updateData.password;
        delete updateData.role;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }


        
        await user.update(updateData);

     
        const userResponse = user.toJSON() as any;
        delete userResponse.password;

        return res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: userResponse
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


userRouter.delete('/users/:id', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

      
        await user.destroy();

        return res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

export { userRouter }; 