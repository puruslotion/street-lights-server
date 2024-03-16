import { Request, Response } from 'express';
import { Helper } from '../../classes/helper';
import { Logger } from '../../classes/logger/logger';
import { ResponseMessage } from '../../classes/responseMessage';
import jwt from 'jsonwebtoken';
import { Validate } from '../../classes/validate';
import { PropertyType } from '../../enums/propertyType';
import {
	Collection,
	MongoClientInstance,
} from '../../classes/singletons/mongoClientInstance';
import { User } from '../../db/user';

const logger = new Logger();

class LoginController extends Validate {
	username: string = '';
	password: string = '';

	// eslint-disable-next-line
	constructor(json: any) {
		super();

		if (
			this.validateProperty(
				json?.username,
				PropertyType.STRING,
				'username',
				true,
			)
		) {
			this.username = json.username;
		}

		if (
			this.validateProperty(
				json?.password,
				PropertyType.STRING,
				'password',
				true,
			)
		) {
			this.password = json.password;
		}
	}
}

const login = async (req: Request, res: Response) => {
	try {
		const loginController = new LoginController(req.body);
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
				{ username: user.username, roles: user.roles },
				process.env.JWT_SECRET!,
				{ expiresIn: '15m' },
			);

			res.cookie('token', accessToken, {
				httpOnly: true,
			});

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

const checkIfLoggedIn = async (req: Request, res: Response) => {
	return res.status(200).send(new ResponseMessage('You are logged in', 200));
};

export { login, checkIfLoggedIn };
