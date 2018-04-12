"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mapper_1 = require("./mapper");
class TVMazeMapper extends mapper_1.default {
    constructor() {
        super(...arguments);
        this.DEFAULT = {
            plot: 'show.summary',
            // rated: 'vote_average',
            // year: d => (d.premiered && d.release_date.substring(0, 4)) || (d.first_air_date && d.first_air_date.substring(0, 4)),
            title: 'show.name',
            episodeTitle: '',
            id: 'show.id',
            lang: 'show.language',
            imdbID: 'show.externals.imdb'
        };
        this.EPISODE = {
            id: 'id',
            episodeTitle: 'name',
            season: 'season',
            episode: 'number',
            runtime: 'runtime'
        };
    }
}
exports.default = TVMazeMapper;
//# sourceMappingURL=TVMazeMapper.js.map