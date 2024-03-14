import mqtt from "mqtt";
import config from '../../../config/config.json';
import { ProcessQueue } from '../processQueue';
import { Task } from '../task';
import { Logger } from '../logger/logger';
import { ForegroundColor } from "../../enums/foregroundColor";
import { Collection, MongoClientInstance } from "./mongoClientInstance";
import { Application } from "../../controllers/application.controller";

const logger = new Logger();

export class MqttInstance {
    private static _instance: MqttInstance;
    private static _processQueue: ProcessQueue;
    private static _mqttClientMap: Map<string, mqtt.MqttClient>;

    private constructor() {
        logger.info(`Created a MqttInstance`, 'mqtt', 'constructor', ForegroundColor.Green);
    }

    private static async init() {
        const applicationArr = await MongoClientInstance.getCollection(Collection.APPLICATIONS).find({}).toArray();

        applicationArr.forEach((value) => {
            const application = value as unknown as Application;
            
            const mqttClient = mqtt.connect(application.mqttBrokerUrl, {
                username: application.id,
                password: application.token
            })

            mqttClient.on('connect', () => {
                logger.info(`Connected to MQTT broker with address: ${application.mqttBrokerUrl}`, 'mqtt', 'connect', ForegroundColor.Green);
                mqttClient.subscribe('#')
                logger.info(`Subscribed to all topics using: #`, 'mqtt', 'subscribe', ForegroundColor.Green);
            })

            mqttClient.on('disconnect', (ev) => {
                logger.warn(`Disconnected from broker: ${ev}`, 'mqtt', 'disconnect', ForegroundColor.Yellow);
            })

            mqttClient.on('error', (err) => {
                logger.error(`Error: ${err}`, 'mqtt', 'error', ForegroundColor.Red);
            })

            mqttClient.on('message', (topic, payload, packet) => {
                // this is where all the incoming message are handled
                logger.debug(topic, 'mqtt', 'topic', ForegroundColor.Green);
                MqttInstance._processQueue.addTask(new Task(topic, payload, packet));
            })

            MqttInstance._mqttClientMap.set(application.id, mqttClient);
        })

        // const brokerUrl = config.mqtt.brokerUrl

        // MqttInstance._instance = mqtt.connect(brokerUrl, {
        //     username: config.mqtt.username,
        //     password: config.mqtt.password
        // })

        // MqttInstance._instance.on('connect', () => {
        //     logger.info(`Connected to MQTT broker with address: ${brokerUrl}`, 'mqtt', 'connect', ForegroundColor.Green);
        //     MqttInstance._instance.subscribe('#')
        //     logger.info(`Subscribed to all topics using: #`, 'mqtt', 'subscribe', ForegroundColor.Green);
        // })

        // MqttInstance._instance.on('disconnect', (ev) => {
        //     logger.warn(`Disconnected from broker: ${ev}`, 'mqtt', 'disconnect', ForegroundColor.Yellow);
        // })

        // MqttInstance._instance.on('error', (err) => {
        //     logger.error(`Error: ${err}`, 'mqtt', 'error', ForegroundColor.Red);
        // })

        // MqttInstance._instance.on('message', (topic, payload, packet) => {
        //     // this is where all the incoming message are handled
        //     logger.debug(topic, 'mqtt', 'topic', ForegroundColor.Green);
        //     MqttInstance._processQueue.addTask(new Task(topic, payload, packet));
        // })
    }

    public static getInstance() {
        if (!MqttInstance._instance) {
            MqttInstance._mqttClientMap = new Map();
            MqttInstance._processQueue = new ProcessQueue();
            MqttInstance.init();
        }

        return MqttInstance._instance;
    }

    public publish(mqttClientUsername: string, topic: string, message: string) {
        MqttInstance._mqttClientMap.get(mqttClientUsername)?.publish(topic, message);
    }
}
