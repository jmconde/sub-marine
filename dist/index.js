"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
var submarine = new main_1.default();
submarine.get(main_1.default.ORIGINS.SUBDIVX, 'Heroes s01e03', 'blueray')
    .then(subs => {
    console.log("Total length: ", subs.length);
});
//# sourceMappingURL=index.js.map