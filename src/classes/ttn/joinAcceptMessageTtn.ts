class ApplicationIds {
    applicationId: string = '';

    constructor(json: any) {
        if (json?.application_id) {
            this.applicationId = json.application_id;
        }
    }
}

class EndDeviceIds {
    deviceId: string = '';
    applicationIds: ApplicationIds = new ApplicationIds({});
    devEui: string = '';
    joinEui: string = '';
    devAddr: string = '';

    constructor(json: any) {
        if (json) {
            this.deviceId = json.device_id || this.deviceId;
            this.applicationIds = new ApplicationIds(json.application_ids || {});
            this.devEui = json.dev_eui || this.devEui;
            this.joinEui = json.join_eui || this.joinEui;
            this.devAddr = json.dev_addr || this.devAddr;
        }
    }
}

class JoinAccept {
    sessionKeyId: string = '';
    receivedAt: string = '';

    constructor(json: any) {
        if (json) {
            this.sessionKeyId = json.session_key_id || this.sessionKeyId;
            this.receivedAt = json.received_at || this.receivedAt;
        }
    }
}

export class JoinAcceptMessageTtn {
    endDeviceIds: EndDeviceIds = new EndDeviceIds({});
    correlationIds: string[] = [];
    receivedAt: string = '';
    joinAccept: JoinAccept = new JoinAccept({});

    constructor(json: any) {
        if (json) {
            this.endDeviceIds = new EndDeviceIds(json.end_device_ids || {});
            this.correlationIds = json.correlation_ids || this.correlationIds;
            this.receivedAt = json.received_at || this.receivedAt;
            this.joinAccept = new JoinAccept(json.join_accept || {});
        }
    }
}
