"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mapper_1 = require("./mapper");
const origin_types_1 = require("../../utils/origin-types");
class TMDbMapper extends mapper_1.default {
    constructor() {
        super();
        this.add('MOVIE', {
            plot: 'overview',
            rated: 'vote_average',
            year: d => (d.release_date && d.release_date.substring(0, 4)) || (d.first_air_date && d.first_air_date.substring(0, 4)),
            title: 'title',
            id: 'id',
            lang: 'original_language',
            imdbID: 'external_ids.imdb_id',
            source: () => 'tmdb',
            type: () => origin_types_1.default.FILE.MOVIE
        });
        this.add('SERIES', {
            id: 'id',
            title: 'name',
            poster: 'poster_path',
            plot: 'overview',
            released: 'first_air_date',
            lang: 'original_language',
            // rated: 'vote_average',
            year: d => (d.first_air_date && d.first_air_date.substring(0, 4)),
            source: () => 'tmdb',
            type: () => origin_types_1.default.FILE.SERIES
        });
        this.add('EPISODE', {
            plot: 'overview',
            rated: 'vote_average',
            year: d => (d.release_date && d.release_date.substring(0, 4)) || (d.first_air_date && d.first_air_date.substring(0, 4)),
            title: 'title',
            id: 'id',
            lang: 'original_language',
            imdbID: 'external_ids.imdb_id',
            source: () => 'tmdb',
            type: () => origin_types_1.default.FILE.EPISODE
        });
    }
}
exports.default = TMDbMapper;
//# sourceMappingURL=TMDbMapper.js.map