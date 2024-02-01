class ApplicationIds {
    applicationId: string = '';

    constructor(json: any) {
        this.applicationId = json?.application_id ?? '';
    }
}

class EndDeviceIds {
    deviceId: string = '';
    applicationIds: ApplicationIds = new ApplicationIds({});

    constructor(json: any) {
        this.deviceId = json?.device_id ?? '';
        this.applicationIds = new ApplicationIds(json?.application_ids ?? {});
    }
}

class DecodedPayload {
    temperature: number = 0;
    luminosity: number = 0;

    constructor(json: any) {
        this.temperature = json?.temperature ?? 0;
        this.luminosity = json?.luminosity ?? 0;
    }
}

export class Downlink {
    fPort: number = 0;
    frmPayload: string = '';
    // decodedPayload: DecodedPayload = new DecodedPayload({});
    priority: string = '';
    confirmed: boolean = false;
    correlationIds: string[] = [];

    constructor(json: any) {
        this.fPort = json?.f_port ?? 0;
        this.frmPayload = json?.frm_payload ?? '';
        // this.decodedPayload = new DecodedPayload(json?.decoded_payload ?? {});
        this.priority = json?.priority ?? '';
        this.confirmed = json?.confirmed ?? false;
        this.correlationIds = json?.correlation_ids ?? [];
    }
}

export class DownlinkMessageTtn {
    endDeviceIds: EndDeviceIds = new EndDeviceIds({});
    downlinks: Downlink[] = [];

    constructor(json: any) {
        this.endDeviceIds = new EndDeviceIds(json?.end_device_ids ?? {});
        this.downlinks = json?.downlinks?.map((dl: any) => new Downlink(dl)) ?? [];
    }
}
