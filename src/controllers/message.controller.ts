import { Logger } from '../classes/logger/logger';
import { ResponseMessage } from '../classes/responseMessage';
import { RedisInstance } from '../classes/singletons/redisInstance';
import { Request, Response } from 'express';
import { REDIS_KEY } from '../enums/redisKey';

const logger = new Logger();

export class Message {
    id: string = "";
    // applicationId: string = "";
    payload: string = "";
}

const addMessage = async (req: Request, res: Response) => {
    const message: Message = req.body;

    if (!message.id) {
        return res.status(400).send(new ResponseMessage('ID cannot be empty', 400));
    }

    // if (!message.applicationId) {
    //     return res.status(400).send(new ResponseMessage('Application ID cannot be empty', 400));
    // }

    if (!message.payload) {
        return res.status(400).send(new ResponseMessage('Payload cannot be empty', 400));
    }

    const redisKey = `${REDIS_KEY.ADD_MESSAGE}${message.id}`
    const result = await RedisInstance.getInstance().get(redisKey);

    if (!result) {
        const messages: Message[] = []
        messages.push(message);

        RedisInstance.getInstance().set(redisKey, JSON.stringify({messages: messages}));
    } else {
        const obj = JSON.parse(result);
        const messages = obj.messages as Message[];
        messages.push(message);

        RedisInstance.getInstance().set(redisKey, JSON.stringify({messages: messages}));
    }

    logger.debug(message, 'message', 'added');

    res.send('Message has been added to queue');
}

export { addMessage }
