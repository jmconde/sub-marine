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
const FilenameManager_1 = require("./managers/FilenameManager");
const OMDBManager_1 = require("./managers/OMDBManager");
const TMDbManager_1 = require("./managers/TMDbManager");
const TVMazeManager_1 = require("./managers/TVMazeManager");
const originFactory_1 = require("./origins/originFactory");
const commons_1 = require("./utils/commons");
const logger_1 = require("./utils/logger");
const origin_types_1 = require("./utils/origin-types");
const util_1 = require("util");
class SubMarine {
    constructor() {
        this.log = logger_1.default.getInstance('error');
        this.Filename = new FilenameManager_1.default();
        var config = this.config = commons_1.default.readJson('./submarineconfig.json');
        this.OMDB = new OMDBManager_1.default(config.datasource.omdb);
        this.TMDb = new TMDbManager_1.default(config.datasource.tmdb);
        this.TVMaze = new TVMazeManager_1.default(config.datasource.tvmaze);
    }
    /**
     * Gets a list of donwloadable subtitles.
     *
     * @param originTypes array of subtitle databases IDs (origin)
     * @param filepath File to search for subtitles and info
     * @param langs langs required in ISO 639-1 code
     */
    get(originTypes, filepath, langs) {
        return __awaiter(this, void 0, void 0, function* () {
            let promise = Promise.resolve();
            var subs = [];
            var search;
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                var info = yield this.getFileInfo(filepath);
                var metadataMap = yield this.getMetadata(info);
                this.log.cDebug(logger_1.default.YELLOW_BRIGHT, search);
                subs = yield this.getSubs(this.getOrigins(originTypes), metadataMap, info, langs);
                resolve(subs);
            }));
        });
    }
    getOrigins(types) {
        return types.map(type => {
            return originFactory_1.default.getOrigin(type);
        });
    }
    getSubs(origins, metadataMap, info, langs) {
        return __awaiter(this, void 0, void 0, function* () {
            var promises = [];
            var search = {
                fileInfo: info,
                searchString: commons_1.default.getSearchText(info),
                langs,
                metadata: null,
                registry: new Map()
            };
            origins.forEach(origin => {
                search.registry.set(origin.ID, []);
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
                return fileInfo;
            });
        });
    }
    getMetadata(info) {
        return __awaiter(this, void 0, void 0, function* () {
            var map = new Map();
            var omdb = yield this.OMDB.fill(info);
            var tmdb = yield this.TMDb.fill(info);
            var tvmaze;
            if (omdb)
                map.set(this.OMDB.ID, omdb);
            if (tmdb)
                map.set(this.TMDb.ID, tmdb);
            if (info.type === origin_types_1.default.FILE.EPISODE) {
                tvmaze = yield this.TVMaze.fill(info);
                if (tvmaze)
                    map.set(this.TVMaze.ID, tvmaze);
            }
            return Promise.resolve(map);
        });
    }
    download(subs, path) {
        return __awaiter(this, void 0, void 0, function* () {
            var promises = [];
            if (!util_1.isArray(subs)) {
                subs = [subs];
            }
            promises = subs.map(sub => {
                return this.downloadSingleSub(sub, path);
            });
            return new Promise((resolve, reject) => {
                Promise.all(promises).then(() => {
                    console.log(chalk_1.default.gray('Process finished'));
                    resolve();
                });
            });
        });
    }
    ;
    downloadSingleSub(sub, path) {
        var date = new Date().getTime();
        var tempFile = `./temp_${date}`;
        var found = false;
        var type;
        path = path || sub.file.path;
        return new Promise((resolve, reject) => {
            if (!sub.url) {
                console.error(chalk_1.default.red('Error: No URL.'));
                resolve();
                return;
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
                    del.sync(tempFile);
                    resolve();
                }).catch(e => {
                    del.sync(tempFile);
                    this.log.error(chalk_1.default.red('Error!!', e));
                    resolve();
                });
            });
        });
    }
}
exports.default = SubMarine;
//# sourceMappingURL=main.js.map