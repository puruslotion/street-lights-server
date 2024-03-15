import { MqttInfo } from './mqttInfo';

export class MqttTopicParser {
	public static parseTopic(topic: string) {
		const mqttInfo = new MqttInfo();
		const result = topic.split('/');
		mqttInfo.version = result[0];

		if (mqttInfo.version.toLowerCase() !== 'v3') {
			throw new Error(`${mqttInfo.version} is not supported. Only v3`);
		}

		const temp = result[1].split('@');

		if (temp.length !== 2) {
			throw new Error(
				`Unable to get application id and tenant id from this: ${result[1]}`,
			);
		}

		mqttInfo.applicationId = temp[0];
		mqttInfo.tentantID = temp[1];
		mqttInfo.devices = result[2];
		mqttInfo.endDeviceId = result[3];
		mqttInfo.type = result[4];

		if (result.length > 5) {
			mqttInfo.action = result[5];
		}

		return mqttInfo;
	}
}
