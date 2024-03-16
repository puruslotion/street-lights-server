import { Router } from 'express';
import { updateLevel } from '../controllers/logger.controller';
import { authenticateToken } from '../middlewares/authentication.middleware';

export const loggerRoute = Router();

loggerRoute.patch('/level', authenticateToken, updateLevel);
