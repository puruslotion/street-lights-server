import { ResponseMessage } from '../classes/responseMessage';
import { RedisInstance } from '../classes/singletons/redisInstance';
import { Request, Response } from 'express';

export class Message {
    id: string = "";
    applicationId: string = "";
    payload: string = "";
}

const addMessage = async (req: Request, res: Response) => {
    const message: Message = req.body;

    if (!message.id) {
        return res.status(400).send(new ResponseMessage('ID cannot be empty', 400));
    }

    if (!message.applicationId) {
        return res.status(400).send(new ResponseMessage('Application ID cannot be empty', 400));
    }

    if (!message.payload) {
        return res.status(400).send(new ResponseMessage('Payload cannot be empty', 400));
    }

    const result = await RedisInstance.getInstance().get(message.id);

    if (!result) {
        const messages: Message[] = []
        messages.push(message);

        RedisInstance.getInstance().set(message.id, JSON.stringify({messages: messages}));
    } else {
        const obj = JSON.parse(result);
        const messages = obj.messages as Message[];
        messages.push(message);

        RedisInstance.getInstance().set(message.id, JSON.stringify({messages: messages}));
    }

    res.send('Message has been added to queue');
}

// interface Test {
//     message: string;
// }

// const getMessage = async (req: { body: object; }, res: { send: (arg0: object) => void; }) => {
    
// }

export { addMessage }
