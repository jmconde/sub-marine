"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const fs_1 = require("fs");
const unrar = require("node-unrar-js");
const path_1 = require("path");
const unzip = require("unzip");
const logger_1 = require("./logger");
const origin_types_1 = require("./origin-types");
class Commons {
    static numRightPad(value, num = 2) {
        return new String(Math.pow(10, num) + value).substring(1);
    }
    static getFileBaseTitle(sub, filename, index = 0) {
        var indexStr = index > 0 ? `.${index}` : '';
        var ext = filename.split('.').pop();
        var title = sub.file.filename;
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
                    fname = this.getFileBaseTitle(sub, entry.path, i++);
                    while (fs_1.existsSync(`${dest}/${fname}`)) {
                        fname = this.getFileBaseTitle(sub, entry.path, i++);
                    }
                    entry.pipe(fs_1.createWriteStream(`${dest}/${fname}`)
                        .on('close', () => {
                        console.log(chalk_1.default.yellow(`File '${entry.path}' extracted as ${dest}/${fname}.`));
                    }));
                }
                else {
                    entry.autodrain();
                }
            })
                .on('close', () => resolve())
                .on('error', err => reject(err));
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
                        filename = this.getFileBaseTitle(sub, file.fileHeader.name, i++);
                        while (fs_1.existsSync(`${dest}/${filename}`)) {
                            filename = this.getFileBaseTitle(sub, file.fileHeader.name, i++);
                        }
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
    static tokenize(filepath) {
        return filepath.match(this.REGEX.TOKENIZE).map(token => token.replace(/\./g, ' ').trim().replace(/\s/g, '.'));
    }
    static getFilename(filepath) {
        return filepath.substring(filepath.lastIndexOf(path_1.sep) + 1);
    }
    static getTitle(tokens) {
        var title = [];
        for (let index = 0; index < tokens.length; index++) {
            const token = tokens[index];
            if (this.REGEX.SEASON_EPISODE.test(token)) {
                break;
            }
            title.push(token);
        }
        return title.join(' ');
    }
    static getSearchText(file) {
        var title = file.title;
        var normalize = Commons.numRightPad;
        if (file.type === origin_types_1.default.FILE.MOVIE) {
            return `${title} ${file.year}`;
        }
        return `${title} S${normalize(file.season)}E${normalize(file.episode)}`;
    }
    static hash() { }
}
Commons.log = logger_1.default.getInstance();
Commons.REGEX = {
    TOKENIZE: /([a-zA-Z0-9\[\]\(\)]{2,}|([a-zA-Z0-9]\.)+)/g,
    SEASON_EPISODE: /[s|S]\d{2}[e|E]\d{2}/,
    SEASON_EPISODE_OTHER: /\d{1,2}x\d{1,2}/,
    YEAR: /(\.|\s|\()\d{4}(\.|\s|\))/
};
exports.default = Commons;
//# sourceMappingURL=commons.js.map