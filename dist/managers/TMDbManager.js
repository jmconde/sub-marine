"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const manager_1 = require("./manager");
const chalk_1 = require("chalk");
class TMDbManager extends manager_1.default {
    constructor() {
        super(...arguments);
        this.API_KEY = 'tmdb';
        this.URL = 'http://api.themoviedb.org';
        this.LIST_DATA_PATH = 'results';
    }
    fill(meta) {
        console.log(chalk_1.default.grey('getting metadata from TMDb...'));
        return this.find(meta)
            .then(meta => {
            if (meta.type === 'movie') {
                return this.getMovie(meta);
            }
            else if (meta.type === 'series') {
                return this.getEpisode(meta);
            }
            else {
                Promise.reject('No type');
            }
        });
        // return;
        // var promise;
        // console.log(meta.type);
        // if (meta.type === 'movie') {
        //   promise = this.getMovie(meta);
        // } else if (meta.type === 'series') {
        //   promise = this.getSeries(meta)
        //     .then(meta => this.getEpisode(meta));
        // } else {
        //   Promise.reject<Metadata>('No type');
        // }
        // return promise;
    }
    find(meta) {
        var q = {
            query: meta.title,
            year: meta.year
        };
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
        var path = '/3/movie/{movie_id}';
        var q = {
            query: meta.title,
            year: meta.year
        };
        var path = '/3/search/tv';
        if (meta.type === 'movie') {
            path = '/3/search/movie';
        }
        return this.get(path, q, meta);
    }
    getSeries(meta) {
        var path = '/3/tv/{tv_id}';
        var pathData = {
            tv_id: meta.id
        };
        return this.get(this.getPath(path, pathData), {}, meta);
    }
    getEpisode(meta) {
        var path = '/3/tv/{tv_id}/season/{season_number}/episode/{episode_number}';
        var pathData = {
            tv_id: meta.id,
            season_number: meta.season,
            episode_number: meta.episode
        };
        return this.get(this.getPath(path, pathData), {}, meta);
    }
    mapper(response, meta) {
        if (!meta) {
            meta = {};
        }
        else {
            meta = Object.assign({}, meta);
        }
        // meta.imdbID = response.imdbID || meta.imdbID;
        // meta.runtime = response.Runtime || meta.runtime;
        // if (meta.episode) {
        //   meta.episodeTitle = response.Title || meta.episodeTitle;
        // }
        meta.plot = response.overview || meta.plot;
        meta.rated = response.vote_average || meta.rated;
        meta.year = (response.release_date && response.release_date.substring(0, 4)) || meta.year;
        meta.title = response.title || meta.title;
        meta.id = response.id || meta.id;
        meta.lang = response.original_language || meta.lang;
        return meta;
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