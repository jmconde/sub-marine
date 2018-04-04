"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const manager_1 = require("./manager");
class OMDBManager extends manager_1.default {
    constructor() {
        super(...arguments);
        this.URL = 'http://www.omdbapi.com';
        this.API_KEY = 'omdb';
    }
    getMovie(meta) {
        var qParams = {
            apiKey: this.getToken(this.API_KEY),
            t: encodeURIComponent(meta.title),
            type: 'movie'
        };
        return this.get(qParams, meta);
    }
    getSeries(meta) {
        var qParams = {
            apiKey: this.getToken(this.API_KEY),
            t: encodeURIComponent(meta.title),
            type: 'series'
        };
        return this.get(qParams, meta);
    }
    getEpisode(meta) {
        var qParams = {
            apiKey: this.getToken(this.API_KEY),
            t: encodeURIComponent(meta.title),
            type: 'episode',
            Season: meta.season,
            Episode: meta.episode
        };
        return this.get(qParams, meta);
    }
    mapper(response, meta) {
        if (!meta) {
            meta = {};
        }
        meta.year = response.Year || meta.year;
        meta.rated = response.Rated || meta.rated;
        meta.imdbID = response.imdbID || meta.imdbID;
        meta.plot = response.Plot || meta.plot;
        meta.runtime = response.Runtime || meta.runtime;
        if (meta.episode) {
            meta.episodeTitle = response.Title || meta.episodeTitle;
        }
        meta.seriesID = response.seriesID || meta.seriesID;
        return meta;
    }
}
exports.default = OMDBManager;
//# sourceMappingURL=OMDBManager.js.map