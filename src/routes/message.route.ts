import { Router } from "express";
import { addMessage, getMessage } from "../controllers/message.controller";

export const messageRoute = Router()

messageRoute.post('/add', addMessage)
messageRoute.get('/', getMessage)
