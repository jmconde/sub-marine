"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mapper_1 = require("./mapper");
class TMDbMapper extends mapper_1.default {
    constructor() {
        super(...arguments);
        this.MAP_DEF = {
            plot: 'overview',
            rated: 'vote_average',
            year: d => (d.release_date && d.release_date.substring(0, 4)) || (d.first_air_date && d.first_air_date.substring(0, 4)),
            title: 'title',
            id: 'id',
            lang: 'original_language',
            imdbID: 'external_ids.imdb_id'
        };
    }
}
exports.default = TMDbMapper;
//# sourceMappingURL=TMDbMapper.js.map