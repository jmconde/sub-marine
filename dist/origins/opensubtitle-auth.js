"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class OpenSubtitleAuth {
    constructor(username, password, lang, agent) {
        this.data = {
            methodCall: {
                methodName: 'LogIn',
                params: [username, password, lang, agent]
            }
        };
    }
    getAuthData() {
        return this.data;
    }
}
exports.default = OpenSubtitleAuth;
//# sourceMappingURL=opensubtitle-auth.js.map