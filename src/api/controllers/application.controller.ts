import { Logger } from '../../classes/logger/logger';
import { ResponseMessage } from '../../classes/responseMessage';
import {
	Collection,
	MongoClientInstance,
} from '../../classes/singletons/mongoClientInstance';
import { Request, Response } from 'express';
import { PropertyType } from '../../enums/propertyType';
import { Helper } from '../../classes/helper';
import { Validate } from '../../classes/validate';
import { Application } from '../../db/application';

const logger = new Logger();

class ApplicationController extends Validate {
	public id: string = '';
	public name?: string;
	public description?: string;
	public token = '';
	public mqttBrokerUrl: string = '';

	// eslint-disable-next-line
	constructor(json: any) {
		super();

		if (this.validateProperty(json?.id, PropertyType.STRING, 'id')) {
			this.id = json.id;
		}

		if (this.validateProperty(json?.name, PropertyType.STRING, 'name')) {
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

		if (this.validateProperty(json?.token, PropertyType.STRING, 'token')) {
			this.token = json.token;
		}

		if (
			this.validateProperty(
				json?.mqttBrokerUrl,
				PropertyType.STRING,
				'mqttBrokerUrl',
			)
		) {
			this.mqttBrokerUrl = json.mqttBrokerUrl;
		}
	}
}

// POST
const createApplication = async (req: Request, res: Response) => {
	try {
		const temp = new ApplicationController(req.body);
		const application = new Application(temp);
		application.id = Helper.sanitize(application.id);

		// if (!application.id) {
		// 	return res
		// 		.status(400)
		// 		.send(new ResponseMessage('ID cannot be empty', 400));
		// }

		// if (!application.name) {
		// 	return res
		// 		.status(400)
		// 		.send(new ResponseMessage('Name cannot be empty', 400));
		// }

		// // this needs to be encrypted
		// if (!application.token) {
		// 	return res
		// 		.status(400)
		// 		.send(new ResponseMessage('Token cannot be empty', 400));
		// }

		// if (!application.mqttBrokerUrl) {
		// 	return res
		// 		.status(400)
		// 		.send(new ResponseMessage('MQTT broker url cannot be empty', 400));
		// }

		const findResult = await MongoClientInstance.getInstance()
			.getCollection(Collection.APPLICATIONS)
			.findOne({ id: application.id });

		if (findResult?._id) {
			return res
				.status(400)
				.send(
					new ResponseMessage(
						`Object with ID ${application.id} already exists`,
						400,
					),
				);
		}

		const insertResult = await MongoClientInstance.getInstance()
			.getCollection(Collection.APPLICATIONS)
			.insertOne(application);

		if (!insertResult.acknowledged) {
			return res
				.status(400)
				.send(new ResponseMessage('Could not insert data', 400, insertResult));
		}

		return res
			.status(201)
			.send(new ResponseMessage('Application created successfully', 201));
		// eslint-disable-next-line
	} catch (error: any) {
		const err = Helper.parseError(error);
		logger.error(err, 'api', 'create_application');
		return res.status(500).send(new ResponseMessage(err, 500));
	}
};

// GET
const readAllApplications = async (req: Request, res: Response) => {
	try {
		const applications = await MongoClientInstance.getInstance()
			.getCollection(Collection.APPLICATIONS)
			.find({})
			.toArray();

		const applicationArr = applications.map((value) => {
			const app = new ApplicationController(value);

			// removing password so it is not exposed
			app.token = '';

			return app;
		});

		return res
			.status(200)
			.send(
				new ResponseMessage(
					'Retrieved all application ids from database',
					200,
					applicationArr,
				),
			);
		// eslint-disable-next-line
	} catch (error: any) {
		const err = Helper.parseError(error);
		logger.error(err, 'api', 'read_all_applications');
		return res.status(500).send(new ResponseMessage(err, 500));
	}
};

// PATCH
const updateApplicationById = async (req: Request, res: Response) => {
	try {
		const application: ApplicationController = new ApplicationController(
			req.body,
		);
		application.id = Helper.sanitize(application.id);

		if (!application.id) {
			return res
				.status(400)
				.send(new ResponseMessage('ID cannot be empty', 400));
		}

		const findResult = await MongoClientInstance.getInstance()
			.getCollection(Collection.APPLICATIONS)
			.findOne({ id: application.id });

		if (!findResult?._id) {
			return res
				.status(404)
				.send(
					new ResponseMessage(
						`Object with ID ${application.id} does not exist`,
						404,
					),
				);
		}

		let updateFields = {};

		if (application.name) {
			updateFields = { ...updateFields, name: application.name };
		}

		if (application.description) {
			updateFields = { ...updateFields, description: application.description };
		}

		if (application.token) {
			updateFields = { ...updateFields, token: application.token };
		}

		if (application.mqttBrokerUrl) {
			updateFields = {
				...updateFields,
				mqttBrokerUrl: application.mqttBrokerUrl,
			};
		}

		const filter = { id: application.id };
		const updateDoc = { $set: updateFields };

		const updateResult = await MongoClientInstance.getInstance()
			.getCollection(Collection.APPLICATIONS)
			.updateOne(filter, updateDoc);

		if (!updateResult.acknowledged) {
			return res
				.status(500)
				.send(new ResponseMessage('Could not update data', 500, updateResult));
		}

		return res
			.status(200)
			.send(new ResponseMessage('Application updated successfully', 200));
		// eslint-disable-next-line
	} catch (error: any) {
		const err = Helper.parseError(error);
		logger.error(`${err}`, 'api', 'update_application_by_id');
		return res.status(500).send(new ResponseMessage(err, 500));
	}
};

export { createApplication, readAllApplications, updateApplicationById };
