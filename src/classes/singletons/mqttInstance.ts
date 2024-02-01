import pino from 'pino';
import mqtt from "mqtt";
import config from '../../../config/config.json';
import { ProcessQueue } from '../processQueue';
import { Task } from '../task';

const logger = pino({
    level: 'debug'
});

export class MqttInstance {
    private static instance: mqtt.MqttClient;
    private static processQueue: ProcessQueue;

    private constructor() {
        logger.info(`Created a RedisInstance`);
    }

    private static init() {
        const brokerUrl = config.mqtt.brokerUrl

        MqttInstance.instance = mqtt.connect(brokerUrl, {
            username: config.mqtt.username,
            password: config.mqtt.password
        })

        MqttInstance.instance.on('connect', () => {
            logger.info(`Connected to MQTT broker with address: ${brokerUrl}`);
            MqttInstance.instance.subscribe('#')
            logger.info(`Subscribed to all topics using: #`);
        })

        MqttInstance.instance.on('disconnect', (ev) => {
            logger.info(`Disconnected from broker: ${ev}`);
        })

        MqttInstance.instance.on('error', (err) => {
            logger.error(`Error: ${err}`);
        })

        MqttInstance.instance.on('message', (topic, payload, packet) => {
            // this is where all the incoming message are handled
            MqttInstance.processQueue.addTask(new Task(topic, payload, packet));
        })
    }

    public static getInstance() {
        if (!MqttInstance.instance) {
            MqttInstance.processQueue = new ProcessQueue();
            MqttInstance.init();
        }

        return MqttInstance.instance;
    }
}
