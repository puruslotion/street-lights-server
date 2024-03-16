import { Validate } from '../classes/validate';
import { PropertyType } from '../enums/propertyType';

export class Message extends Validate {
	id: string = '';
	payload: string = '';

	// eslint-disable-next-line
	constructor(json: any) {
		super();

		if (this.validateProperty(json?.id, PropertyType.STRING, 'id')) {
			this.id = json.id;
		}

		if (this.validateProperty(json?.payload, PropertyType.STRING, 'payload')) {
			this.payload = json.payload;
		}
	}
}
