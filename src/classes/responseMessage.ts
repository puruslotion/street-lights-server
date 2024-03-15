export class ResponseMessage {
	public message: string;
	public status: number;
	// eslint-disable-next-line
	public data?: any;

	// eslint-disable-next-line
	constructor(message: string, status: number, data?: any) {
		this.message = message;
		this.status = status;
		this.data = data;
	}
}
