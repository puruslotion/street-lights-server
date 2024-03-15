import { Db, MongoClient, OptionalId } from "mongodb";
import { Logger } from "../logger/logger";
import { ForegroundColor } from "../../enums/foregroundColor";
import config from '../../../config/config.json';

const logger = new Logger();

export enum Collection {
    APPLICATIONS = 'applications',
    END_DEVICES = 'end_devices'
}

export class MongoClientInstance {
    private static _instance: MongoClientInstance;
    private static _client: MongoClient;
    private static _database: Db;

    private constructor() {
        logger.info(`Create a MongoClientInstance`, 'mongoclient', 'constructor', ForegroundColor.Green);
    }

    private static init() {

        const connectionString = `mongodb://${config.mongo.username}:${config.mongo.password}@${config.mongo.host}:${config.mongo.port}`;
        MongoClientInstance._client = new MongoClient(connectionString, {connectTimeoutMS: 1000});
        MongoClientInstance._database = MongoClientInstance._client.db('street_lights_server');

        MongoClientInstance._client.addListener('timeout', () => {
            logger.error('timeout', 'mongo', 'connection');
            process.exit(1);
        })

        MongoClientInstance._client.addListener('error', (error) => {
            logger.error(error, 'mongo', 'error');
            process.exit(1);
        })
    }

    public static getInstance() {
        if (!MongoClientInstance._instance) {
            MongoClientInstance.init();
        }

        return MongoClientInstance._instance;
    }

    public static getCollection(collection: Collection) {
        return MongoClientInstance._database.collection(collection);
    }
}
