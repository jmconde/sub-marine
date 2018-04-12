"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const commons_1 = require("../utils/commons");
const chalk_1 = require("chalk");
const logger_1 = require("../utils/logger");
const origin_types_1 = require("../utils/origin-types");
class FilenameManager {
    constructor() {
        this.ID = 'fileInfo';
        this.log = logger_1.default.getInstance();
    }
    fill(filePath) {
        var tokens = commons_1.default.tokenize(commons_1.default.getFilename(filePath));
        console.log(chalk_1.default.grey('getting metadata from Filename...'));
        return new Promise((resolve, reject) => {
            var type = origin_types_1.default.FILE.MOVIE;
            var lastIndex = filePath.lastIndexOf(path_1.sep);
            var matcher, data, season, episode, title, year, filename, extension, fullName, path;
            if (!fs_extra_1.pathExistsSync(filePath)) {
                reject('File does not exist.');
                return;
            }
            fullName = filePath.substring(lastIndex + 1);
            filename = fullName.substring(0, fullName.lastIndexOf('.'));
            extension = fullName.split('.').pop();
            path = filePath.substring(0, lastIndex);
            matcher = filename.match(commons_1.default.REGEX.SEASON_EPISODE);
            if (matcher) {
                type = origin_types_1.default.FILE.EPISODE;
            }
            else {
                matcher = filename.match(commons_1.default.REGEX.YEAR);
            }
            data = matcher[0].toUpperCase();
            title = filename.substring(0, matcher.index);
            if (type === origin_types_1.default.FILE.EPISODE) {
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
            var info = {
                fullPath: filePath,
                filename,
                fullName,
                path,
                extension,
                title,
                type,
                season,
                episode,
                year
            };
            resolve(info);
        });
    }
}
exports.default = FilenameManager;
//# sourceMappingURL=FilenameManager.js.map