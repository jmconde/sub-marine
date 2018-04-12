"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apiManager_1 = require("./apiManager");
const TVMazeMapper_1 = require("./mappers/TVMazeMapper");
const origin_types_1 = require("../utils/origin-types");
const chalk_1 = require("chalk");
class TVMazeManager extends apiManager_1.default {
    constructor() {
        super(...arguments);
        this.ID = 'tvmaze';
        this.URL = 'http://api.tvmaze.com';
        this.mapper = new TVMazeMapper_1.default();
    }
    fill(info) {
        console.log(chalk_1.default.grey('getting metadata from TVMaze...'));
        if (info.type === origin_types_1.default.FILE.EPISODE) {
            return this.find(info);
        }
        return Promise.resolve(null);
    }
    find(info) {
        var path = '/search/shows';
        var q = {
            q: info.title
        };
        return new Promise((resolve, reject) => {
            var showType = info.type === origin_types_1.default.FILE.MOVIE ? origin_types_1.default.FILE.MOVIE : origin_types_1.default.FILE.SERIES;
            this.list(path, q, showType)
                .then(list => list[0])
                .then((showMeta) => this.getEpisode(showMeta.id, info.season, info.episode)
                .then(episodeMeta => {
                showMeta.season = episodeMeta.season;
                showMeta.episode = episodeMeta.episode;
                showMeta.episodeData = episodeMeta;
                resolve(showMeta);
            }));
        });
    }
    getEpisode(id, season, episode) {
        var path = '/shows/{id}/episodebynumber';
        var pathData = {
            id
        };
        var q = {
            season,
            number: episode
        };
        return this.get(this.getPath(path, pathData), q, origin_types_1.default.FILE.EPISODE);
    }
    check(json) {
        return (!json || json.length === 0) ? 1 : 0;
    }
}
exports.default = TVMazeManager;
//# sourceMappingURL=TVMazeManager.js.map