import { Router } from 'express';
import {
	createApplication,
	readAllApplications,
	updateApplicationById,
} from '../controllers/application.controller';
import { authenticateToken } from '../middlewares/authentication.middleware';

export const applicationRoute = Router();

applicationRoute.post('/add', authenticateToken, createApplication);
applicationRoute.get('/all', authenticateToken, readAllApplications);
applicationRoute.patch('/update', authenticateToken, updateApplicationById);
