import { Validate } from '../classes/validate';
import { PropertyType } from '../enums/propertyType';

export class Application extends Validate {
	public id: string = '';
	public name?: string;
	public description?: string;
	public token = '';
	public mqttBrokerUrl: string = '';

	public getNameOfClass() {
		return 'Application';
	}

	// eslint-disable-next-line
	constructor(json: any) {
		super();

		if (this.validateProperty(json?.id, PropertyType.STRING, 'id', true)) {
			this.id = json.id;
		}

		if (this.validateProperty(json?.name, PropertyType.STRING, 'name', true)) {
			this.name = json.name;
		}

		if (
			this.validateProperty(
				json?.description,
				PropertyType.STRING,
				'description',
			)
		) {
			this.description = json.description;
		}

		if (
			this.validateProperty(json?.token, PropertyType.STRING, 'token', true)
		) {
			this.token = json.token;
		}

		if (
			this.validateProperty(
				json?.mqttBrokerUrl,
				PropertyType.STRING,
				'mqttBrokerUrl',
				true,
			)
		) {
			this.mqttBrokerUrl = json.mqttBrokerUrl;
		}
	}
}
