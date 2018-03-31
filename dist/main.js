"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const del = require("del");
const fs_1 = require("fs");
const request = require("request");
const commons_1 = require("./commons");
const factory_1 = require("./factory");
class SubMarine {
    get(originType, textToSearch, tuneText) {
        let origin = factory_1.default.getOrigin(originType);
        return origin.search(textToSearch, tuneText);
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