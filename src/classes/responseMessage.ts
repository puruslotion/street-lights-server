export class ResponseMessage {
    public message: string;
    public status: number;
    public data?: any;

    constructor(message: string, status: number, data?: any) {
        this.message = message;
        this.status = status;
        this.data = data;
    }
}
