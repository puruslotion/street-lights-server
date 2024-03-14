import { Device } from "../device";
import { Helper } from "../../helper";
import { UplinkMessageTtn } from "../../ttn/uplinkMessageTtn";
import { RedisInstance } from "../../singletons/redisInstance";
import { Downlink, DownlinkMessageTtn } from "../../ttn/downlinkMessageTtn";
import { MqttInstance } from "../../singletons/mqttInstance";
import { Logger } from "../../logger/logger";
import { Message } from "../../../controllers/message.controller";

const logger = new Logger();

export class UpDevice extends Device  {
    public async execute() {
        logger.debug(`${this._topic}`, 'updevice', 'topic');
        logger.debug(`${this._mqttInfo.action}`, 'updevice', 'action');

        const json = JSON.parse(Helper.bytesToString(this._payload));
        const uplinkMessageTtn = new UplinkMessageTtn(json);

        logger.debug(`${uplinkMessageTtn.uplinkMessage.frmPayload}`, 'updevice', 'message');

        await this.checkingIfDownlinkMessageShouldBeSent();
    }

    private async checkingIfDownlinkMessageShouldBeSent() {
        const result = await RedisInstance.getInstance().get(this._mqttInfo.endDeviceId);

        if (!result) return;

        const messages = JSON.parse(result).messages as Message[];
        const message = messages.shift();

        if (!message) return;

        const downlinkMessage = new DownlinkMessageTtn("");
        const downlink = new Downlink("");
        downlink.confirmed = false;
        downlink.priority = 'HIGH';
        downlink.fPort = 10;
        downlink.frmPayload = Helper.stringToBase64(message?.payload ?? 'no content');
        downlinkMessage.downlinks.push(downlink);

        logger.info(result, 'updevice', 'redis_queue');

        MqttInstance.publish(message.applicationId, `v3/${message?.applicationId}@ttn/devices/${this._mqttInfo.endDeviceId}/down/push`,JSON.stringify(downlinkMessage));

        if (messages.length === 0) {
            const res = await RedisInstance.getInstance().del(this._mqttInfo.endDeviceId);

            if (res === 1) {
                logger.info(`Key ${this._mqttInfo.endDeviceId} deleted successfully.`, 'redis', 'delete');
            } else {
                logger.info(`Key ${this._mqttInfo.endDeviceId} does not exist.`, 'redis', 'delete');
            }
        } else {
            RedisInstance.getInstance().set(this._mqttInfo.endDeviceId, JSON.stringify({messages: messages}));
        }
    }
}
