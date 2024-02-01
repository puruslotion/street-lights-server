import { DownDevice } from "./device/subclasses/downDevice";
import { JoinDevice } from "./device/subclasses/joinDevice";
import { LocationDevice } from "./device/subclasses/locationDevice";
import { ServiceDevice } from "./device/subclasses/serviceDevice";
import { UpDevice } from "./device/subclasses/upDevice";
import { DeviceFactory } from "./factories/deviceFactory";
import config from '../../config/config.json';
import mqtt from "mqtt";
import { Task } from "./task";
import pino from "pino";
import { ProcessQueue } from "./processQueue";
import { Type } from "../enums/type";
import { RedisInstance } from "./singletons/redisInstance";
import express from "express";
import { MqttInstance } from "./singletons/mqttInstance";

const logger = pino({
    level: 'debug'
});

export class App {
    // private _mqttClient!: mqtt.MqttClient;
    // private _processQueue!: ProcessQueue;

    public async run() {
        this.init();
    }

    private init() {
        this.showHeader();
        
        // init Redis
        RedisInstance.getInstance();

        // init Mqtt
        MqttInstance.getInstance();

        // order does matter
        this.initDeviceFactory();
        //this._processQueue = new ProcessQueue();
        //this.initMqttClient();

        const server = express();
        server.use(express.json());

        server.get('/', (req, res) => {
            res.send('Hello world');
        });

        server.post('/api/addmessage', async (req, res) => {
            const jsonData = req.body;

            if (!jsonData?.id || !jsonData?.message) {
                res.send('Error');
                return
            }

            const result = await RedisInstance.getInstance().get(jsonData.id);

            if (!result) {
                const messages: string[] = []
                messages.push(jsonData.message);

                RedisInstance.getInstance().set(jsonData.id, JSON.stringify({messages: messages}));
            } else {
                const obj = JSON.parse(result);
                const messages = obj.messages as string[];
                messages.push(jsonData.message);

                RedisInstance.getInstance().set(jsonData.id, JSON.stringify({messages: messages}));
            }

            // console.log(jsonData);

            res.send('Ok');
        });

        server.listen(3000);
    }

    private showHeader() {
        logger.info('============================');
        logger.info('Starting StreetLights Server');
        logger.info('============================');
        logger.info('');
    }

    private initDeviceFactory() {
        logger.info('Initializing DeviceFactory');

        DeviceFactory.registerDevice(Type.JOIN, () => new JoinDevice());
        DeviceFactory.registerDevice(Type.UP, () => new UpDevice());
        DeviceFactory.registerDevice(Type.DOWN, () => new DownDevice());
        DeviceFactory.registerDevice(Type.SERVICE, () => new ServiceDevice());
        DeviceFactory.registerDevice(Type.LOCATION, () => new LocationDevice());
    }

    // private initMqttClient() {
    //     logger.info('Initializing MqttClient');

    //     const brokerUrl = config.mqtt.brokerUrl
        
    //     this._mqttClient = mqtt.connect(brokerUrl, {
    //         username: config.mqtt.username,
    //         password: config.mqtt.password
    //     })

    //     this._mqttClient.on('connect', () => {
    //         logger.info(`Connected to MQTT broker with address: ${brokerUrl}`);
    //         this._mqttClient.subscribe('#')
    //         logger.info(`Subscribed to all topics using: #`);
    //     })

    //     this._mqttClient.on('disconnect', (ev) => {
    //         logger.info(`Disconnected from broker: ${ev}`);
    //     })

    //     this._mqttClient.on('error', (err) => {
    //         logger.error(`Error: ${err}`);
    //     })

    //     this._mqttClient.on('message', (topic, payload, packet) => {
    //         // this is where all the incoming message are handled
    //         this._processQueue.addTask(new Task(topic, payload, packet));
    //     })
    // }
}
