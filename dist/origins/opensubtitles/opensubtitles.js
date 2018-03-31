"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const opensubtitle_auth_1 = require("./opensubtitle-auth");
const xml2js_1 = require("xml2js");
const axios_1 = require("axios");
class OpenSubtitlesOrigin {
    constructor(username, password, lang, agent) {
        this.ENDPOINT = 'https://api.opensubtitles.org/xml-rpc';
        this.authRequired = true;
        this.setAuthData(username, password, lang, agent);
        this.authenticated = false;
    }
    search(text, tuneText) {
        return Promise.reject('Error xxx');
    }
    download(sub, dest) {
        return Promise.reject('Error');
    }
    setAuthData(username, password, lang, agent) {
        this.auth = new opensubtitle_auth_1.default(username, password, lang, agent);
    }
    authenticate() {
        if (!this.auth) {
            Promise.reject('No auth data.');
            return;
        }
        return new Promise((resolve, reject) => {
            var builder = new xml2js_1.Builder();
            var reqXml = builder.buildObject(this.auth.getAuthData());
            axios_1.default.post(this.ENDPOINT, reqXml, {
                headers: { 'Content-Type': 'text/xml' }
            }).then(res => {
                var parser = new xml2js_1.Parser();
                parser.parseString(res.data, (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    console.dir(result);
                    this.authenticated = true;
                    resolve();
                });
            });
        });
    }
}
exports.default = OpenSubtitlesOrigin;
//# sourceMappingURL=opensubtitles.js.map