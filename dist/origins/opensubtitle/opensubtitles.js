"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const opensubtitle_auth_1 = require("./opensubtitle-auth");
class OpenSubtitlesOrigin {
    constructor(username, password, lang, agent) {
        this.auth = new opensubtitle_auth_1.default(username, password, lang, agent);
        this.authenticate(this.auth);
    }
    search(text, tuneText) {
        return Promise.resolve([]);
    }
    download(sub, dest) {
        return Promise.reject('Error');
    }
    authenticate(data) {
        console.log(data);
    }
}
exports.default = OpenSubtitlesOrigin;
//# sourceMappingURL=opensubtitles.js.map