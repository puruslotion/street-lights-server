import { RedisInstance } from '../classes/singletons/redisInstance';

const addMessage = async (req: { body: any; }, res: { send: (arg0: string) => void; }) => {
    const jsonData = req.body;

    if (!jsonData?.id || !jsonData?.message) {
        res.send('Error: missing properties');
        return
    }

    const result = await RedisInstance.getInstance().get(jsonData.id);

    if (!result) {
        const messages: string[] = []
        messages.push(jsonData.message);

        RedisInstance.getInstance().set(jsonData.id, JSON.stringify({messages: messages}));
    } else {
        const obj = JSON.parse(result);
        const messages = obj.messages as string[];
        messages.push(jsonData.message);

        RedisInstance.getInstance().set(jsonData.id, JSON.stringify({messages: messages}));
    }

    res.send('Message has been added to queue');
}

interface Test {
    message: string;
}

const getMessage = async (req: { body: object; }, res: { send: (arg0: object) => void; }) => {
    
}

export { addMessage, getMessage }
