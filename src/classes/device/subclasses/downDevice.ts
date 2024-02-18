// import pino from "pino";
import { Logger } from "../../logger/logger";
import { Device } from "../device";

const logger = new Logger();

export class DownDevice extends Device  {
    public async execute() {
        logger.debug('DownDevice execute()');
        logger.debug(`Topic: ${this._topic}`);
        logger.debug(`Action: ${this._mqttInfo.action}`);
    }
}
