import { Logger } from '../../classes/logger/logger';
import { Request, Response } from 'express';
import { Validate } from '../../classes/validate';
import { Helper } from '../../classes/helper';
import { ResponseMessage } from '../../classes/responseMessage';
import {
	Collection,
	MongoClientInstance,
} from '../../classes/singletons/mongoClientInstance';
import { User } from '../../db/user';

const logger = new Logger();

class UserController extends Validate {
	username: string = '';
	password: string = '';
	roles: string[] = [];

	// eslint-disable-next-line
	constructor(json: any) {
		super();

		if (this.validateProperty(json?.username, 'string', 'username')) {
			this.username = json.username;
		}

		if (this.validateProperty(json?.password, 'string', 'password')) {
			this.password = json.password;
		}

		if (this.validateProperty(json?.roles, 'string', 'roles', false, true)) {
			this.roles = json.roles;
		}
	}
}

const createUser = async (req: Request, res: Response) => {
	try {
		const userController = new UserController(req.body);
		userController.username = Helper.sanitize(userController.username);

		if (!userController.username) {
			return res
				.status(400)
				.send(new ResponseMessage('Username cannot be empty', 400));
		}

		if (!userController.password) {
			return res
				.status(400)
				.send(new ResponseMessage('Username cannot be empty', 400));
		}

		if (!userController.roles) {
			return res
				.status(400)
				.send(new ResponseMessage('Roles cannot be empty', 400));
		}

		const findResult = await MongoClientInstance.getInstance()
			.getCollection(Collection.USERS)
			.findOne({ username: userController.username });

		if (findResult) {
			return res
				.status(400)
				.send(
					new ResponseMessage(
						`Username ${userController.username} is already used`,
						400,
					),
				);
		}

		userController.password = await Helper.hashPassword(
			userController.password,
		);

		const insertResult = await MongoClientInstance.getInstance()
			.getCollection(Collection.USERS)
			.insertOne(new User(userController));

		if (!insertResult.acknowledged) {
			return res
				.status(400)
				.send(
					new ResponseMessage(
						`Could not create user with username ${userController.username}`,
						400,
					),
				);
		}

		res
			.status(200)
			.send(
				new ResponseMessage(
					`Created user with username ${userController.username}`,
					201,
				),
			);
	} catch (error) {
		const err = Helper.parseError(error);
		logger.error(err, 'api', 'create_user');
		res.status(500).send(new ResponseMessage(`${err}`, 500));
	}
};

const getAllUsers = async (req: Request, res: Response) => {
	try {
		const users = (
			await MongoClientInstance.getInstance()
				.getCollection(Collection.USERS)
				.find({})
				.toArray()
		).forEach((value) => {
			return new User(value);
		});

		res.status(200).send(new ResponseMessage('All users', 200, users));
	} catch (error) {
		const err = Helper.parseError(error);
		logger.error(err, 'api', 'read_user');
		res.status(500).send(new ResponseMessage(`${err}`, 500));
	}
};

// const getUserByUsername = async (req: Request, res: Response) => {
// 	try {
// 		const userController = new UserController(req.body);
// 		userController.username = Helper.sanitize(userController.username);
// 	} catch (error) {
// 		const err = Helper.parseError(error);
// 		logger.error(err, 'api', 'read_user');
// 		res.status(500).send(new ResponseMessage(`${err}`, 500));
// 	}
// };

// const updateUser = async (req: Request, res: Response) => {
// 	try {
// 		const userController = new UserController(req.body);
// 	} catch (error) {
// 		const err = Helper.parseError(error);
// 		logger.error(err, 'api', 'update_user');
// 		res.status(500).send(new ResponseMessage(`${err}`, 500));
// 	}
// };

// const deleteUser = async (req: Request, res: Response) => {
// 	try {
// 		const userController = new UserController(req.body);
// 	} catch (error) {
// 		const err = Helper.parseError(error);
// 		logger.error(err, 'api', 'delete_user');
// 		res.status(500).send(new ResponseMessage(`${err}`, 500));
// 	}
// };

export { getAllUsers, createUser };
