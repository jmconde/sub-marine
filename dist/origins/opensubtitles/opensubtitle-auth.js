"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class OpenSubtitleAuth {
    constructor(username, password, lang, agent) {
        this.authenticated = false;
        this.username = username;
        this.password = password;
        this.lang = lang;
        this.agent = agent;
    }
    getAuthData() {
        return [this.username, this.password, this.lang, this.agent];
    }
    setRaw(raw) {
        this.raw = raw;
    }
    getRaw() {
        return this.raw;
    }
}
exports.default = OpenSubtitleAuth;
//# sourceMappingURL=opensubtitle-auth.js.map