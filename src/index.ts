import { App } from "./classes/app";
import pino from "pino";

const logger = pino({
    level: 'debug'
});

const app = new App();
app.run()
    .then()
    .catch((err) => {
        logger.fatal(err);
    });
