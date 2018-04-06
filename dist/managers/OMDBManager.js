"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const manager_1 = require("./manager");
const chalk_1 = require("chalk");
class OMDBManager extends manager_1.default {
    constructor() {
        super(...arguments);
        this.URL = 'http://www.omdbapi.com';
        this.API_KEY = 'omdb';
    }
    fill(meta) {
        console.log(chalk_1.default.grey('getting metadata from OMDB...'));
        var promise;
        console.log(meta.type);
        if (meta.type === 'movie') {
            promise = this.getMovie(meta);
        }
        else if (meta.type === 'series') {
            promise = this.getSeries(meta)
                .then(meta => this.getEpisode(meta));
        }
        else {
            Promise.reject('No type');
        }
        return promise;
    }
    getMovie(meta) {
        var qParams = {
            t: encodeURIComponent(meta.title),
            type: 'movie'
        };
        return this.get('/', qParams, meta);
    }
    getSeries(meta) {
        var qParams = {
            t: encodeURIComponent(meta.title),
            type: 'series'
        };
        return this.get('/', qParams, meta);
    }
    getEpisode(meta) {
        var qParams = {
            t: encodeURIComponent(meta.title),
            type: 'episode',
            Season: meta.season,
            Episode: meta.episode
        };
        return this.get('/', qParams, meta);
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
        meta.id = response.seriesID || meta.id;
        return meta;
    }
}
exports.default = OMDBManager;
//# sourceMappingURL=OMDBManager.js.map