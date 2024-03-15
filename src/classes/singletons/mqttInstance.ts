import mqtt from "mqtt";
import config from '../../../config/config.json';
import { ProcessQueue } from '../processQueue';
import { Task } from '../task';
import { Logger } from '../logger/logger';
import { ForegroundColor } from "../../enums/foregroundColor";
import { Collection, MongoClientInstance } from "./mongoClientInstance";
import { Application } from "../../api/controllers/application.controller";

const logger = new Logger();

export class MqttInstance {
    private static _instance: MqttInstance;
    private static _processQueue: ProcessQueue;
    private static _mqttClientMap: Map<string, mqtt.MqttClient>;

    private constructor() {
        logger.info(`Created a MqttInstance`, 'mqtt', 'constructor', ForegroundColor.Green);
    }

    private static async init() {
        const applicationArr = await MongoClientInstance.getInstance().getCollection(Collection.APPLICATIONS).find({}).toArray();

        applicationArr.forEach((value) => {
            const application = new Application(value);
            
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

            mqttClient.on('packetsend', (packet) => {
                logger.debug(packet, 'mqtt', 'packetsend')
            })

            MqttInstance._mqttClientMap.set(application.id, mqttClient);
        })
    }

    public static getInstance() {
        if (!MqttInstance._instance) {
            MqttInstance._instance = new MqttInstance();
            MqttInstance._mqttClientMap = new Map();
            MqttInstance._processQueue = new ProcessQueue();
            MqttInstance.init();
        }

        return MqttInstance._instance;
    }

    public publish(applicationId: string, topic: string, message: string) {
        if (!MqttInstance._mqttClientMap.has(applicationId)) {
            logger.error(`there is no mqtt client with applicationId ${applicationId}`, 'mqtt', 'publish')
        }
        logger.info(`applicationId: ${applicationId}, topic: ${topic}, message: ${message}`, 'mqtt', 'publish');
        MqttInstance._mqttClientMap?.get(applicationId)?.publish(topic, message, (error) => {
            if (error) {
                logger.error(error, 'mqtt', 'publish');
                return;
            }

            logger.info('successfully published to broker', 'mqtt', 'publish');
        });
    }
}
 