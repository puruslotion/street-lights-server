import { Router } from 'express';
import { createMessage } from '../controllers/message.controller';
import { authenticateToken } from '../middlewares/authentication.middleware';

export const messageRoute = Router();

messageRoute.post('/add', authenticateToken, createMessage);
