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
const chalk_1 = require("chalk");
const del = require("del");
const fs_1 = require("fs");
const path_1 = require("path");
const request = require("request");
const OMDBManager_1 = require("./managers/OMDBManager");
const TMDbManager_1 = require("./managers/TMDbManager");
const TVMazeManager_1 = require("./managers/TVMazeManager");
const commons_1 = require("./utils/commons");
const originFactory_1 = require("./origins/originFactory");
const FilenameManager_1 = require("./managers/FilenameManager");
const logger_1 = require("./utils/logger");
const matadataStore_1 = require("./utils/matadataStore");
const origin_types_1 = require("./utils/origin-types");
class SubMarine {
    constructor() {
        this.OMDB = new OMDBManager_1.default();
        this.TMDb = new TMDbManager_1.default();
        this.TVMaze = new TVMazeManager_1.default();
        this.log = logger_1.default.getInstance();
        this.Filename = new FilenameManager_1.default();
        this.store = matadataStore_1.default.Instance;
    }
    get(originType, filepath, langs) {
        return __awaiter(this, void 0, void 0, function* () {
            let origin;
            let promise = Promise.resolve();
            var subs = [];
            var search;
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                var info = yield this.getFileInfo(filepath);
                var metadataMap = yield this.getMetadata(info);
                this.log.cDebug(logger_1.default.YELLOW_BRIGHT, search);
                subs = yield this.getSubs([originFactory_1.default.getOrigin(origin_types_1.default.ORIGIN.SUBDIVX), originFactory_1.default.getOrigin(origin_types_1.default.ORIGIN.OPEN_SUBTITLES)], metadataMap, info);
                resolve(subs);
            }));
        });
    }
    // origin =  OriginFactory.getOrigin(originType);
    // if (origin.authRequired) {
    //   promise = promise.then(() => origin.authenticate());
    // }
    // promise = this.getMetadata(filepath)
    //   .then(meta => origin.search(meta, langs));
    // promise = promise.then(() => [])
    //   // promise.then((meta) => );
    //   // promise = promise.catch(() => []);
    getSubs(origins, metadataMap, info) {
        return __awaiter(this, void 0, void 0, function* () {
            var promises = [];
            var search = {
                fileInfo: info,
                searchString: commons_1.default.getSearchText(info),
                langs: [],
                metadata: null
            };
            console.log('GET SUBIS::::::::::::::::::::::::::::::');
            origins.forEach(origin => {
                metadataMap.forEach((meta, key) => {
                    var promise = Promise.resolve();
                    if (origin.authRequired) {
                        promise = promise.then(() => origin.authenticate());
                    }
                    search.metadata = meta;
                    promises.push(promise.then(() => origin.search(search)));
                });
            });
            return Promise.all(promises).then(r => {
                var subs = [];
                var urlMap = new Map();
                r.forEach(s => subs = subs.concat(s));
                subs = subs.reduce((acc, val) => {
                    var mapped = urlMap.get(val.url);
                    if (!mapped) {
                        acc.push(val);
                        urlMap.set(val.url, '=oOo=');
                    }
                    return acc;
                }, []).filter(s => typeof s.url === 'string');
                return Promise.resolve(subs);
            });
        });
    }
    getFileInfo(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.Filename.fill(path_1.normalize(path))
                .then(fileInfo => {
                this.log.debug(chalk_1.default.blueBright(JSON.stringify(fileInfo, null, 2)));
                this.store.set(this.Filename.ID, fileInfo);
                return fileInfo;
            });
        });
    }
    getMetadata(info) {
        return __awaiter(this, void 0, void 0, function* () {
            var map = new Map();
            map.set(this.OMDB.ID, yield this.OMDB.fill(info));
            map.set(this.TMDb.ID, yield this.TMDb.fill(info));
            if (info.type === origin_types_1.default.FILE.EPISODE) {
                map.set(this.TVMaze.ID, yield this.TVMaze.fill(info));
            }
            return Promise.resolve(map);
        });
    }
    download(sub, path) {
        var date = new Date().getTime();
        var tempFile = `./temp_${date}`;
        var found = false;
        var type;
        path = path || sub.meta.path.substring(0, sub.meta.path.lastIndexOf(path_1.sep));
        return new Promise((resolve, reject) => {
            if (!sub.url) {
                console.error(chalk_1.default.red('Error: No URL.'));
                reject();
            }
            request(sub.url.toString())
                .on('response', response => {
                switch (response.headers['content-type']) {
                    case 'application/x-rar-compressed':
                        type = 'rar';
                        break;
                    case 'application/zip':
                        type = 'zip';
                        break;
                    case 'text/plain':
                        type = 'txt';
                        break;
                }
            })
                .pipe(fs_1.createWriteStream(tempFile))
                .on('close', () => {
                var promise;
                if (type === 'zip') {
                    promise = commons_1.default.unzip(tempFile, path, sub);
                }
                else if (type === 'rar') {
                    promise = commons_1.default.unrar(tempFile, path, sub);
                }
                else if (type === 'txt') {
                    // TOOD:
                }
                else {
                    // TODO:
                }
                promise.then(() => {
                    console.log(chalk_1.default.gray('Process finished'));
                    del(tempFile);
                    resolve();
                }).catch(e => {
                    del(tempFile);
                    this.log.error(chalk_1.default.red('Error!!', e));
                    reject();
                });
            });
        });
    }
}
exports.default = SubMarine;
//# sourceMappingURL=main.js.map