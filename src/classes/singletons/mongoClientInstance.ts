import { Db, MongoClient } from 'mongodb';
import { Logger } from '../logger/logger';
import { ForegroundColor } from '../../enums/foregroundColor';
import config from '../../../config/config.json';
import { BackgroundColor } from '../../enums/backgroundColor';

const logger = new Logger();

export enum Collection {
	APPLICATIONS = 'applications',
	END_DEVICES = 'end_devices',
	USERS = 'users',
	LOGS = 'logs',
}

export class MongoClientInstance {
	private static _instance: MongoClientInstance;
	private static _client: MongoClient;
	private static _database: Db;

	private constructor() {
		logger.info(
			`Create a MongoClientInstance`,
			'mongoclient',
			'constructor',
			ForegroundColor.Green,
		);
	}

	public async init() {
		const connectionString = `mongodb://${config.mongo.username}:${config.mongo.password}@${config.mongo.host}:${config.mongo.port}`;
		MongoClientInstance._client = new MongoClient(connectionString, {
			connectTimeoutMS: 1000,
		});
		MongoClientInstance._database = MongoClientInstance._client.db(
			'street_lights_server',
		);

		MongoClientInstance._client.addListener('timeout', () => {
			logger.fatal('timeout', 'mongo', 'connection');
			process.exit(1);
		});

		MongoClientInstance._client.addListener('error', (error) => {
			logger.fatal(error, 'mongo', 'error');
			process.exit(1);
		});

		await MongoClientInstance._instance.connect();

		Object.values(Collection).forEach(async (v) => {
			await MongoClientInstance.getInstance()
				.getCollection(v)
				.createIndex({ id: 1 });
		});

		const result = await MongoClientInstance._instance.ping();

		logger.info(result, 'mongo', 'ping');
		logger.info('connected', 'mongo', 'connect', BackgroundColor.Cyan);

		return result;
	}

	public static getInstance() {
		if (!MongoClientInstance._instance) {
			MongoClientInstance._instance = new MongoClientInstance();
			//MongoClientInstance.init();
		}

		return MongoClientInstance._instance;
	}

	public getType(collection: Collection) {
		switch (collection) {
			case Collection.APPLICATIONS:
			case Collection.END_DEVICES:
			case Collection.LOGS:
			case Collection.USERS:
		}
	}

	public async getCollectionNames() {
		return (
			await MongoClientInstance._database.listCollections().toArray()
		).map((c) => c.name);
	}

	public getCollection(collection: Collection) {
		return MongoClientInstance._database.collection(collection);
	}

	private async connect() {
		return await MongoClientInstance._client.connect();
	}

	private async ping() {
		return await MongoClientInstance._database.command({ ping: 1 });
	}
}
