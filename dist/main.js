"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const factory_1 = require("./factory");
class SubMarine {
    constructor() {
        console.log('Test');
        this.text = ' Test text ';
    }
    get(originType, textToSearch, destination) {
        let origin = factory_1.default.getOrigin(originType);
        return origin.search(textToSearch);
    }
}
SubMarine.ORIGINS = {
    SUBDIVX: 'subdivx'
};
exports.default = SubMarine;
//# sourceMappingURL=main.js.map