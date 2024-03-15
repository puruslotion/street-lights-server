import Redis from 'ioredis';
import config from '../../../config/config.json';
import { Logger } from '../logger/logger';
import { ForegroundColor } from '../../enums/foregroundColor';
import { BackgroundColor } from '../../enums/backgroundColor';

const logger = new Logger();

export class RedisInstance {
	private static _instance: RedisInstance;
	private static _redis: Redis;

	private constructor() {
		logger.info(`Created a RedisInstance`, 'redis', 'constructor');
	}

	public async init() {
		return new Promise((resolve) => {
			RedisInstance._redis = new Redis({
				host: config.redis.host,
				port: config.redis.port,
				username: config.redis.username,
				password: config.redis.password,
			});

			RedisInstance._redis.on('connecting', () => {
				logger.info(
					'Trying to connect to Redis...',
					'redis',
					'connecting',
					ForegroundColor.Green,
				);
			});

			RedisInstance._redis.on('connect', () => {
				logger.info(
					`Redis client is connected to Redis`,
					'redis',
					'connect',
					BackgroundColor.Cyan,
				);
				resolve(true);
			});

			RedisInstance._redis.on('close', () => {
				logger.warn(
					`Redis client has disconnected from Redis`,
					'redis',
					'close',
					ForegroundColor.Yellow,
				);
			});

			RedisInstance._redis.on('error', (err) => {
				logger.error(err, 'redis', 'error', ForegroundColor.Red);
			});
		});
	}

	public static getInstance() {
		if (!RedisInstance._instance) {
			RedisInstance._instance = new RedisInstance();
		}

		return RedisInstance._instance;
	}

	public redis() {
		return RedisInstance._redis;
	}
}
