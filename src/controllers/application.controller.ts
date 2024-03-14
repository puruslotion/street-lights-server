import { Logger } from "../classes/logger/logger";
import { ResponseMessage } from "../classes/responseMessage";
import { Collection, MongoClientInstance } from "../classes/singletons/mongoClientInstance";
import { Request, Response } from 'express';

const logger = new Logger();

export class Application {
    public id: string = "";
    public name?: string;
    public description?: string;
    public token = "";
    public mqttBrokerUrl: string = "";
}

const addApplication = async (req: Request, res: Response) => {
    try {
        const application: Application = req.body;

        if (!application.id) {
            return res.status(400).send(new ResponseMessage('ID cannot be empty', 400));
        }

        if (!application.name) {
            return res.status(400).send(new ResponseMessage('Name cannot be empty', 400));
        }

        // this needs to be encrypted
        if (!application.token) {
            return res.status(400).send(new ResponseMessage('Token cannot be empty', 400));
        }

        if (!application.mqttBrokerUrl) {
            return res.status(400).send(new ResponseMessage('MQTT broker url cannot be empty', 400));
        }

        const findResult = await MongoClientInstance.getCollection(Collection.APPLICATIONS).findOne({ id: application.id });

        if (findResult?._id) {
            return res.status(400).send(new ResponseMessage(`Object with ID ${application.id} already exists`, 400));
        }

        const insertResult = await MongoClientInstance.getCollection(Collection.APPLICATIONS).insertOne(application);

        if (!insertResult.acknowledged) {
            return res.status(400).send(new ResponseMessage('Could not insert data', 400, insertResult));
        }

        return res.status(201).send(new ResponseMessage('Application created successfully', 201));
    } catch (error) {
        logger.error(error, 'api', 'addapplication');
        return res.status(500).send(new ResponseMessage('Internal server error', 500, error));
    }
};

const getAllApplications = async (req: Request, res: Response) => {
    try {
        const applications = await MongoClientInstance.getCollection(Collection.APPLICATIONS).find({}).toArray();
        
        const applicationArr = applications.map((value) => {
            const app = value as unknown as Application;

            // removing password so it is not exposed
            app.token = "";

            return app;
        })

        return res.status(200).send(new ResponseMessage('Retrieved all application ids from database', 200, applicationArr));
    } catch (error) {
        logger.error(error, 'api', 'getallapplications');
        return res.status(500).send(new ResponseMessage('Internal server error', 500, error));
    }
}

const updateApplicationById = async (req: Request, res: Response) => {
    try {
        const application: Application = req.body;

        if (!application.id) {
            return res.status(400).send(new ResponseMessage('ID cannot be empty', 400));
        }

        const findResult = await MongoClientInstance.getCollection(Collection.APPLICATIONS).findOne({ id: application.id });

        if (!findResult?._id) {
            return res.status(404).send(new ResponseMessage(`Object with ID ${application.id} does not exist`, 404));
        }

        let updateFields = {};

        if (application.name) {
            updateFields = { ...updateFields, name: application.name };
        }

        if (application.description) {
            updateFields = { ...updateFields, description: application.description };
        }

        if (application.token) {
            updateFields = { ...updateFields, description: application.token };
        }

        if (application.mqttBrokerUrl) {
            updateFields = { ...updateFields, description: application.mqttBrokerUrl };
        }

        const filter = { id: application.id };
        const updateDoc = { $set: updateFields };

        const updateResult = await MongoClientInstance.getCollection(Collection.APPLICATIONS).updateOne(filter, updateDoc);

        if (!updateResult.acknowledged) {
            return res.status(500).send(new ResponseMessage('Could not update data', 500, updateResult));
        }

        return res.status(200).send(new ResponseMessage('Application updated successfully', 200));

    } catch (error) {
        console.error('Update Application Error:', error);
        return res.status(500).send(new ResponseMessage('Internal server error', 500, error));
    }
};

export { addApplication, getAllApplications, updateApplicationById };
