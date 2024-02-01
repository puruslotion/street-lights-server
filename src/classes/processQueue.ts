import pino from "pino";
import { Task } from "./task";

const logger = pino({
    level: 'debug'
});

export class ProcessQueue {
    private _queue: Task[] = [];
    private _isProcessing = false;

    public addTask(task: Task) {
        this._queue.push(task);

        if (!this._isProcessing) {
            this.processNext();
        }
    }

    private async processNext() {
        try {
            if (this._queue.length === 0) {
                this._isProcessing = false;
                return;
            }
    
            this._isProcessing = true;
            const task = this._queue.shift();
    
            if (task) {
                task.execute();
                this.processNext();
            }
        } catch (error) {
            logger.error(error);
        }
    }
}
