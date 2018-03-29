"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
const subdivx_1 = require("./subdivx");
class OriginFactory {
    static getOrigin(type) {
        console.log('Getting origin...', type);
        switch (type) {
            case main_1.default.ORIGINS.SUBDIVX:
                return new subdivx_1.default();
            default:
                throw new Error(`Cannot find origin ${type}`);
        }
    }
}
exports.default = OriginFactory;
//# sourceMappingURL=factory.js.map