"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apiManager_1 = require("./apiManager");
const chalk_1 = require("chalk");
const TMDbMapper_1 = require("./mappers/TMDbMapper");
class TMDbManager extends apiManager_1.default {
    constructor() {
        super(...arguments);
        this.ID = 'tmdb';
        this.URL = 'http://api.themoviedb.org';
        this.LIST_DATA_PATH = 'results';
        this.mapper = new TMDbMapper_1.default();
    }
    check(json) {
        return !json.status_code ? 0 : 1;
    }
    fill(meta) {
        console.log(chalk_1.default.grey('getting metadata from TMDb...'));
        return this.find(meta)
            .then(findMeta => Object.assign(meta, findMeta))
            .then(meta => {
            if (meta.type === 'movie') {
                return this.getMovie(meta).then(movieMeta => Object.assign(meta, movieMeta));
            }
            else if (meta.type === 'series') {
                return this.getEpisode(meta).then(seriesMeta => Object.assign(meta, seriesMeta));
            }
            else {
                Promise.reject('No type');
            }
        });
    }
    find(meta) {
        var q = {
            query: meta.title
        };
        if (meta.year) {
            q.year = meta.year;
        }
        var path = '/3/search/tv';
        if (meta.type === 'movie') {
            path = '/3/search/movie';
        }
        return new Promise((resolve, reject) => {
            this.list(path, q, meta)
                .then(list => {
                resolve(list[0]);
            });
        });
    }
    getMovie(meta) {
        console.log(meta);
        var path = '/3/movie/{movie_id}';
        var pathData = {
            movie_id: meta.id
        };
        return this.get(this.getPath(path, pathData), { append_to_response: 'external_ids' }, meta);
    }
    getSeries(meta) {
        var path = '/3/tv/{tv_id}';
        var pathData = {
            tv_id: meta.id
        };
        return this.get(this.getPath(path, pathData), { append_to_response: 'external_ids' }, meta);
    }
    getExternalIds(id, season) {
        var path = '/3/tv/{tv_id}/season/{season_number}/external_ids';
        var pathData = {
            tv_id: id,
            season_number: season
        };
        return this.rawGet(this.getPath(path, pathData), {});
    }
    getEpisode(meta) {
        var path = '/3/tv/{tv_id}/season/{season_number}/episode/{episode_number}';
        var pathData = {
            tv_id: meta.id,
            season_number: meta.season,
            episode_number: meta.episode
        };
        return this.get(this.getPath(path, pathData), { append_to_response: 'external_ids' }, meta);
    }
}
exports.default = TMDbManager;
/*
{ vote_count: 472,
    id: 269795,
    video: false,
    vote_average: 5.6,
    title: '2:22',
    popularity: 15.493135,
    poster_path: '/aQkXOiMi7yBR3XwDbGBzDI2Tqnq.jpg',
    original_language: 'en',
    original_title: '2:22',
    genre_ids: [ 18, 53, 10749, 878 ],
    backdrop_path: '/3zVBKPprJ9PeFBQbpT9uDiHGm61.jpg',
    adult: false,
    overview: 'A man\'s life is derailed when an ominous pattern of events repeats itself in exactly the same manner every day, ending at precisely 2:22 p.m.',
    release_date: '2017-06-29' }
*/ 
//# sourceMappingURL=TMDbManager.js.map