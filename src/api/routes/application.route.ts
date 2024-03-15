import { Router } from 'express';
import {
	createApplication,
	readAllApplications,
	updateApplicationById,
} from '../controllers/application.controller';

export const applicationRoute = Router();

applicationRoute.post('/add', createApplication);
applicationRoute.get('/all', readAllApplications);
applicationRoute.patch('/update', updateApplicationById);
