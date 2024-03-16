import { Logger } from '../../classes/logger/logger';
import { ResponseMessage } from '../../classes/responseMessage';
import { RedisInstance } from '../../classes/singletons/redisInstance';
import { Request, Response } from 'express';
import { REDIS_KEY } from '../../enums/redisKey';
import { PropertyType } from '../../enums/propertyType';
import { Helper } from '../../classes/helper';
import { Validate } from '../../classes/validate';

const logger = new Logger();

class MessageController extends Validate {
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

// POST
const createMessage = async (req: Request, res: Response) => {
	try {
		const message = new MessageController(req.body);
		message.id = Helper.sanitize(message.id);

		if (!message.id) {
			return res
				.status(400)
				.send(new ResponseMessage('ID cannot be empty', 400));
		}

		if (!message.payload) {
			return res
				.status(400)
				.send(new ResponseMessage('Payload cannot be empty', 400));
		}

		const redisEndDeviceKey = await (await RedisInstance.getInstance())
			.redis()
			.get(`${REDIS_KEY.END_DEVICE}${message.id}`);

		if (!redisEndDeviceKey) {
			logger.error(
				`End device with id ${message.id.cyan().reset()} does not exist`,
				'api',
				'create_message',
			);
			return res
				.status(400)
				.send(
					new ResponseMessage(
						`End device with id ${message.id} does not exist`,
						400,
					),
				);
		}

		const redisKey = `${REDIS_KEY.ADD_MESSAGE}${message.id}`;
		const result = await RedisInstance.getInstance().redis().get(redisKey);

		if (!result) {
			const messages: MessageController[] = [];
			messages.push(message);

			RedisInstance.getInstance()
				.redis()
				.set(redisKey, JSON.stringify({ messages: messages }));
		} else {
			const obj = JSON.parse(result);
			const messages = obj.messages as MessageController[];
			messages.push(message);

			RedisInstance.getInstance()
				.redis()
				.set(redisKey, JSON.stringify({ messages: messages }));
		}

		logger.debug(message, 'api', 'create_message');

		res
			.status(200)
			.send(new ResponseMessage('Message has been added to queue', 200));
		// eslint-disable-next-line
	} catch (error: any) {
		const err = Helper.parseError(error);
		logger.error(err, 'api', 'create_message');
		res.status(500).send(new ResponseMessage(`${err}`, 500));
	}
};

export { createMessage };
