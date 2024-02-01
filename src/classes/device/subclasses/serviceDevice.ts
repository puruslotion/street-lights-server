import pino from "pino";
import { Device } from "../device";

const logger = pino({
    level: 'debug'
});

export class ServiceDevice extends Device  {
    public async execute() {
        logger.debug('ServiceDevice execute()');
        logger.debug(`Topic: ${this._topic}`);
        logger.debug(`Action: ${this._mqttInfo.action}`);
    }
}
