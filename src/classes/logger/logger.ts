import { BackgroundColor } from '../../enums/backgroundColor';
import { ForegroundColor } from '../../enums/foregroundColor';
import { Importance } from '../../enums/importance';
import { Style } from '../../enums/style';
import '../../string/string.extensions';

export enum Level {
	DEB = 0,
	INF = 1,
	WAR = 2,
	ERR = 3,
	FAT = 4,
}

export class Logger {
	private static _level: Level = Level.INF;

	constructor() {}

	// eslint-disable-next-line
	private formatMessage(message: any) {
		if (typeof message === 'object') {
			return JSON.stringify(message);
		} else if (typeof message !== 'string') {
			return message.toString();
		}

		return message;
	}

	public debug(
		// eslint-disable-next-line
		message: any,
		key = '',
		value = '',
		color: ForegroundColor | BackgroundColor = ForegroundColor.Blue,
	) {
		if (Logger._level > Level.DEB) return;

		console.log(
			`${new Date().toJSON()} ${'|'.magenta().reset()} ${Importance.DEB.blueBg().reset()} ${'|'.magenta().reset()} ${key && value ? `[ ${color}${key.toUpperCase()}: ${value.toUpperCase()}${Style.Reset} ]` : ''} ${this.formatMessage(message)}`,
		);
	}

	public info(
		// eslint-disable-next-line
		message: any,
		key = '',
		value = '',
		color: ForegroundColor | BackgroundColor = ForegroundColor.Green,
	) {
		if (Logger._level > Level.INF) return;

		console.log(
			`${new Date().toJSON()} ${'|'.magenta().reset()} ${Importance.INF.green().reset()} ${'|'.magenta().reset()} ${key && value ? `[ ${color}${key.toUpperCase()}: ${value.toUpperCase()}${Style.Reset} ]` : ''} ${this.formatMessage(message)}`,
		);
	}

	public warn(
		// eslint-disable-next-line
		message: any,
		key = '',
		value = '',
		color: ForegroundColor | BackgroundColor = ForegroundColor.Yellow,
	) {
		if (Logger._level > Level.WAR) return;

		console.log(
			`${new Date().toJSON()} ${'|'.magenta().reset()} ${Importance.WAR.yellow().reset()} ${'|'.magenta().reset()} ${key && value ? `[ ${color}${key.toUpperCase()}: ${value.toUpperCase()}${Style.Reset} ]` : ''} ${this.formatMessage(message)}`,
		);
	}

	public error(
		// eslint-disable-next-line
		message: any,
		key = '',
		value = '',
		color: ForegroundColor | BackgroundColor = ForegroundColor.Red,
	) {
		if (Logger._level > Level.ERR) return;

		console.log(
			`${new Date().toJSON()} ${'|'.magenta().reset()} ${Importance.ERR.redBg().reset()} ${'|'.magenta().reset()} ${key && value ? `[ ${color}${key.toUpperCase()}: ${value.toUpperCase()}${Style.Reset} ]` : ''} ${this.formatMessage(message)}`,
		);
	}

	public fatal(
		// eslint-disable-next-line
		message: any,
		key = '',
		value = '',
		color: ForegroundColor | BackgroundColor = ForegroundColor.Magenta,
	) {
		console.log(
			`${new Date().toJSON()} ${'|'.magenta().reset()} ${Importance.FAT.magentaBg().reset()} ${'|'.magenta().reset()} ${key && value ? `[ ${color}${key.toUpperCase()}: ${value.toUpperCase()}${Style.Reset} ]` : ''} ${this.formatMessage(message)}`,
		);
	}

	public static setLevel(level: Level) {
		this._level = level;
	}
}
