import mqtt from "mqtt";
import config from '../../../config/config.json';
import { ProcessQueue } from '../processQueue';
import { Task } from '../task';
import { Logger } from '../logger/logger';
import { ForegroundColor } from "../../enums/foregroundColor";

const logger = new Logger();

export class MqttInstance {
    private static instance: mqtt.MqttClient;
    private static processQueue: ProcessQueue;

    private constructor() {
        logger.info(`Created a MqttInstance`, 'mqtt', 'constructor', ForegroundColor.Green);
    }

    private static init() {
        const brokerUrl = config.mqtt.brokerUrl

        MqttInstance.instance = mqtt.connect(brokerUrl, {
            username: config.mqtt.username,
            password: config.mqtt.password
        })

        MqttInstance.instance.on('connect', () => {
            logger.info(`Connected to MQTT broker with address: ${brokerUrl}`, 'mqtt', 'connect', ForegroundColor.Green);
            MqttInstance.instance.subscribe('#')
            logger.info(`Subscribed to all topics using: #`, 'mqtt', 'subscribe', ForegroundColor.Green);
        })

        MqttInstance.instance.on('disconnect', (ev) => {
            logger.warn(`Disconnected from broker: ${ev}`, 'mqtt', 'disconnect', ForegroundColor.Yellow);
        })

        MqttInstance.instance.on('error', (err) => {
            logger.error(`Error: ${err}`, 'mqtt', 'error', ForegroundColor.Red);
        })

        MqttInstance.instance.on('message', (topic, payload, packet) => {
            // this is where all the incoming message are handled
            logger.debug(topic, 'mqtt', 'topic', ForegroundColor.Green);
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
