import Redis from 'ioredis';
import pino from 'pino';
import config from '../../../config/config.json';

const logger = pino({
    level: 'debug'
});

export class RedisInstance {
    private static instance: Redis;

    private constructor() {
        logger.info(`Created a RedisInstance`);
    }

    private static init() {
        RedisInstance.instance = new Redis({
            host: config.redis.host,
            port: config.redis.port,
            username: config.redis.username,
            password: config.redis.password
        });

        RedisInstance.instance.on('connecting', () => {
            logger.info('Trying to connect to Redis...');
        })

        RedisInstance.instance.on('connect', () => {
            logger.info(`Redis client is connected to Redis`);
        })

        RedisInstance.instance.on('close', () => {
            logger.info(`Redis client has disconnected from Redis`);
        })
    }

    public static getInstance() {
        if (!RedisInstance.instance) {
            RedisInstance.init();
        }

        return RedisInstance.instance;
    }
}
