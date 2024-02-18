import { Device } from "../device";
import { Logger } from "../../logger/logger";

const logger = new Logger();

export class ServiceDevice extends Device  {
    public async execute() {
        logger.debug('ServiceDevice execute()');
        logger.debug(`Topic: ${this._topic}`);
        logger.debug(`Action: ${this._mqttInfo.action}`);
    }
}
