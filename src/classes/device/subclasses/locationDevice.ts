import { Logger } from "../../logger/logger";
import { Device } from "../device";

const logger = new Logger();

export class LocationDevice extends Device  {
    public async execute() {
        logger.debug(`${this._topic}`, 'location_device', 'topic');
        logger.debug(`${this._mqttInfo.action}`, 'location_device', 'action');
    }
}
