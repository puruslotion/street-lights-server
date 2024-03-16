import { Router } from 'express';
import { createUser, getAllUsers } from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/authentication.middleware';

export const userRoute = Router();

// userRoute.post('/', create)
userRoute.get('/getall', authenticateToken, getAllUsers);
userRoute.post('/create', authenticateToken, createUser);
