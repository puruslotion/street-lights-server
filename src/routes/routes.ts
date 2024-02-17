import { Router } from "express";
import { messageRoute } from "./message.route";

export const routes = Router()

routes.use('/message', messageRoute)
