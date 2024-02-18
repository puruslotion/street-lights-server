import { DownDevice } from "./device/subclasses/downDevice";
import { JoinDevice } from "./device/subclasses/joinDevice";
import { LocationDevice } from "./device/subclasses/locationDevice";
import { ServiceDevice } from "./device/subclasses/serviceDevice";
import { UpDevice } from "./device/subclasses/upDevice";
import { DeviceFactory } from "./factories/deviceFactory";
import { Type } from "../enums/type";
import { RedisInstance } from "./singletons/redisInstance";
import express from "express";
import { MqttInstance } from "./singletons/mqttInstance";
import { routes } from "../routes/routes";
import { Level, Logger } from "./logger/logger";
import { ForegroundColor } from "../enums/foregroundColor";

const logger = new Logger();
Logger.setLevel(Level.DEB);

export class App {
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

        const server = express();
        server.use(express.json());
        server.use('/api/v1', routes)

        server.listen(3000);
    }

    private showHeader() {
        logger.info('============================'.yellow().reset());
        logger.info('Starting StreetLights Server'.yellow().reset());
        logger.info('============================'.yellow().reset());
        logger.info('');
    }

    private initDeviceFactory() {
        logger.info('Initializing DeviceFactory 🏭', 'app', 'initDeviceFactory', ForegroundColor.Cyan);

        DeviceFactory.registerDevice(Type.JOIN, () => new JoinDevice());
        DeviceFactory.registerDevice(Type.UP, () => new UpDevice());
        DeviceFactory.registerDevice(Type.DOWN, () => new DownDevice());
        DeviceFactory.registerDevice(Type.SERVICE, () => new ServiceDevice());
        DeviceFactory.registerDevice(Type.LOCATION, () => new LocationDevice());
    }
}
