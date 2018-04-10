"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
class Mapper {
    map(json, type) {
        var meta = {};
        meta.type = type;
        for (const key in this.MAP_DEF) {
            if (this.MAP_DEF.hasOwnProperty(key)) {
                const value = this.MAP_DEF[key];
                if (util_1.isString(value)) {
                    this.add(meta, key, this.find(value, json));
                }
                else if (util_1.isFunction(value)) {
                    this.add(meta, key, value(json));
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
    add(meta, field, value) {
        if (value) {
            meta[field] = value;
        }
    }
}
exports.default = Mapper;
//# sourceMappingURL=mapper.js.map