import * as SimpleLogger from "simple-node-logger";
import chalk from "chalk";
import { isObject } from "util";

export default class Logger {
  private static _instance: Logger;

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
  setLevel: Function;
  getLevel: Function;

  private constructor() {
    this.logger = SimpleLogger.createSimpleLogger();
    this.info = this.logger.info;
    this.trace = this.logger.trace;
    this.debug = this.logger.debug;
    this.warn = this.logger.warn;
    this.error  = this.logger.error ;
    this.fatal = this.logger.fatal;
    this.all = this.logger.info;
    this.off = this.logger.off;
    this.log = this.logger.log;
    this.setLevel = this.logger.setLevel;
    this.getLevel = this.logger.getLevel;
    console.log(chalk.greenBright('New Logger instance'));
    console.log(this.logger.getLevel());
  }

  colored (level: string, color: string, msg: any) {
    if (isObject(msg)) {
      msg = JSON.stringify(msg, null, 2);
    }
    this[level](chalk[color](msg));
  }

  static get Instance(): Logger {
    return this._instance || (this._instance = new this());
  }
}