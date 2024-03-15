import { Router } from "express";
import { changeLevel } from "../controllers/logger.controller";

export const loggerRoute = Router()

loggerRoute.patch('/level', changeLevel);
