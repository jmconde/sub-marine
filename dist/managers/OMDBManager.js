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
const apiManager_1 = require("./apiManager");
const chalk_1 = require("chalk");
const OMDBMapper_1 = require("./mappers/OMDBMapper");
const origin_types_1 = require("../utils/origin-types");
const logger_1 = require("../utils/logger");
class OMDBManager extends apiManager_1.default {
    constructor() {
        super(...arguments);
        this.ID = 'omdb';
        this.URL = 'http://www.omdbapi.com';
        this.mapper = new OMDBMapper_1.default();
        this.MOVIE = 'movie';
        this.RESPONSE_OK = 'True';
    }
    // async get(path: string = '', query: any,  meta?: Metadata): Promise<Metadata> {
    //   return super.get(path, query, meta).then(json => {
    //     return Promise.reject<Metadata>('Error!');
    //   });
    // }
    check(json) {
        return json.Response === this.RESPONSE_OK ? 0 : 1;
    }
    fill(info) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(chalk_1.default.grey('getting metadata from OMDB...'));
            this.log.cDebug(logger_1.default.BLUE_BRIGHT, origin_types_1.default.FILE.EPISODE);
            this.log.cDebug(logger_1.default.BLUE_BRIGHT, info);
            if (info.type === origin_types_1.default.FILE.MOVIE) {
                return this.getMovie(info.title);
            }
            else if (info.type === origin_types_1.default.FILE.EPISODE) {
                return this.getSeries(info.title)
                    .then(seriesMeta => {
                    return this.getEpisode(info.title, info.season, info.episode).then(episodeMeta => {
                        seriesMeta.episodeData = episodeMeta;
                        return episodeMeta && seriesMeta;
                    });
                });
            }
            else {
                return Promise.reject('OMDB: No type');
            }
        });
    }
    getMovie(title) {
        return __awaiter(this, void 0, void 0, function* () {
            var qParams = {
                t: title,
                type: 'movie'
            };
            return this.get('/', qParams, origin_types_1.default.FILE.MOVIE);
        });
    }
    getSeries(title) {
        return __awaiter(this, void 0, void 0, function* () {
            var qParams = {
                t: title,
                type: 'series'
            };
            return this.get('/', qParams, origin_types_1.default.FILE.SERIES);
        });
    }
    getEpisode(title, season, episode) {
        return __awaiter(this, void 0, void 0, function* () {
            var qParams = {
                t: title,
                type: 'episode',
                Season: season,
                Episode: episode
            };
            return this.get('/', qParams, origin_types_1.default.FILE.SERIES);
        });
    }
}
exports.default = OMDBManager;
//# sourceMappingURL=OMDBManager.js.map