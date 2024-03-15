import { Logger } from '../../logger/logger';
import {Device} from '../device';

const logger = new Logger();


export class JoinDevice extends Device  {
    public async execute() {
        logger.debug(`${this._topic}`, 'join_device', 'topic');
        logger.debug(`${this._mqttInfo.action}`, 'join_device', 'action');
    }
}
