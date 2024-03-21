import { Device } from '../device';
import { Helper } from '../../helper';
import { UplinkMessageTtn } from '../../ttn/uplinkMessageTtn';
import { RedisInstance } from '../../singletons/redisInstance';
import { Downlink, DownlinkMessageTtn } from '../../ttn/downlinkMessageTtn';
import { MqttInstance } from '../../singletons/mqttInstance';
import { Logger } from '../../logger/logger';
import { REDIS_KEY } from '../../../enums/redisKey';
import {
	Collection,
	MongoClientInstance,
} from '../../singletons/mongoClientInstance';
import { BackgroundColor } from '../../../enums/backgroundColor';
import { Message } from '../../../redis/message';

const logger = new Logger();

export class EndDevice {
	public id = '';
	public applicationId = '';
}

export class UpDevice extends Device {
	public async execute() {
		logger.debug(`${this._topic}`, 'up_device', 'topic');
		logger.debug(`${this._mqttInfo.action}`, 'up_device', 'action');

		const json = JSON.parse(Helper.bytesToString(this._payload));
		const uplinkMessageTtn = new UplinkMessageTtn(json);

		logger.debug(
			`${uplinkMessageTtn.uplinkMessage.frmPayload}`,
			'up_device',
			'message',
		);

		await this.checkingIfDownlinkMessageShouldBeSent();
		this.checkIfEndDeviceInDb();
	}

	private async shouldAddToRedis(endDevice: object) {
		const redisKey = `${REDIS_KEY.END_DEVICE}${this._mqttInfo.endDeviceId}`;
		const result = await RedisInstance.getInstance().redis().get(redisKey);

		if (result) return;

		const res = await RedisInstance.getInstance()
			.redis()
			.set(
				`${REDIS_KEY.END_DEVICE}${this._mqttInfo.endDeviceId}`,
				JSON.stringify(endDevice),
			);

		if (res) {
			logger.info(
				`added end device with id ${this._mqttInfo.endDeviceId.cyan().reset()} to Redis`,
				'redis',
				'set',
			);
		} else {
			logger.error(
				`failed to add end device with id ${this._mqttInfo.endDeviceId.cyan().reset()} to Redis`,
				'redis',
				'set',
			);
		}
	}

	private async checkIfEndDeviceInDb() {
		const findResult = await MongoClientInstance.getInstance()
			.getCollection(Collection.END_DEVICES)
			.findOne({ id: this._mqttInfo.endDeviceId });
		const endDevice = {
			id: this._mqttInfo.endDeviceId,
			applicationId: this._mqttInfo.applicationId,
		};

		if (findResult?._id) {
			const lastSeen = Date.now();
			await MongoClientInstance.getInstance()
				.getCollection(Collection.END_DEVICES)
				.updateOne(
					{ id: this._mqttInfo.endDeviceId },
					{ $set: { lastSeen: lastSeen } },
				);
			await this.shouldAddToRedis(endDevice);
			return;
		}

		const insertResult = await MongoClientInstance.getInstance()
			.getCollection(Collection.END_DEVICES)
			.insertOne(endDevice);

		if (!insertResult.acknowledged) {
			logger.error(
				`Failed to add to end device with id ${this._mqttInfo.endDeviceId.cyan().reset()} to database`,
				'mongo',
				'insert',
				BackgroundColor.Red
			);
			return;
		}

		logger.info(
			`added end device with id ${this._mqttInfo.endDeviceId.cyan().reset()} to database`,
			'mongo',
			'insert',
			BackgroundColor.Green
		);

		await this.shouldAddToRedis(endDevice);
	}

	private async checkingIfDownlinkMessageShouldBeSent() {
		const redisKey = `${REDIS_KEY.ADD_MESSAGE}${this._mqttInfo.endDeviceId}`;
		const result = await RedisInstance.getInstance().redis().get(redisKey);

		if (!result) return;

		const messages = JSON.parse(result).messages as Message[];
		logger.debug(messages, 'up_device', 'redis', BackgroundColor.Red);
		const message = messages.shift();

		if (!message) return;

		const downlinkMessage = new DownlinkMessageTtn('');
		const downlink = new Downlink('');
		downlink.confirmed = true;
		downlink.priority = 'HIGH';
		downlink.fPort = 10;
		downlink.frmPayload = Helper.stringToBase64(
			message?.payload ?? 'no content',
		);
		downlinkMessage.downlinks.push(downlink);

		logger.info(result, 'up_device', 'redis_queue');

		MqttInstance.getInstance().publish(
			this._mqttInfo.applicationId,
			`${this._mqttInfo.version}/${this._mqttInfo.applicationId}@${this._mqttInfo.tentantID}/${this._mqttInfo.devices}/${this._mqttInfo.endDeviceId}/down/push`,
			JSON.stringify(downlinkMessage),
		);
	}
}
