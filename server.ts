import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { config } from 'dotenv';
import './src/midlewares/passportMiddleware';
import { authRouters } from './src/routes/authRouter';
import { BasicRouters } from './src/routes/basicRouter';
import { userRouter } from './src/routes/userRouter';
import { blogRouter } from './src/routes/blogRouter';
import { commentRouter } from './src/routes/commentRouter';
import { likeRouter } from './src/routes/likeRouter';
import helmet from 'helmet';
import cors from 'cors';

config();

const app = express();

app.use(helmet());

app.use(cors({
    origin: "http://localhost:5500",
    credentials: true
}));

app.use(express.json());


app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
}));


app.use(passport.initialize());
app.use(passport.session());


app.use('/', BasicRouters);
app.use('/', authRouters);
app.use('/', userRouter);
app.use('/', blogRouter);
app.use('/', commentRouter);
app.use('/', likeRouter);


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: "Not found",
        success: false,
        message: "not found"
    });
});

const port = parseInt(process.env.PORT as string) || 5500

// Only start the server if this file is executed directly (not imported)
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Our server is running at localhost//${port}`)
    })
}

export { app }


