"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mapper_1 = require("./mapper");
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
            source: () => 'tmdb'
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
            source: () => 'tmdb'
        });
        this.add('EPISODE', {
            plot: 'overview',
            rated: 'vote_average',
            year: d => (d.release_date && d.release_date.substring(0, 4)) || (d.first_air_date && d.first_air_date.substring(0, 4)),
            title: 'title',
            id: 'id',
            lang: 'original_language',
            imdbID: 'external_ids.imdb_id',
            source: () => 'tmdb'
        });
    }
}
exports.default = TMDbMapper;
//# sourceMappingURL=TMDbMapper.js.map