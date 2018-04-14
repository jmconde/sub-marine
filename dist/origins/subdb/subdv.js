"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const origin_types_1 = require("../../utils/origin-types");
const axios_1 = require("axios");
class SubDBOrigin {
    constructor() {
        this.ID = origin_types_1.default.ORIGIN.SUBDB;
        this.authRequired = false;
        this.URL = 'http://api.thesubdb.com';
    }
    search(search) {
        var registry = search.registry.get(origin_types_1.default.ORIGIN.SUBDB);
        var hash = search.fileInfo.hashes[origin_types_1.default.ORIGIN.SUBDB].hash;
        return new Promise((resolve, reject) => {
            if (!hash || registry.indexOf(hash.hash) !== -1) {
                resolve([]);
                return;
            }
            this.get({
                action: 'search',
                hash
            }).then(data => {
            });
        });
    }
    get(params) {
        return axios_1.default.get(this.URL, {
            headers: { 'User-Agent': 'SubDB/1.0 (Submarine/0.1; http://github.com/jmconde/sub-marine)' },
            responseType: 'json',
            params
        }).then(response => {
            return response.data;
        });
    }
    download(sub, dest) {
        return Promise.reject('Error');
    }
}
exports.default = SubDBOrigin;
//# sourceMappingURL=subdv.js.map