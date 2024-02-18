import { Logger } from '../../logger/logger';
import {Device} from '../device';

const logger = new Logger();


export class JoinDevice extends Device  {
    public async execute() {
        logger.debug('JoinDevice execute()');
        logger.debug(`Topic: ${this._topic}`);
        logger.debug(`Action: ${this._mqttInfo.action}`);
    }
}
