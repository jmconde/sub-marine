"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const commons_1 = require("../utils/commons");
const chalk_1 = require("chalk");
const logger_1 = require("../utils/logger");
class FilenameManager {
    constructor() {
        this.ID = 'file';
        this.log = logger_1.default.Instance;
    }
    fill(meta) {
        var filepath = meta.path;
        var tokens = commons_1.default.tokenize(commons_1.default.getFilename(filepath));
        console.log(chalk_1.default.grey('getting metadata from Filename...'));
        return new Promise((resolve, reject) => {
            var type = 'movie';
            var matcher, data, season, episode, title, year, filename;
            if (!fs_extra_1.pathExistsSync(filepath)) {
                reject('File does not exist.');
                return;
            }
            filename = filepath.substring(filepath.lastIndexOf(path_1.sep) + 1);
            matcher = filename.match(commons_1.default.REGEX.SEASON_EPISODE);
            if (matcher) {
                type = 'series';
            }
            else {
                matcher = filename.match(commons_1.default.REGEX.YEAR);
            }
            data = matcher[0].toUpperCase();
            title = filename.substring(0, matcher.index);
            if (type === 'series') {
                season = Number(data.substring(1, 3));
                episode = Number(data.substring(4));
                matcher = title.match(commons_1.default.REGEX.YEAR);
                if (matcher) {
                    year = matcher[0].replace(/\.|\(\)/g, ' ').trim();
                    title = title.replace(year, ' ');
                }
            }
            else {
                year = matcher[0].replace(/\.|\(\)/g, ' ').trim();
            }
            title = title.replace(/\.|\(\)/g, ' ').trim();
            this.log.colored('debug', 'greenBright', title);
            var meta = {
                title,
                type,
                filename,
                path: filepath,
                season,
                episode,
                year
            };
            meta.search = commons_1.default.getSearchText(meta);
            resolve(meta);
        });
    }
}
exports.default = FilenameManager;
//# sourceMappingURL=FilenameManager.js.map