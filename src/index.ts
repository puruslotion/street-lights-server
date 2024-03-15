import { App } from './classes/app';
import { Level, Logger } from './classes/logger/logger';
import { ForegroundColor } from './enums/foregroundColor';

Logger.setLevel(Level.DEB);
const logger = new Logger();

const app = new App();
app
	.run()
	.then()
	.catch((err) => {
		logger.fatal(err, 'app', 'main', ForegroundColor.Magenta);
	});
