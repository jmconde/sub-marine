"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const manager_1 = require("./manager");
class TMDbManager extends manager_1.default {
    constructor() {
        super(...arguments);
        this.API_KEY = 'tmdb';
        this.URL = 'http://www.omdbapi.com';
    }
    mapper(response, meta) {
        return null;
    }
}
exports.default = TMDbManager;
//# sourceMappingURL=TMDbManager.js.map