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

	// eslint-disable-next-line
	constructor(json: any) {
		this.deviceId = json?.device_id ?? '';
		this.applicationIds = new ApplicationIds(json?.application_ids ?? {});
	}
}

class Downlink {
	fPort: number = 0;
	frmPayload: string = '';
	confirmed: boolean = false;
	priority: string = '';
	correlationIds: string[] = [];

	// eslint-disable-next-line
	constructor(json: any) {
		this.fPort = json?.f_port ?? 0;
		this.frmPayload = json?.frm_payload ?? '';
		this.confirmed = json?.confirmed ?? false;
		this.priority = json?.priority ?? '';
		this.correlationIds = json?.correlation_ids ?? [];
	}
}

class ErrorDetails {
	namespace: string = '';
	name: string = '';
	messageFormat: string = '';
	correlationId: string = '';
	code: number = 0;

	// eslint-disable-next-line
	constructor(json: any) {
		this.namespace = json?.namespace ?? '';
		this.name = json?.name ?? '';
		this.messageFormat = json?.message_format ?? '';
		this.correlationId = json?.correlation_id ?? '';
		this.code = json?.code ?? 0;
	}
}

class DownlinkFailed {
	downlink: Downlink = new Downlink({});
	error: ErrorDetails = new ErrorDetails({});

	// eslint-disable-next-line
	constructor(json: any) {
		this.downlink = new Downlink(json?.downlink ?? {});
		this.error = new ErrorDetails(json?.error ?? {});
	}
}

export class DownlinkMessageFailedTtn {
	endDeviceIds: EndDeviceIds = new EndDeviceIds({});
	correlationIds: string[] = [];
	downlinkFailed: DownlinkFailed = new DownlinkFailed({});

	// eslint-disable-next-line
	constructor(json: any) {
		this.endDeviceIds = new EndDeviceIds(json?.end_device_ids ?? {});
		this.correlationIds = json?.correlation_ids ?? [];
		this.downlinkFailed = new DownlinkFailed(json?.downlink_failed ?? {});
	}
}
