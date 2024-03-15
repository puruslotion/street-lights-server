import mqtt from 'mqtt/*';
import { MqttTopicParser } from './mqttTopicParse';
import { DeviceFactory } from './factories/deviceFactory';

export class Task {
	private _topic: string;
	private _payload: Buffer;
	private _packet: mqtt.IPublishPacket;

	public constructor(
		topic: string,
		payload: Buffer,
		packet: mqtt.IPublishPacket,
	) {
		this._topic = topic;
		this._payload = payload;
		this._packet = packet;
	}

	public async execute() {
		const mqttInfo = MqttTopicParser.parseTopic(this._topic);
		const device = DeviceFactory.getDevice(mqttInfo.type);
		device.mqttInfo = mqttInfo;
		device.topic = this._topic;
		device.payload = this._payload;
		device.packet = this._packet;

		device.execute();
	}
}
