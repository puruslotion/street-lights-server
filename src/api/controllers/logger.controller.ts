import { Level, Logger } from '../../classes/logger/logger';
import { Request, Response } from 'express';
import { ResponseMessage } from '../../classes/responseMessage';
import { PropertyType } from '../../enums/propertyType';
import { Helper } from '../../classes/helper';
import { Validate } from '../../classes/validate';

const logger = new Logger();

class LogLevel extends Validate {
	public level: number = 0;

	// eslint-disable-next-line
	constructor(json: any) {
		super();

		if (this.validateProperty(json?.level, PropertyType.NUMBER, 'level')) {
			this.level = json.level;
		}
	}
}

// PATCH
const updateLevel = async (req: Request, res: Response) => {
	try {
		const logLevel = new LogLevel(req.body);

		switch (logLevel.level) {
			case Level.DEB:
				Logger.setLevel(Level.DEB);
				break;
			case Level.INF:
				Logger.setLevel(Level.INF);
				break;
			case Level.WAR:
				Logger.setLevel(Level.WAR);
				break;
			case Level.ERR:
				Logger.setLevel(Level.ERR);
				break;
			case Level.FAT:
				Logger.setLevel(Level.FAT);
				break;
			default:
				return res
					.status(400)
					.send(
						new ResponseMessage(
							`${logLevel.level} is not a valid log level`,
							400,
						),
					);
		}

		res
			.status(200)
			.send(
				new ResponseMessage(
					`log level has been changed to ${logLevel.level}`,
					200,
				),
			);
	} catch (error) {
		const err = Helper.parseError(error);
		logger.error(err, 'api', 'update_level');
		res.status(500).send(new ResponseMessage(`${err}`, 500));
	}
};

export { updateLevel };
