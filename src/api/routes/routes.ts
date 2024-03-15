import { Router } from "express";
import { messageRoute } from "./message.route";
import { applicationRoute } from "./application.route";
import { loggerRoute } from "./logger.route";

export const routes = Router()

routes.use('/message', messageRoute);
routes.use('/application', applicationRoute);
routes.use('/logger', loggerRoute);
