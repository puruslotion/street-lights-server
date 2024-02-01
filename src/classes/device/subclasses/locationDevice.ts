import pino from "pino";
import { Device } from "../device";

const logger = pino({
    level: 'debug'
});

export class LocationDevice extends Device  {
    public async execute() {
        logger.debug('LocationDevice execute()');
        logger.debug(`Topic: ${this._topic}`);
        logger.debug(`Action: ${this._mqttInfo.action}`);
    }
}
