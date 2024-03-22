import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Logger } from '../../classes/logger/logger';
import { RedisInstance } from '../../classes/singletons/redisInstance';
import { REDIS_KEY } from '../../enums/redisKey';
import { ResponseMessage } from '../../classes/responseMessage';

const logger = new Logger();

// Middleware for token authentication
async function authenticateToken(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const authHeader = req.headers['cookie'];

	console.log(authHeader);

	if (
		!authHeader ||
		typeof authHeader !== 'string' ||
		!authHeader.startsWith('token=')
	) {
		logger.info(
			'Unauthorized: No token provided or invalid token format.',
			'middleware',
			'authenticateToken',
		);
		return res
			.status(401)
			.send(
				new ResponseMessage(
					'Unauthorized: No token provided or invalid token format.',
					401,
				),
			);
	}

	const token = authHeader.replace('token=', '');

	const result = await RedisInstance.getInstance()
		.redis()
		.get(`${REDIS_KEY.LOGOUT}${token}`);

	if (result) {
		res.cookie('token', 'rubbish', {
			httpOnly: true,
			sameSite: 'none',
			secure: false,
			expires: new Date(0),
		});
		logger.info(
			`user has logged out: ${jwt.decode(token)}`,
			'authenticate_token',
			'logout',
		);
		return res
			.status(401)
			.send(
				new ResponseMessage(
					'Unauthorized: No token provided or invalid token format.',
					401,
				),
			);
	}

	jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
		if (err) {
			logger.info(
				`JWT Error: ${err.message}`,
				'middleware',
				'authenticateToken',
			);
			return res
				.status(403)
				.send(new ResponseMessage('Forbidden: Invalid token.', 403));
		}

		Object.assign(req, { user: user });
		next();
	});
}

export { authenticateToken };
