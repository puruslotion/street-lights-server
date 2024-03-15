import { Device } from "../device";
import { Helper } from "../../helper";
import { UplinkMessageTtn } from "../../ttn/uplinkMessageTtn";
import { RedisInstance } from "../../singletons/redisInstance";
import { Downlink, DownlinkMessageTtn } from "../../ttn/downlinkMessageTtn";
import { MqttInstance } from "../../singletons/mqttInstance";
import { Logger } from "../../logger/logger";
import { Message } from "../../../controllers/message.controller";
import { REDIS_KEY } from "../../../enums/redisKey";
import { Collection, MongoClientInstance } from "../../singletons/mongoClientInstance";
import { BackgroundColor } from "../../../enums/backgroundColor";

const logger = new Logger();

export class EndDevice {
    public id = "";
    public applicationId = "";
}

export class UpDevice extends Device  {
    public async execute() {
        logger.debug(`${this._topic}`, 'updevice', 'topic');
        logger.debug(`${this._mqttInfo.action}`, 'updevice', 'action');

        const json = JSON.parse(Helper.bytesToString(this._payload));
        const uplinkMessageTtn = new UplinkMessageTtn(json);

        logger.debug(`${uplinkMessageTtn.uplinkMessage.frmPayload}`, 'updevice', 'message');

        await this.checkIfEndDeviceInDb();
        await this.checkingIfDownlinkMessageShouldBeSent();
    }

    private async shouldAddToRedis(endDevice: object) {
        const res = await RedisInstance.getInstance().set(`${REDIS_KEY.END_DEVICE}${this._mqttInfo.endDeviceId}`, JSON.stringify(endDevice));

        if (res) {
            logger.info(`added end device with id ${this._mqttInfo.endDeviceId.cyan().reset()} to Redis`, 'redis', 'set');
        } else {
            logger.error(`failed to add end device with id ${this._mqttInfo.endDeviceId.cyan().reset()} to Redis`, 'redis', 'set')
        }
    }

    private async checkIfEndDeviceInDb() {
        const redisKey = `${REDIS_KEY.END_DEVICE}${this._mqttInfo.endDeviceId}`;
        const result = await RedisInstance.getInstance().get(redisKey);

        if (result) return;

        logger.info(`end device with id ${this._mqttInfo.endDeviceId.cyan().reset()} is not in Redis`, 'redis', 'get');

        const findResult = await MongoClientInstance.getCollection(Collection.END_DEVICES).findOne({id: this._mqttInfo.endDeviceId});
        const endDevice = {
            id: this._mqttInfo.endDeviceId,
            applicationId: this._mqttInfo.applicationId
        }

        if (findResult?._id) {
            await this.shouldAddToRedis(endDevice);
            return;
        }

        const insertResult = await MongoClientInstance.getCollection(Collection.END_DEVICES).insertOne(endDevice);

        if (!insertResult.acknowledged) {
            logger.error(`Failed to add to end device with id ${this._mqttInfo.endDeviceId.cyan().reset()} to database`, 'mongo', 'insert');
            return;
        }

        logger.info(`added end device with id ${this._mqttInfo.endDeviceId.cyan().reset()} to database`, 'mongo', 'insert');

        await this.shouldAddToRedis(endDevice);
    }

    private async checkingIfDownlinkMessageShouldBeSent() {
        const redisKey = `${REDIS_KEY.ADD_MESSAGE}${this._mqttInfo.endDeviceId}`;
        const result = await RedisInstance.getInstance().get(redisKey);

        if (!result) return;

        const messages = JSON.parse(result).messages as Message[];
        logger.debug(messages, 'redis', 'updevice', BackgroundColor.Red);
        const message = messages.shift();

        if (!message) return;

        const downlinkMessage = new DownlinkMessageTtn("");
        const downlink = new Downlink("");
        downlink.confirmed = true;
        downlink.priority = 'HIGH';
        downlink.fPort = 10;
        downlink.frmPayload = Helper.stringToBase64(message?.payload ?? 'no content');
        downlinkMessage.downlinks.push(downlink);

        logger.info(result, 'updevice', 'redis_queue');

        MqttInstance.publish(this._mqttInfo.applicationId, `${this._mqttInfo.version}/${this._mqttInfo.applicationId}@${this._mqttInfo.tentantID}/${this._mqttInfo.devices}/${this._mqttInfo.endDeviceId}/down/push`,JSON.stringify(downlinkMessage));
    }
}
