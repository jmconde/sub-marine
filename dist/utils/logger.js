"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SimpleLogger = require("simple-node-logger");
const chalk_1 = require("chalk");
const util_1 = require("util");
class Logger {
    constructor() {
        this.logger = SimpleLogger.createSimpleLogger();
        this.info = this.logger.info;
        this.trace = this.logger.trace;
        this.debug = this.logger.debug;
        this.warn = this.logger.warn;
        this.error = this.logger.error;
        this.fatal = this.logger.fatal;
        this.all = this.logger.info;
        this.off = this.logger.off;
        this.log = this.logger.log;
        this.setLevel = this.logger.setLevel;
        this.getLevel = this.logger.getLevel;
        console.log(chalk_1.default.greenBright('New Logger instance'));
        console.log(this.logger.getLevel());
    }
    colored(level, color, msg) {
        if (util_1.isObject(msg)) {
            msg = JSON.stringify(msg, null, 2);
        }
        this[level](chalk_1.default[color](msg));
    }
    static get Instance() {
        return this._instance || (this._instance = new this());
    }
}
exports.default = Logger;
//# sourceMappingURL=logger.js.map