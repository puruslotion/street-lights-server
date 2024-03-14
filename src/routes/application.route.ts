import { Router } from "express";
import { addApplication, getAllApplications, updateApplicationById } from "../controllers/application.controller";
// import { addMessage, getMessage } from "../controllers/message.controller";

export const applicationRoute = Router()

applicationRoute.post('/add', addApplication);
applicationRoute.get('/all', getAllApplications);
applicationRoute.patch('/update', updateApplicationById);
// messageRoute.get('/', getMessage)
