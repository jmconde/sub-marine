"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const querystring_1 = require("querystring");
const uriTemplate = require("uri-templates");
const logger_1 = require("../utils/logger");
const chalk_1 = require("chalk");
class ApiManager {
    constructor() {
        this.log = logger_1.default.getInstance();
    }
    get(path = '', query, type) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.rawGet(path, query)
                .then(json => {
                var code = this.check(json);
                this.log.colored('debug', 'magentaBright', json);
                if (code === 0)
                    return this.mapper.map(json, type);
                else {
                    console.log(chalk_1.default.gray('not found', path));
                    return undefined;
                }
            });
        });
    }
    rawGet(path = '', query) {
        return __awaiter(this, void 0, void 0, function* () {
            var url = this.getUrl(query, path);
            return this.makeRequest(url, 'get');
        });
    }
    list(path = '', query, type) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.makeRequest(this.getUrl(query, path), 'get')
                .then(json => {
                if (this.LIST_DATA_PATH) {
                    json = json[this.LIST_DATA_PATH];
                }
                return json.map(d => this.mapper.map(d, type));
            });
        });
    }
    getToken(tokenId) {
        var tokens = {
            omdb: {
                name: 'apiKey',
                token: '6917d31e'
            },
            tmdb: {
                name: 'api_key',
                token: 'e03b8ee55f0715ceef0a188e53ad593d'
            }
        };
        return tokens[tokenId];
    }
    getUrl(query, path = '') {
        var token;
        query = query || {};
        if (this.ID) {
            token = this.getToken(this.ID);
            if (token) {
                query[token.name] = token.token;
            }
        }
        return new uriTemplate(this.URL + path + '{?params*}').fillFromObject({ params: query });
        ;
    }
    getPath(path, data) {
        return new uriTemplate(path).fill(data);
    }
    makeRequest(url, method = 'get', body) {
        var postData;
        var data = [];
        this.log.cInfo(logger_1.default.MAGENTA_BRIGHT, '->', url);
        return new Promise((resolve, reject) => {
            var req = http_1.request(url, res => {
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    data.push(chunk);
                });
                res.on('end', () => {
                    var json = JSON.parse(data.join(''));
                    resolve(json);
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
ApiManager.REPONSE_OK = 0;
ApiManager.REPONSE_NOT_FOUND = 1;
exports.default = ApiManager;
//# sourceMappingURL=apiManager.js.map