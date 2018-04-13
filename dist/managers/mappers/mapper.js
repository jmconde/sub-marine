"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../utils/logger");
const util_1 = require("util");
class Mapper {
    constructor() {
        this.MAPS = new Map();
        this.log = logger_1.default.getInstance();
    }
    map(json, type) {
        var meta = {};
        var typeDef = this.MAPS.get(type.toUpperCase());
        if (!typeDef) {
            this.log.cError(logger_1.default.RED_BRIGHT, `No map defined for ${type} in mapper.`);
        }
        for (const key in typeDef) {
            if (typeDef.hasOwnProperty(key)) {
                const value = typeDef[key];
                if (util_1.isString(value)) {
                    this.setValue(meta, key, this.find(value, json));
                }
                else if (util_1.isFunction(value)) {
                    this.setValue(meta, key, value(json));
                }
            }
        }
        return meta;
    }
    find(path, obj) {
        var arr;
        var actual = Object.assign({}, obj);
        if (!path || !obj) {
            return;
        }
        arr = path.split('.');
        arr.forEach((s) => {
            if (actual) {
                actual = actual[s];
            }
        });
        return actual;
    }
    setValue(meta, field, value) {
        if (value) {
            meta[field] = value;
        }
    }
    add(key, value) {
        this.MAPS.set(key, value);
    }
}
exports.default = Mapper;
//# sourceMappingURL=mapper.js.map