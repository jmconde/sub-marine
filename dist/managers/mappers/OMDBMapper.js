"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mapper_1 = require("./mapper");
class OMDBMapper extends mapper_1.default {
    constructor() {
        super(...arguments);
        this.DEFAULT = {
            title: 'Title',
            year: 'Year',
            rated: 'Rated',
            released: 'Released',
            genre: 'Genre',
            plot: 'Plot',
            runtime: 'Runtime',
            imdbID: 'imdbID',
            id: 'seriesID',
            metascore: 'Metascore',
            poster: 'Poster',
            type: 'Type',
            production: 'Production'
        };
    }
}
exports.default = OMDBMapper;
//# sourceMappingURL=OMDBMapper.js.map