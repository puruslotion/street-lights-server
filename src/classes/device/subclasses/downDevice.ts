// import pino from "pino";
import { Logger } from "../../logger/logger";
import { Device } from "../device";

const logger = new Logger();

export class DownDevice extends Device  {
    public async execute() {
        logger.debug(`${this._topic}`, 'downdevice', 'topic');
        logger.debug(`${this._mqttInfo.action}`, 'downdevice', 'action');
    }
}
