import { Router } from 'express';
import { updateLevel } from '../controllers/logger.controller';

export const loggerRoute = Router();

loggerRoute.patch('/level', updateLevel);
