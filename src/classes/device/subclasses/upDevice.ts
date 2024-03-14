import { Device } from "../device";
import { Helper } from "../../helper";
import { UplinkMessageTtn } from "../../ttn/uplinkMessageTtn";
import { RedisInstance } from "../../singletons/redisInstance";
import { Downlink, DownlinkMessageTtn } from "../../ttn/downlinkMessageTtn";
import { MqttInstance } from "../../singletons/mqttInstance";
import { Type } from "../../../enums/type";
import { Action } from "../../../enums/action";
import mqtt from "mqtt";
import config from "../../../../config/config.json";
import { Logger } from "../../logger/logger";
import { Message } from "../../../controllers/message.controller";


// import { Downlink, DownlinkMessageTtn } from "../../ttn/downlinkMessageTtn";

const logger = new Logger();

export class UpDevice extends Device  {
    public async execute() {
        logger.debug('UpDevice execute()');
        logger.debug(`Topic: ${this._topic}`);
        logger.debug(`Action: ${this._mqttInfo.action}`);
        logger.debug(`Device id: ${this._mqttInfo.endDeviceId}`);

        const json = JSON.parse(Helper.bytesToString(this._payload));
        const uplinkMessageTtn = new UplinkMessageTtn(json);

        logger.debug(`Message from LoRaWAN node: ${uplinkMessageTtn.uplinkMessage.frmPayload}`);

        const brokerUrl = config.mqtt.brokerUrl

        let client = mqtt.connect(brokerUrl, {
            username: config.mqtt.username,
            password: config.mqtt.password
        })

        const result = await RedisInstance.getInstance().get(this._mqttInfo.endDeviceId);

        if (!result) return;

        const messages = JSON.parse(result).messages as Message[];
        const message = messages.shift();

        const downlinkMessage = new DownlinkMessageTtn("");
        const downlink = new Downlink("");
        downlink.confirmed = false;
        downlink.priority = 'HIGH';
        downlink.fPort = 10;
        downlink.frmPayload = Helper.stringToBase64(message?.payload ?? 'no content');
        downlinkMessage.downlinks.push(downlink);

        logger.info(result);

        MqttInstance.getInstance().publish(message?.id!, `v3/${message?.applicationId}@ttn/devices/${this._mqttInfo.endDeviceId}/down/push`,JSON.stringify(downlinkMessage));

        if (messages.length === 0) {
            const res = await RedisInstance.getInstance().del(this._mqttInfo.endDeviceId);

            if (res === 1) {
                logger.info(`Key ${this._mqttInfo.endDeviceId} deleted successfully.`);
              } else {
                logger.info(`Key ${this._mqttInfo.endDeviceId} does not exist.`);
              }
        } else {
            RedisInstance.getInstance().set(this._mqttInfo.endDeviceId, JSON.stringify({messages: messages}));
        }
    }
}
