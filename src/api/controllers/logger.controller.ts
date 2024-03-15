import { Level, Logger } from "../../classes/logger/logger";
import { Request, Response } from 'express';
import { ResponseMessage } from "../../classes/responseMessage";

const logger = new Logger();

class LogLevel {
    public level = 0;
}

const changeLevel = async (req: Request, res: Response) => {
    const logLevel: LogLevel = req.body;

    switch (logLevel.level) {
        case Level.DEB: Logger.setLevel(Level.DEB);
            break;
        case Level.INF: Logger.setLevel(Level.INF);
            break
        case Level.WAR: Logger.setLevel(Level.WAR);
            break;
        case Level.ERR: Logger.setLevel(Level.ERR);
            break;
        case Level.FAT: Logger.setLevel(Level.FAT);
            break;
        default:
            return res.status(400).send(new ResponseMessage(`${logLevel.level} is not a valid log level`, 400));
    }

    res.status(200).send(new ResponseMessage(`log level has been changed to ${logLevel.level}`, 200));
}

export { changeLevel }
