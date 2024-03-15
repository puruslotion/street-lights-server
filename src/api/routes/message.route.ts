import { Router } from "express";
import { createMessage } from "../controllers/message.controller";

export const messageRoute = Router()

messageRoute.post('/add', createMessage)
// messageRoute.get('/', getMessage)
