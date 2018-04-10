"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const del = require("del");
const fs_1 = require("fs");
const path_1 = require("path");
const request = require("request");
const OMDBManager_1 = require("./managers/OMDBManager");
const TMDbManager_1 = require("./managers/TMDbManager");
const commons_1 = require("./utils/commons");
const factory_1 = require("./utils/factory");
const FilenameManager_1 = require("./managers/FilenameManager");
const logger_1 = require("./utils/logger");
const matadataStore_1 = require("./utils/matadataStore");
class SubMarine {
    constructor() {
        this.OMDB = new OMDBManager_1.default();
        this.TMDb = new TMDbManager_1.default();
        this.log = logger_1.default.Instance;
        this.Filename = new FilenameManager_1.default();
        this.store = matadataStore_1.default.Instance;
    }
    get(originType, filepath, langs) {
        this.log.setLevel('all');
        let origin;
        let promise = Promise.resolve();
        origin = factory_1.default.getOrigin(originType);
        if (origin.authRequired) {
            promise = promise.then(() => origin.authenticate());
        }
        promise = this.getMetadata(filepath)
            .then(meta => origin.search(meta, langs));
        // promise = promise.then(() => [])
        //   // promise.then((meta) => );
        //   // promise = promise.catch(() => []);
        return promise;
    }
    getMetadata(filePath) {
        console.log(chalk_1.default.greenBright(this.log.getLevel()));
        return this.Filename.fill({ path: path_1.normalize(filePath) })
            .then(fileMeta => {
            this.log.debug(chalk_1.default.blueBright(JSON.stringify(fileMeta, null, 2)));
            this.store.set(this.Filename.ID, fileMeta);
            return fileMeta;
        })
            .then((meta) => this.TMDb.fill(meta))
            .then(TMDbMeta => {
            this.log.debug(chalk_1.default.yellowBright(JSON.stringify(TMDbMeta, null, 2)));
            this.store.set(this.TMDb.ID, TMDbMeta);
            return TMDbMeta;
        })
            .then(meta => this.OMDB.fill(meta))
            .then(OMDBMeta => {
            console.log('================================');
            this.store.set(this.OMDB.ID, OMDBMeta);
            return this.store.get(this.TMDb.ID);
        })
            /*
            .then((meta) => this.OMDB.fill(meta).catch(err => Promise.resolve<Metadata>(meta)))
            .then(OMDBMeta => {
              this.log.debug(chalk.greenBright(JSON.stringify(OMDBMeta, null, 2)));
              this.store.set(this.OMDB.ID, OMDBMeta);
              return OMDBMeta;
            }) */
            .catch(err => this.log.error(err));
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