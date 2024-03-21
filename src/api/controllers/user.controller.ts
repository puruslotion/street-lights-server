import { Logger } from '../../classes/logger/logger';
import { Request, Response } from 'express';
import { Validate } from '../../classes/validate';
import { Helper } from '../../classes/helper';
import { ResponseMessage } from '../../classes/responseMessage';
import {
	Collection,
	MongoClientInstance,
} from '../../classes/singletons/mongoClientInstance';
import { Role, User } from '../../db/user';
import { ForegroundColor } from '../../enums/foregroundColor';
import { BackgroundColor } from '../../enums/backgroundColor';
import jwt from 'jsonwebtoken';
import { RedisInstance } from '../../classes/singletons/redisInstance';
import { REDIS_KEY } from '../../enums/redisKey';
import { Status } from '../../enums/status';


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
			this.roles = [...new Set(json.roles as string[])];
			this.roles.forEach((value) => {
				if (!Object.values(Role).includes(value)) {
					throw new Error(`${value} is not a valid role`);
				}
			});
		}
	}
}

const login = async (req: Request, res: Response) => {
	try {
		if (await checkIfLoggedIn(req, res)) {
			return res.status(200).send(new ResponseMessage(`Already logged in`, 200));
		}

		const loginController = new UserController(req.body);
		loginController.username = Helper.sanitize(loginController.username);

		// case insensitive search for username
		const result = await MongoClientInstance.getInstance()
			.getCollection(Collection.USERS)
			.findOne(
				{ username: loginController.username },
				{ collation: { locale: 'en', strength: 2 } },
			);

		if (!result) {
			return res
				.status(401)
				.send(new ResponseMessage('Invalid login credentials', 401));
		}

		const user = new User(result);
		const isPasswordValid = await Helper.verifyPassword(
			loginController.password,
			user.password,
		);

		if (isPasswordValid) {
			const accessToken = jwt.sign(
				{ id: user.id, username: user.username, roles: user.roles },
				process.env.JWT_SECRET!,
				{ expiresIn: '15m' },
			);

			res.cookie('token', accessToken, {
				httpOnly: true,
				sameSite: 'none',
				secure: false
			});

			logger.info('login succeeded', 'user', 'login', undefined, (logData => {
				logData.userId = user.id;
				logData.status = Status.SUCCESS;
				MongoClientInstance.getInstance().getCollection(Collection.LOGS).insertOne(logData);
			}));

			return res.send(new ResponseMessage('login succeeded', 200));
		} else {
			return res.status(401).send('Login failed');
		}
		// eslint-disable-next-line
	} catch (error: any) {
		const err = Helper.parseError(error);
		logger.error(err, 'api', 'login');
		res.status(401).send(new ResponseMessage('Invalid login credentials', 401));
	}
};

async function checkIfLoggedIn(req: Request, res: Response) {
	return new Promise<boolean>(async (resolve) => {
		const authHeader = req.headers['cookie'];

		if (
			!authHeader ||
			typeof authHeader !== 'string' ||
			!authHeader.startsWith('token=')
		) {
			resolve(false); 
		}
	
		const token = authHeader?.replace('token=', '');

		if (!token) {
			resolve(false);
		}

		const result = await RedisInstance.getInstance().redis().get(`${REDIS_KEY.LOGOUT}${token}`)

		if (result) {
			resolve(false);
		}
	
		jwt.verify(token!, process.env.JWT_SECRET!, (err, user) => {
			if (err) {
				resolve(false);
			}
	
			resolve(true);
		});
	})
}

const isUserLoggedIn = async (req: Request, res: Response) => {
	if (await checkIfLoggedIn(req, res)) {
		return res.status(200).send(new ResponseMessage('logged in', 200));
	}

	return res.status(401).send(new ResponseMessage('not logged in', 401));
}

const logout = async (req: Request, res: Response) => {
	const token = req.headers['cookie']?.replace('token=', '');

	if (!token) 
		return res
			.status(400)
			.send(new ResponseMessage('User not logged in', 400));;

	const json = jwt.decode(token) as any ;
	const { id, username, exp} = json;
	const now = Date.now() / 1000;
	const checkResult = await RedisInstance.getInstance().redis().get(`${REDIS_KEY.LOGOUT}${token}`);

	if (checkResult) {
		return res.status(401).send(new ResponseMessage(`${username} already logged out`, 401));
	}

	const insertResult = await RedisInstance.getInstance().redis().setex(`${REDIS_KEY.LOGOUT}${token}`, parseInt(exp) - Math.floor(now), JSON.stringify(json));

	if (!insertResult) {
		return res.status(400).send(new ResponseMessage(`${username} failed to log out`, 400));
	}

	logger.info('logout succeeded', 'user', 'logout', undefined, (logData => {
		logData.userId = id;
		logData.status = Status.SUCCESS;
		MongoClientInstance.getInstance().getCollection(Collection.LOGS).insertOne(logData);
	}));

	return res.status(200).send(new ResponseMessage(`${username} logout succeeded`, 200));
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
			.insertOne(userController);

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

		logger.info(`Created user with username ${userController.username}`, 'user', 'create_user', BackgroundColor.Green);

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

export { getAllUsers, createUser, login, logout, isUserLoggedIn };
