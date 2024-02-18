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
    FAT = 4
}

export class Logger {
    private static _level: Level = Level.INF;

    constructor() {

    }

    private formatMessage(message: any) {
        if (message === 'object') {
            return JSON.stringify(message);
        } else if (message !== 'string') {
            return message.toString();
        }

        return message;
     }

    public debug(message: any, key = "", value = "", color: ForegroundColor | BackgroundColor = ForegroundColor.White) {
        if (Logger._level > Level.DEB) return;

        console.log(`${new Date().toJSON()} ${'|'.magenta().reset()} ${Importance.DEB.blueBg().reset()} ${'|'.magenta().reset()} ${key && value ? `[ ${color}${key.toUpperCase()}: ${value.toUpperCase()}${Style.Reset} ]` : ''} ${this.formatMessage(message)}`)

    }

    public info(message: any, key = "", value = "", color: ForegroundColor | BackgroundColor = ForegroundColor.White) {
        if (Logger._level > Level.INF) return;

        console.log(`${new Date().toJSON()} ${'|'.magenta().reset()} ${Importance.INF.green().reset()} ${'|'.magenta().reset()} ${key && value ? `[ ${color}${key.toUpperCase()}: ${value.toUpperCase()}${Style.Reset} ]` : ''} ${this.formatMessage(message)}`)

    }

    public warn(message: any, key = "", value = "", color: ForegroundColor | BackgroundColor = ForegroundColor.White) {
        if (Logger._level > Level.WAR) return;

        console.log(`${new Date().toJSON()} ${'|'.magenta().reset()} ${Importance.WAR.yellow().reset()} ${'|'.magenta().reset()} ${key && value ? `[ ${color}${key.toUpperCase()}: ${value.toUpperCase()}${Style.Reset} ]` : ''} ${this.formatMessage(message)}`)


    }

    public error(message: any, key = "", value = "", color: ForegroundColor | BackgroundColor = ForegroundColor.White) {
        if (Logger._level > Level.ERR) return;

        console.log(`${new Date().toJSON()} ${'|'.magenta().reset()} ${Importance.ERR.redBg().reset()} ${'|'.magenta().reset()} ${key && value ? `[ ${color}${key.toUpperCase()}: ${value.toUpperCase()}${Style.Reset} ]` : ''} ${this.formatMessage(message)}`)


    }

    public fatal(message: any, key = "", value = "", color: ForegroundColor | BackgroundColor = ForegroundColor.White) {
        console.log(`${new Date().toJSON()} ${'|'.magenta().reset()} ${Importance.FAT.magentaBg().reset()} ${'|'.magenta().reset()} ${key && value ? `[ ${color}${key.toUpperCase()}: ${value.toUpperCase()}${Style.Reset} ]` : ''} ${this.formatMessage(message)}`)


    }

    public static setLevel(level: Level) {
        this._level = level;
    }
}