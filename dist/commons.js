"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const fs_1 = require("fs");
const unrar = require("node-unrar-js");
const unzip = require("unzip");
class Commons {
    static getBaseTitle(sub, filename, index = 0) {
        var indexStr = index > 0 ? `.${index}` : '';
        var ext = filename.split('.').pop();
        var title = sub.title.replace(/\s/g, '.');
        return `${title}${indexStr}.${sub.lang}.${ext}`;
    }
    static isSubtitle(filename) {
        return (/\.(srt|ssa|sub|sbv|mpsub|lrc|cap)$/i).test(filename);
    }
    static unzip(zipFile, dest, sub) {
        console.log(chalk_1.default.grey('Unzipping...'));
        return new Promise((resolve, reject) => {
            fs_1.createReadStream(zipFile)
                .pipe(unzip.Parse())
                .on('entry', entry => {
                var i = 0;
                var fname;
                if (entry.type === 'File' && this.isSubtitle(entry.path)) {
                    fname = this.getBaseTitle(sub, entry.path, i++);
                    entry.pipe(fs_1.createWriteStream(`${dest}/${fname}`)
                        .on('close', function () {
                        console.log(chalk_1.default.yellow(`File '${entry.path}' extracted as ${dest}/${fname}.`));
                    }));
                }
                else {
                    entry.autodrain();
                }
            })
                .on('close', () => resolve())
                .on('error', () => reject());
        });
    }
    static unrar(rarFile, dest, sub) {
        console.log(chalk_1.default.grey('Unarchiving RAR...'));
        var buf = Uint8Array.from(fs_1.readFileSync(rarFile)).buffer;
        var extractor = unrar.createExtractorFromData(buf);
        var downloadList = [];
        var list = extractor.getFileList();
        var i = 0;
        var suffix = '';
        var ext, filename, extracted;
        return new Promise((resolve, reject) => {
            if (list[0].state === "SUCCESS" && list[1] !== null) {
                list[1].fileHeaders.forEach((file) => {
                    if (!file.flags.directory) {
                        downloadList.push(file.name);
                    }
                });
            }
            else {
                reject();
                return;
            }
            extracted = extractor.extractFiles(downloadList);
            if (extracted[0].state === "SUCCESS") {
                extracted[1].files.forEach(file => {
                    var buffer;
                    if (file.extract[0].state === "SUCCESS") {
                        buffer = file.extract[1];
                        filename = this.getBaseTitle(sub, file.fileHeader.name, i++);
                        //  // Uint8Array
                        fs_1.appendFileSync(`${dest}/${filename}`, new Buffer(buffer));
                        console.log(chalk_1.default.yellow(`File '${file.fileHeader.name}' extracted as '${dest}/${filename}'.`));
                    }
                });
                resolve();
            }
            else {
                reject();
            }
        });
    }
}
exports.default = Commons;
//# sourceMappingURL=commons.js.map