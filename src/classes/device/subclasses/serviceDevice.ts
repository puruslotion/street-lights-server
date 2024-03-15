import { Device } from '../device';
import { Logger } from '../../logger/logger';

const logger = new Logger();

export class ServiceDevice extends Device {
	public async execute() {
		logger.debug(`${this._topic}`, 'service_device', 'topic');
		logger.debug(`${this._mqttInfo.action}`, 'service_device', 'action');
	}
}
