import 'dotenv/config';
import { DownDevice } from './device/subclasses/downDevice';
import { JoinDevice } from './device/subclasses/joinDevice';
import { LocationDevice } from './device/subclasses/locationDevice';
import { ServiceDevice } from './device/subclasses/serviceDevice';
import { EndDevice, UpDevice } from './device/subclasses/upDevice';
import { DeviceFactory } from './factories/deviceFactory';
import { Type } from '../enums/type';
import { RedisInstance } from './singletons/redisInstance';
import express from 'express';
import cors from 'cors';
import { MqttInstance } from './singletons/mqttInstance';
import { routes } from '../api/routes/routes';
import { Logger } from './logger/logger';
import { ForegroundColor } from '../enums/foregroundColor';
import {
	Collection,
	MongoClientInstance,
} from './singletons/mongoClientInstance';
import { REDIS_KEY } from '../enums/redisKey';
import { Role, User } from '../db/user';
import { Helper } from './helper';
import { BackgroundColor } from '../enums/backgroundColor';

const logger = new Logger();

export class App {
	public async run() {
		await this.init();
	}

	private async init() {
		this.showHeader();

		// init MongoDb
		await MongoClientInstance.getInstance().init();

		// creating first user
		await this.creatingFirstUser();

		// // init Redis
		await RedisInstance.getInstance().init();

		// adding end devices to redis
		await this.addingDevicesToRedis();

		// init Mqtt
		MqttInstance.getInstance();

		// order does matter
		this.initDeviceFactory();

		// express server
		this.initExpressServer();
	}

	private initExpressServer() {
		const server = express();

		// middleware
		server.use(
			cors({
				origin: ['http://localhost:5173', 'http://localhost:4173'],
				credentials: true,
			}),
		);
		server.use(express.json());
		server.use(express.urlencoded({ extended: true }));
		server.use('/api/v1', routes);

		server.listen(3000, () => {
			logger.info(3000, 'server', 'port');
		});
	}

	private async addingDevicesToRedis() {
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
	}

	private async creatingFirstUser() {
		if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) return;

		const collectionNames =
			await MongoClientInstance.getInstance().getCollectionNames();
		logger.info(collectionNames, 'mongo', 'collection_name');
		const result = collectionNames.includes(Collection.USERS);

		logger.info(
			`Does ${Collection.USERS} exist: ${result}`,
			'mongo',
			'collection_name',
		);

		// if the collection already exists then it must mean that there are already users created
		if (result) return;

		const user = new User({
			username: process.env.ADMIN_USERNAME,
			password: await Helper.hashPassword(process.env.ADMIN_PASSWORD),
			roles: Object.values(Role),
		});

		logger.info(user, 'mongo', 'create_first_user', BackgroundColor.Magenta);

		await MongoClientInstance.getInstance()
			.getCollection(Collection.USERS)
			.insertOne(user);
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
