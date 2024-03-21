import { BackgroundColor } from '../../enums/backgroundColor';
import { ForegroundColor } from '../../enums/foregroundColor';
import { Importance } from '../../enums/importance';
import { Status } from '../../enums/status';
import { Style } from '../../enums/style';
import '../../string/string.extensions';

export enum Level {
	DEB = 0,
	INF = 1,
	WAR = 2,
	ERR = 3,
	FAT = 4,
}

class LogData {
	logLevel: string;
	key: string;
	value: string;
	message: string;
	timestamp: string;
	userId: string = '';
	status: Status = Status.NONE;

	constructor(logLevel: string, key: string, value: string, message: string, timestamp: string) {
		this.logLevel = logLevel;
		this.key = key;
		this.value = value;
		this.message = message;
		this.timestamp = timestamp;
	}
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
		color?: ForegroundColor | BackgroundColor,
		callback?: (logData: LogData) => void
	) {
		if (Logger._level > Level.DEB) return;

		const now = new Date().toJSON();

		console.log(
			`${now} ${'|'.magenta().reset()} ${Importance.DEB.blueBg().reset()} ${'|'.magenta().reset()} ${key && value ? `[ ${color ?? ForegroundColor.Blue}${key.toUpperCase()}: ${value.toUpperCase()}${Style.Reset} ]` : ''} ${this.formatMessage(message)}`,
		);

		if (callback) {
			const logData = new LogData(Importance.DEB, key, value, message, now);
			callback(logData);
		}
	}

	public info(
		// eslint-disable-next-line
		message: any,
		key = '',
		value = '',
		color?: ForegroundColor | BackgroundColor,
		callback?: (logData: LogData) => void
	) {
		if (Logger._level > Level.INF) return;

		const now = new Date().toJSON();

		console.log(
			`${now} ${'|'.magenta().reset()} ${Importance.INF.green().reset()} ${'|'.magenta().reset()} ${key && value ? `[ ${color ?? ForegroundColor.Green}${key.toUpperCase()}: ${value.toUpperCase()}${Style.Reset} ]` : ''} ${this.formatMessage(message)}`,
		);

		if (callback) {
			const logData = new LogData(Importance.INF, key, value, message, now);
			callback(logData);
		}
	}

	public warn(
		// eslint-disable-next-line
		message: any,
		key = '',
		value = '',
		color?: ForegroundColor | BackgroundColor,
		callback?: (logData: LogData) => void
	) {
		if (Logger._level > Level.WAR) return;

		const now = new Date().toJSON();

		console.log(
			`${now} ${'|'.magenta().reset()} ${Importance.WAR.yellow().reset()} ${'|'.magenta().reset()} ${key && value ? `[ ${color ?? ForegroundColor.Yellow}${key.toUpperCase()}: ${value.toUpperCase()}${Style.Reset} ]` : ''} ${this.formatMessage(message)}`,
		);

		if (callback) {
			const logData = new LogData(Importance.WAR, key, value, message, now);
			callback(logData);
		}
	}

	public error(
		// eslint-disable-next-line
		message: any,
		key = '',
		value = '',
		color?: ForegroundColor | BackgroundColor,
		callback?: (logData: LogData) => void
	) {
		if (Logger._level > Level.ERR) return;

		const now = new Date().toJSON();

		console.log(
			`${new Date().toJSON()} ${'|'.magenta().reset()} ${Importance.ERR.redBg().reset()} ${'|'.magenta().reset()} ${key && value ? `[ ${color ?? ForegroundColor.Red}${key.toUpperCase()}: ${value.toUpperCase()}${Style.Reset} ]` : ''} ${this.formatMessage(message)}`,
		);

		if (callback) {
			const logData = new LogData(Importance.ERR, key, value, message, now);
			callback(logData);
		}
	}

	public fatal(
		// eslint-disable-next-line
		message: any,
		key = '',
		value = '',
		color?: ForegroundColor | BackgroundColor,
		callback?: (logData: LogData) => void
	) {
		const now = new Date().toJSON();

		console.log(
			`${new Date().toJSON()} ${'|'.magenta().reset()} ${Importance.FAT.magentaBg().reset()} ${'|'.magenta().reset()} ${key && value ? `[ ${color ?? ForegroundColor.Magenta}${key.toUpperCase()}: ${value.toUpperCase()}${Style.Reset} ]` : ''} ${this.formatMessage(message)}`,
		);

		if (callback) {
			const logData = new LogData(Importance.FAT, key, value, message, now);
			callback(logData);
		}
	}

	public static setLevel(level: Level) {
		this._level = level;
	}
}
