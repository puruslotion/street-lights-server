class ApplicationIds {
	applicationId: string = '';

	// eslint-disable-next-line
	constructor(json: any) {
		this.applicationId = json?.application_id ?? '';
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

class DownlinkQueued {
	sessionKeyId: string = '';
	fPort: number = 0;
	fCnt: number = 0;
	frmPayload: string = '';
	confirmed: boolean = false;
	priority: string = '';
	correlationIds: string[] = [];

	// eslint-disable-next-line
	constructor(json: any) {
		this.sessionKeyId = json?.session_key_id ?? '';
		this.fPort = json?.f_port ?? 0;
		this.fCnt = json?.f_cnt ?? 0;
		this.frmPayload = json?.frm_payload ?? '';
		this.confirmed = json?.confirmed ?? false;
		this.priority = json?.priority ?? '';
		this.correlationIds = json?.correlation_ids ?? [];
	}
}

export class DownlinkEventsMessageTtn {
	endDeviceIds: EndDeviceIds = new EndDeviceIds({});
	correlationIds: string[] = [];
	receivedAt: string = '';
	downlinkQueued: DownlinkQueued = new DownlinkQueued({});

	// eslint-disable-next-line
	constructor(json: any) {
		this.endDeviceIds = new EndDeviceIds(json?.end_device_ids ?? {});
		this.correlationIds = json?.correlation_ids ?? [];
		this.receivedAt = json?.received_at ?? '';
		this.downlinkQueued = new DownlinkQueued(json?.downlink_queued ?? {});
	}
}
