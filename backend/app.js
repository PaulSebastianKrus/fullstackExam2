import express from 'express';
import dotenv from 'dotenv'; 
import cors from 'cors';
import cookieParser from 'cookie-parser'; 
import rateLimiter from './middleware/rateLimiter.js';
import authRouter from './router/authRouter.js';
import statsRouter from './router/statsRouter.js';
import gamesRouter from './router/gamesRouter.js';
import gameManagementRouter from './router/gameManagementRouter.js';


dotenv.config(); 

const app = express();

app.use((req, res, next) => {
    next();
});

app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(rateLimiter);

app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/game', gamesRouter); 
app.use('/api/stats', statsRouter);
app.use('/api/game-management', gameManagementRouter); 

export default app;