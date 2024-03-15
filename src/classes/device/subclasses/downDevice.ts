// import pino from "pino";
import { Message } from '../../../api/controllers/message.controller';
import { Action } from '../../../enums/action';
import { BackgroundColor } from '../../../enums/backgroundColor';
import { REDIS_KEY } from '../../../enums/redisKey';
import { Logger } from '../../logger/logger';
import { RedisInstance } from '../../singletons/redisInstance';
import { Device } from '../device';

const logger = new Logger();

export class DownDevice extends Device {
	public async execute() {
		logger.debug(`${this._topic}`, 'down_device', 'topic');
		logger.debug(`${this._mqttInfo.action}`, 'down_device', 'action');

		if (this._mqttInfo.action.toLowerCase() === Action.ACK) {
			logger.info(
				'Remove message from Redis queue!!'.red().reset(),
				'down_device',
				Action.ACK,
			);

			await this.removeFromRedisQueue();
		}
	}

	private async removeFromRedisQueue() {
		const redisKey = `${REDIS_KEY.ADD_MESSAGE}${this._mqttInfo.endDeviceId}`;
		const result = await RedisInstance.getInstance().redis().get(redisKey);

		if (!result) return;

		const messages = JSON.parse(result).messages as Message[];
		logger.debug(messages, 'down_device', 'redis', BackgroundColor.Red);

		const message = messages.shift();

		if (!message) return;

		if (messages.length === 0) {
			const res = await RedisInstance.getInstance().redis().del(redisKey);

			if (res === 1) {
				logger.info(`Key ${redisKey} deleted successfully.`, 'redis', 'delete');
			} else {
				logger.info(`Key ${redisKey} does not exist.`, 'redis', 'delete');
			}
		} else {
			RedisInstance.getInstance()
				.redis()
				.set(redisKey, JSON.stringify({ messages: messages }));
		}
	}
}
