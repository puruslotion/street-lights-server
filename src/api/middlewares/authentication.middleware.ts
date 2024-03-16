import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Logger } from '../../classes/logger/logger';

const logger = new Logger();

// Middleware for token authentication
function authenticateToken(req: Request, res: Response, next: NextFunction) {
	const authHeader = req.headers['cookie'];

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
			.send('Unauthorized: No token provided or invalid token format.');
	}

	const token = authHeader.replace('token=', '');

	jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
		if (err) {
			logger.info(
				`JWT Error: ${err.message}`,
				'middleware',
				'authenticateToken',
			);
			return res.status(403).send('Forbidden: Invalid token.');
		}

		Object.assign(req, { user: user });
		next();
	});
}

export { authenticateToken };
