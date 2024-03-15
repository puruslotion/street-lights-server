import { Router } from "express";
import { addMessage } from "../controllers/message.controller";

export const messageRoute = Router()

messageRoute.post('/add', addMessage)
// messageRoute.get('/', getMessage)
