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
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const unrar = require("node-unrar-js");
const path_1 = require("path");
const unzip = require("unzip");
class Commons {
    static getFileBaseTitle(sub, filename, index = 0) {
        var indexStr = index > 0 ? `.${index}` : '';
        var ext = filename.split('.').pop();
        var title = sub.meta.search.replace(/\s/g, '.');
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
                        filename = this.getFileBaseTitle(sub, file.fileHeader.name, i++);
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
    static getMetaDataFromFilename(filepath) {
        return __awaiter(this, void 0, void 0, function* () {
            var tokens = this.tokenize(this.getFilename(filepath));
            return new Promise((resolve, reject) => {
                var type = 'movie';
                var matcher, data, season, episode, title, year, filename;
                if (!fs_extra_1.pathExistsSync(filepath)) {
                    reject('File does not exist.');
                    return;
                }
                filename = filepath.substring(filepath.lastIndexOf(path_1.sep) + 1);
                matcher = filename.match(this.REGEX.SEASON_EPISODE);
                if (matcher !== null) {
                    type = 'series';
                }
                else {
                    matcher = filename.match(this.REGEX.YEAR);
                }
                data = matcher[0].toUpperCase();
                title = filename.substring(0, matcher.index).replace(/\.|\(\)/g, ' ').trim();
                if (type === 'series') {
                    season = Number(data.substring(1, 3));
                    episode = Number(data.substring(4));
                }
                else {
                    year = matcher[0].replace(/\.|\(\)/g, ' ').trim();
                }
                var meta = {
                    title,
                    type,
                    filename,
                    path: filepath,
                    season,
                    episode,
                    year
                };
                meta.search = Commons.getSearchText(meta);
                console.log(meta);
                resolve(meta);
            });
        });
    }
    static getSearchText(meta) {
        var normalize = num => new String(100 + num).substring(1);
        if (meta.type === 'movie') {
            return `${meta.title} ${meta.year}`;
        }
        return `${meta.title} S${normalize(meta.season)}E${normalize(meta.episode)}`;
    }
    static hash() { }
}
Commons.REGEX = {
    TOKENIZE: /([a-zA-Z0-9\[\]\(\)]{2,}|([a-zA-Z0-9]\.)+)/g,
    SEASON_EPISODE: /[s|S]\d{2}[e|E]\d{2}/,
    SEASON_EPISODE_OTHER: /\d{1,2}x\d{1,2}/,
    YEAR: /(\.|\s|\()\d{4}(\.|\s|\))/
};
exports.default = Commons;
//# sourceMappingURL=commons.js.map