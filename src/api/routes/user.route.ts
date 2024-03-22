import { Router } from 'express';
import {
	createUser,
	getAllUsers,
	isUserLoggedIn,
	login,
	logout,
} from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/authentication.middleware';

export const userRoute = Router();

// userRoute.post('/', create)
userRoute.get('/getall', authenticateToken, getAllUsers);
userRoute.post('/create', authenticateToken, createUser);
userRoute.post('/login', login);
userRoute.get('/logout', authenticateToken, logout);
userRoute.get('/isuserloggedin', authenticateToken, isUserLoggedIn);
