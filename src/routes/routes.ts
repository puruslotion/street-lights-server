import { Router } from "express";
import { messageRoute } from "./message.route";
import { applicationRoute } from "./application.route";

export const routes = Router()

routes.use('/message', messageRoute);
routes.use('/application', applicationRoute);
