import { Helper } from '../helper';

class ApplicationIds {
	applicationId: string = '';

	// eslint-disable-next-line
	constructor(json: any) {
		this.applicationId = json?.application_id ?? '';
	}
}

class GatewayIds {
	gatewayId: string = '';
	eui: string = '';

	// eslint-disable-next-line
	constructor(json: any) {
		this.gatewayId = json?.gateway_id ?? '';
		this.eui = json?.eui ?? '';
	}
}

class Loc {
	latitude: number = 0;
	longitude: number = 0;
	altitude: number = 0;
	source: string = '';

	// eslint-disable-next-line
	constructor(json: any) {
		this.latitude = json?.latitude ?? 0;
		this.longitude = json?.longitude ?? 0;
		this.altitude = json?.altitude ?? 0;
		this.source = json?.source ?? '';
	}
}

class RxMetadata {
	gatewayIds: GatewayIds = new GatewayIds({});
	time: string = '';
	timestamp: number = 0;
	rssi: number = 0;
	channelRssi: number = 0;
	snr: number = 0;
	uplinkToken: string = '';
	channelIndex: number = 0;
	location: Loc = new Loc({});

	// eslint-disable-next-line
	constructor(json: any) {
		this.gatewayIds = new GatewayIds(json?.gateway_ids ?? {});
		this.time = json?.time ?? '';
		this.timestamp = json?.timestamp ?? 0;
		this.rssi = json?.rssi ?? 0;
		this.channelRssi = json?.channel_rssi ?? 0;
		this.snr = json?.snr ?? 0;
		this.uplinkToken = json?.uplink_token ?? '';
		this.channelIndex = json?.channel_index ?? 0;
		this.location = new Loc(json?.location ?? {});
	}
}

class LoRa {
	bandwidth: number = 0;
	spreadingFactor: number = 0;

	// eslint-disable-next-line
	constructor(json: any) {
		this.bandwidth = json?.bandwidth ?? 0;
		this.spreadingFactor = json?.spreading_factor ?? 0;
	}
}

class DataRate {
	lora: LoRa = new LoRa({});

	// eslint-disable-next-line
	constructor(json: any) {
		this.lora = new LoRa(json?.lora ?? {});
	}
}

class Settings {
	dataRate: DataRate = new DataRate({});
	codingRate: string = '';
	frequency: string = '';

	// eslint-disable-next-line
	constructor(json: any) {
		this.dataRate = new DataRate(json?.data_rate ?? {});
		this.codingRate = json?.coding_rate ?? '';
		this.frequency = json?.frequency ?? '';
	}
}

class DecodedPayload {
	temperature: number = 0;
	luminosity: number = 0;

	// eslint-disable-next-line
	constructor(json: any) {
		this.temperature = json?.temperature ?? 0;
		this.luminosity = json?.luminosity ?? 0;
	}
}

class UplinkMessage {
	sessionKeyId: string = '';
	fCnt: number = 0;
	fPort: number = 0;
	frmPayload: string = '';
	decodedPayload: DecodedPayload = new DecodedPayload({});
	rxMetadata: RxMetadata[] = [];
	settings: Settings = new Settings({});
	receivedAt: string = '';
	consumedAirtime: string = '';
	locations: { [key: string]: Loc } = {};
	versionIds: { [key: string]: string } = {};
	networkIds: { [key: string]: string } = {};

	// eslint-disable-next-line
	constructor(json: any) {
		this.sessionKeyId = json?.session_key_id ?? '';
		this.fCnt = json?.f_cnt ?? 0;
		this.fPort = json?.f_port ?? 0;

		if (json?.frm_payload) {
			this.frmPayload = '';

			// eslint-disable-next-line
			for (let c of Helper.base64ToUint8Array(json?.frm_payload)) {
				this.frmPayload += String.fromCharCode(c);
			}
		}

		this.decodedPayload = new DecodedPayload(json?.decoded_payload ?? {});

		this.rxMetadata =
			// eslint-disable-next-line
			json?.rx_metadata?.map((md: any) => new RxMetadata(md)) ?? [];
		this.settings = new Settings(json?.settings ?? {});
		this.receivedAt = json?.received_at ?? '';
		this.consumedAirtime = json?.consumed_airtime ?? '';
		this.locations = Object.entries(json?.locations ?? {}).reduce(
			(acc, [key, value]) => {
				acc[key] = new Loc(value);
				return acc;
			},
			{} as { [key: string]: Loc },
		);
		this.versionIds = json?.version_ids ?? {};
		this.networkIds = json?.network_ids ?? {};
	}
}

class EndDeviceIds {
	deviceId: string = '';
	applicationIds: ApplicationIds = new ApplicationIds({});
	devEui: string = '';
	joinEui: string = '';
	devAddr: string = '';

	// eslint-disable-next-line
	constructor(json: any) {
		this.deviceId = json?.device_id ?? '';
		this.applicationIds = new ApplicationIds(json?.application_ids ?? {});
		this.devEui = json?.dev_eui ?? '';
		this.joinEui = json?.join_eui ?? '';
		this.devAddr = json?.dev_addr ?? '';
	}
}

export class UplinkMessageTtn {
	endDeviceIds: EndDeviceIds = new EndDeviceIds({});
	correlationIds: string[] = [];
	receivedAt: string = '';
	uplinkMessage: UplinkMessage = new UplinkMessage({});
	simulated: boolean = false;

	// eslint-disable-next-line
	constructor(json: any) {
		this.endDeviceIds = new EndDeviceIds(json?.end_device_ids ?? {});
		this.correlationIds = json?.correlation_ids ?? [];
		this.receivedAt = json?.received_at ?? '';
		this.uplinkMessage = new UplinkMessage(json?.uplink_message ?? {});
		this.simulated = json?.simulated ?? false;
	}
}
