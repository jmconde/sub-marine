import * as SimpleLogger from "simple-node-logger";
import chalk from "chalk";
import { isObject } from "util";

export default class Logger {
  private static _instance: Logger;

  static BLACK_BRIGHT: string = 'blackBright';
  static BLACK: string = 'black';
  static BLUE_BRIGHT: string = 'blueBright';
  static BLUE: string = 'blue';
  static CYAN_BRIGHT: string = 'cyanBright';
  static CYAN: string = 'cyan';
  static GREEN_BRIGHT: string = 'greenBright';
  static GREEN: string = 'green';
  static RED_BRIGHT: string = 'redBright';
  static RED: string = 'red';
  static YELLOW_BRIGHT: string = 'yellowBright';
  static YELLOW: string = 'yellow';
  static GRAY: string = 'gray';
  static GREY: string = 'grey';
  static MAGENTA_BRIGHT: string = 'magentaBright';
  static MAGENTA: string = 'magenta';
  static WHITE_BRIGHT: string = 'whiteBright';
  static WHITE: string = 'white';

  private logger;
  info: Function;
  trace: Function;
  debug: Function;
  warn: Function;
  error : Function;
  fatal : Function;
  all : Function;
  off: Function;
  log: Function;
  getLevel: Function;

  private constructor(level: string = 'info') {
    this.logger = SimpleLogger.createSimpleLogger();
    this.logger.setLevel(level);
    this.info = this.logger.info;
    this.trace = this.logger.trace;
    this.debug = this.logger.debug;
    this.warn = this.logger.warn;
    this.error  = this.logger.error ;
    this.fatal = this.logger.fatal;
    this.all = this.logger.info;
    this.off = this.logger.off;
    this.log = this.logger.log;
    this.getLevel = this.logger.getLevel;
    console.log(chalk.greenBright(`New Logger instance: ${level}`));
  }

  setLevel(level: string) {
    this.logger.setLevel(level);
  }

  colored (level: string, color: string, msg: any) {
    if (isObject(msg)) {
      msg = JSON.stringify(msg, null, 2);
    }
    this[level](chalk[color](msg));
  }

  cInfo(color: string, msg: any) {
    this.colored('info', color, msg);
  }

  cDebug(color: string, msg: any) {
    this.colored('debug', color, msg);
  }

  cTrace(color: string, msg: any) {
    this.colored('trace', color, msg);
  }

  cWarn(color: string, msg: any) {
    this.colored('warn', color, msg);
  }

  cError(color: string, msg: any) {
    this.colored('error', color, msg);
  }

  cFatal(color: string, msg: any) {
    this.colored('fatal', color, msg);
  }

  static getInstance(level?: string): Logger {
    return this._instance || (this._instance = new this(level));
  }
}