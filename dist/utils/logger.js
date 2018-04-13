"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SimpleLogger = require("simple-node-logger");
const chalk_1 = require("chalk");
const util_1 = require("util");
class Logger {
    constructor(level = 'info') {
        this.logger = SimpleLogger.createSimpleLogger();
        this.logger.setLevel(level);
        this.info = this.logger.info;
        this.trace = this.logger.trace;
        this.debug = this.logger.debug;
        this.warn = this.logger.warn;
        this.error = this.logger.error;
        this.fatal = this.logger.fatal;
        this.all = this.logger.info;
        this.off = this.logger.off;
        this.log = this.logger.log;
        this.getLevel = this.logger.getLevel;
    }
    setLevel(level) {
        this.logger.setLevel(level);
    }
    colored(level, color, ...msg) {
        msg = msg.map(d => util_1.isObject(d) ? JSON.stringify(d, null, 2) : d);
        this[level](chalk_1.default[color](...msg));
    }
    cInfo(color, ...msg) {
        this.colored('info', color, ...msg);
    }
    cDebug(color, ...msg) {
        this.colored('debug', color, ...msg);
    }
    cTrace(color, ...msg) {
        this.colored('trace', color, ...msg);
    }
    cWarn(color, ...msg) {
        this.colored('warn', color, ...msg);
    }
    cError(color, ...msg) {
        this.colored('error', color, ...msg);
    }
    cFatal(color, ...msg) {
        this.colored('fatal', color, ...msg);
    }
    static getInstance(level) {
        return this._instance || (this._instance = new this(level));
    }
}
Logger.BLACK_BRIGHT = 'blackBright';
Logger.BLACK = 'black';
Logger.BLUE_BRIGHT = 'blueBright';
Logger.BLUE = 'blue';
Logger.CYAN_BRIGHT = 'cyanBright';
Logger.CYAN = 'cyan';
Logger.GREEN_BRIGHT = 'greenBright';
Logger.GREEN = 'green';
Logger.RED_BRIGHT = 'redBright';
Logger.RED = 'red';
Logger.YELLOW_BRIGHT = 'yellowBright';
Logger.YELLOW = 'yellow';
Logger.GRAY = 'gray';
Logger.GREY = 'grey';
Logger.MAGENTA_BRIGHT = 'magentaBright';
Logger.MAGENTA = 'magenta';
Logger.WHITE_BRIGHT = 'whiteBright';
Logger.WHITE = 'white';
exports.default = Logger;
//# sourceMappingURL=logger.js.map