"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Langs = require("langs");
class default_1 {
    static getValue(field, code, array = this.available) {
        var name = code;
        let i = 0;
        for (; i < this.available.length; i++) {
            const d = this.available[i];
            if (Langs.has(d, code))
                return Langs.where(d, code)[field];
        }
        return name;
    }
    static getName(code) {
        return this.getValue('name', code);
    }
    static getLocal(code) {
        return this.getValue('local', code);
    }
}
default_1.available = ['1', '2', '2T', '2B', '3', 'name', 'local'];
exports.default = default_1;
//# sourceMappingURL=lang.js.map