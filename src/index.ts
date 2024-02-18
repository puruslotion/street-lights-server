import { App } from "./classes/app";
import { Logger } from "./classes/logger/logger";

const logger = new Logger();

const app = new App();
app.run()
    .then()
    .catch((err) => {
        logger.fatal(err);
    });
