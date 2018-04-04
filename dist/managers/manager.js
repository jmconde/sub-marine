"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const querystring_1 = require("querystring");
const URI = require("urijs");
class Manager {
    get(options, meta) {
        console.log('In OMDBManager getMovie');
        return this.makeRequest(this.getUrl(options), 'get', meta);
    }
    getToken(tokenId) {
        var tokens = {
            omdb: '6917d31e',
            tmdb: 'e03b8ee55f0715ceef0a188e53ad593d'
        };
        return tokens[tokenId];
    }
    getUrl(options) {
        var uri = new URI(this.URL);
        uri.query(options);
        return uri.toString();
    }
    makeRequest(url, method = 'get', meta, body) {
        // var options = new URL(url);
        var postData;
        var data = [];
        return new Promise((resolve, reject) => {
            console.log('->', url);
            var req = http_1.request(url, res => {
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    data.push(chunk);
                });
                res.on('end', () => {
                    var json = JSON.parse(data.join(''));
                    resolve(this.mapper(json, meta));
                });
            });
            req.on('error', (e) => {
                reject(e);
            });
            if (method !== 'get') {
                postData = querystring_1.stringify(body);
                req.write(postData);
            }
            req.end();
        });
    }
}
exports.default = Manager;
//# sourceMappingURL=manager.js.map