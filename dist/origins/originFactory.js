"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const subdivx_1 = require("./subdivx/subdivx");
const opensubtitles_1 = require("./opensubtitles/opensubtitles");
const origin_types_1 = require("../utils/origin-types");
const logger_1 = require("../utils/logger");
class OriginFactory {
    static getOrigin(type) {
        console.log('Getting origin...', type);
        switch (type) {
            case origin_types_1.default.ORIGIN.SUBDIVX:
                return new subdivx_1.default();
            case origin_types_1.default.ORIGIN.OPEN_SUBTITLES:
                return new opensubtitles_1.default('jose.conde@gmail.com', 'nevada98', 'en', 'TemporaryUserAgent');
            default:
                throw new Error(`Cannot find origin ${type}`);
        }
    }
}
OriginFactory.log = logger_1.default.getInstance();
exports.default = OriginFactory;
//# sourceMappingURL=originFactory.js.map