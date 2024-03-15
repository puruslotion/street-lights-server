import { DownDevice } from './device/subclasses/downDevice';
import { JoinDevice } from './device/subclasses/joinDevice';
import { LocationDevice } from './device/subclasses/locationDevice';
import { ServiceDevice } from './device/subclasses/serviceDevice';
import { EndDevice, UpDevice } from './device/subclasses/upDevice';
import { DeviceFactory } from './factories/deviceFactory';
import { Type } from '../enums/type';
import { RedisInstance } from './singletons/redisInstance';
import express from 'express';
import { MqttInstance } from './singletons/mqttInstance';
import { routes } from '../api/routes/routes';
import { Logger } from './logger/logger';
import { ForegroundColor } from '../enums/foregroundColor';
import {
	Collection,
	MongoClientInstance,
} from './singletons/mongoClientInstance';
import { REDIS_KEY } from '../enums/redisKey';

const logger = new Logger();

export class App {
	public async run() {
		await this.init();
	}

	private async init() {
		this.showHeader();

		// init MongoDb
		await MongoClientInstance.getInstance().init();

		// // init Redis
		await RedisInstance.getInstance().init();

		// adding end devices to redis
		(
			await MongoClientInstance.getInstance()
				.getCollection(Collection.END_DEVICES)
				.find({})
				.toArray()
		).forEach((value) => {
			const endDevice = value as unknown as EndDevice;

			RedisInstance.getInstance()
				.redis()
				.set(
					`${REDIS_KEY.END_DEVICE}${endDevice.id}`,
					JSON.stringify(endDevice),
				);
		});

		// init Mqtt
		MqttInstance.getInstance();

		// order does matter
		this.initDeviceFactory();

		const server = express();
		server.use(express.json());
		server.use('/api/v1', routes);

		server.listen(3000, () => {
			logger.info(3000, 'server', 'port');
		});
	}

	private showHeader() {
		logger.info('============================'.yellow().reset());
		logger.info('Starting StreetLights Server'.yellow().reset());
		logger.info('============================'.yellow().reset());
		logger.info('');
	}

	private initDeviceFactory() {
		logger.info(
			'Initializing DeviceFactory 🏭',
			'app',
			'initDeviceFactory',
			ForegroundColor.Cyan,
		);

		DeviceFactory.registerDevice(Type.JOIN, () => new JoinDevice());
		DeviceFactory.registerDevice(Type.UP, () => new UpDevice());
		DeviceFactory.registerDevice(Type.DOWN, () => new DownDevice());
		DeviceFactory.registerDevice(Type.SERVICE, () => new ServiceDevice());
		DeviceFactory.registerDevice(Type.LOCATION, () => new LocationDevice());
	}
}
