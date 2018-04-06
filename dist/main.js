"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const del = require("del");
const fs_1 = require("fs");
const path_1 = require("path");
const request = require("request");
const commons_1 = require("./utils/commons");
const factory_1 = require("./utils/factory");
const OMDBManager_1 = require("./managers/OMDBManager");
const TMDbManager_1 = require("./managers/TMDbManager");
class SubMarine {
    constructor() {
        this.OMDB = new OMDBManager_1.default();
        this.TMDb = new TMDbManager_1.default();
    }
    get(originType, filepath, langs) {
        let origin = factory_1.default.getOrigin(originType);
        let promise = Promise.resolve();
        if (origin.authRequired) {
            promise = promise.then(() => origin.authenticate());
        }
        promise = promise.then(() => commons_1.default.getMetaDataFromFilename(path_1.normalize(filepath)));
        promise = promise.then((meta) => this.TMDb.fill(meta));
        // promise = promise.then((meta) => this.OMDB.fill(meta));
        return promise.then((meta) => origin.search(meta, langs));
    }
    download(sub, path = './') {
        var date = new Date().getTime();
        var tempFile = `./temp_${date}`;
        var found = false;
        var type;
        return new Promise((resolve, reject) => {
            if (!sub.url) {
                console.error(chalk_1.default.red('Error: No URL.'));
                reject();
            }
            request(sub.url.toString())
                .on('response', function (response) {
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
                .on('close', function () {
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
                }).catch(() => {
                    del(tempFile);
                    console.log(chalk_1.default.red('Error!!'));
                    reject();
                });
            });
        });
        // var request = http.get(sub.url.toString() , function(response) {
        //   response.pipe(file);
        // });
    }
}
SubMarine.ORIGINS = {
    SUBDIVX: 'subdivx'
};
exports.default = SubMarine;
//# sourceMappingURL=main.js.map