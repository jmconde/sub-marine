"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xmlrpc_1 = require("xmlrpc");
class OpensubtitlesManager {
    constructor(auth) {
        this.auth = auth;
    }
    call(method, data, login) {
        return new Promise((resolve, reject) => {
            var client = xmlrpc_1.createClient({
                host: 'api.opensubtitles.org',
                port: 80,
                path: '/xml-rpc'
            });
            if (typeof login === 'undefined' || login === false) {
                data = [this.auth.token, data];
            }
            client.methodCall(method, data, (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }
}
exports.default = OpensubtitlesManager;
//# sourceMappingURL=opensubtitlesManager.js.map