"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const opensubtitle_utils_1 = require("./opensubtitle-utils");
class OpenSubtitleAuth {
    constructor(username, password, lang, agent) {
        this.data = opensubtitle_utils_1.getRequestMessage('LogIn', [username, password, lang, agent]);
    }
    getAuthData() {
        return this.data;
    }
}
exports.default = OpenSubtitleAuth;
//# sourceMappingURL=opensubtitle-auth.js.map