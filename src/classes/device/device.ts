import mqtt from "mqtt/*";
import { MqttInfo } from "../mqttInfo";

export abstract class Device {
    protected _mqttInfo!: MqttInfo;
    protected _topic!: string;
    protected _payload!: Buffer;
    protected _packet!: mqtt.IPublishPacket;

    set mqttInfo(mqttInfo: MqttInfo) {
        this._mqttInfo = mqttInfo;
    }

    set topic(topic: string) {
        this._topic = topic;
    }

    set payload(payload: Buffer) {
        this._payload = payload;
    }

    set packet(packet: mqtt.IPublishPacket) {
        this._packet = packet;
    }

    abstract execute(): Promise<void>;
}
