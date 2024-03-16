import { Router } from 'express';
import { checkIfLoggedIn, login } from '../controllers/login.controller';
import { authenticateToken } from '../middlewares/authentication.middleware';

export const loginRoute = Router();

loginRoute.post('/', login);
loginRoute.get('/check', authenticateToken, checkIfLoggedIn);
