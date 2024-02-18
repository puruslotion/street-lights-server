import Redis from 'ioredis';
import config from '../../../config/config.json';
import { Logger } from '../logger/logger';
import { ForegroundColor } from '../../enums/foregroundColor';

const logger = new Logger();

export class RedisInstance {
    private static instance: Redis;

    private constructor() {
        logger.info(`Created a RedisInstance`, 'redis', 'constructor');
    }

    private static init() {
        RedisInstance.instance = new Redis({
            host: config.redis.host,
            port: config.redis.port,
            username: config.redis.username,
            password: config.redis.password
        });

        RedisInstance.instance.on('connecting', () => {
            logger.info('Trying to connect to Redis...', 'redis', 'connecting', ForegroundColor.Green);
        })

        RedisInstance.instance.on('connect', () => {
            logger.info(`Redis client is connected to Redis`, 'redis', 'connect', ForegroundColor.Green);
        })

        RedisInstance.instance.on('close', () => {
            logger.warn(`Redis client has disconnected from Redis`, 'redis', 'close', ForegroundColor.Yellow);
        })

        RedisInstance.instance.on('error', (err) => {
            logger.error(err, 'redis', 'error', ForegroundColor.Red);
        })
    }

    public static getInstance() {
        if (!RedisInstance.instance) {
            RedisInstance.init();
        }

        return RedisInstance.instance;
    }
}
