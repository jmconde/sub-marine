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
const TMDbMapper_1 = require("./mappers/TMDbMapper");
const origin_types_1 = require("../utils/origin-types");
class TMDbManager extends apiManager_1.default {
    constructor() {
        super(...arguments);
        this.LIST_DATA_PATH = 'results';
        this.mapper = new TMDbMapper_1.default();
    }
    check(json) {
        return !json.status_code ? 0 : 1;
    }
    fill(info) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(chalk_1.default.grey('getting metadata from TMDb...'));
            return this.find(info.title, info.year, info.type)
                .then(meta => {
                if (info.type === origin_types_1.default.FILE.MOVIE) {
                    return this.getMovie(meta.id);
                }
                else if (info.type === origin_types_1.default.FILE.EPISODE) {
                    return this.getEpisode(meta.id, info.season, info.episode).then(episodeMeta => {
                        meta.episodeData = episodeMeta;
                        return meta;
                    });
                }
                else {
                    Promise.reject('TMDb: No type');
                }
            });
        });
    }
    find(title, year, type) {
        return __awaiter(this, void 0, void 0, function* () {
            var q = {
                query: title
            };
            if (year) {
                q.year = year;
            }
            var path = '/3/search/tv';
            if (type === 'movie') {
                path = '/3/search/movie';
            }
            return new Promise((resolve, reject) => {
                this.list(path, q, type)
                    .then(list => {
                    resolve(list[0]);
                });
            });
        });
    }
    getMovie(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var path = '/3/movie/{movie_id}';
            var pathData = {
                movie_id: id
            };
            return this.get(this.getPath(path, pathData), { append_to_response: 'external_ids' }, origin_types_1.default.FILE.MOVIE);
        });
    }
    getSeries(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var path = '/3/tv/{tv_id}';
            var pathData = {
                tv_id: id
            };
            return this.get(this.getPath(path, pathData), { append_to_response: 'external_ids' }, origin_types_1.default.FILE.SERIES);
        });
    }
    getExternalIds(id, season) {
        return __awaiter(this, void 0, void 0, function* () {
            var path = '/3/tv/{tv_id}/season/{season_number}/external_ids';
            var pathData = {
                tv_id: id,
                season_number: season
            };
            return this.rawGet(this.getPath(path, pathData), {});
        });
    }
    getEpisode(id, season, episode) {
        return __awaiter(this, void 0, void 0, function* () {
            var path = '/3/tv/{tv_id}/season/{season_number}/episode/{episode_number}';
            var pathData = {
                tv_id: id,
                season_number: season,
                episode_number: episode
            };
            return this.get(this.getPath(path, pathData), { append_to_response: 'external_ids' }, origin_types_1.default.FILE.EPISODE);
        });
    }
}
exports.default = TMDbManager;
//# sourceMappingURL=TMDbManager.js.map