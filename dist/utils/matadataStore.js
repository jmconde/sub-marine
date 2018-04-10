"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MetadataStore {
    constructor() {
        this._store = new Map();
    }
    static get Instance() {
        return this._instance || (this._instance = new this());
    }
    set(key, meta) {
        this._store.set(key, meta);
    }
    get(key) {
        return this._store.get(key);
    }
}
exports.default = MetadataStore;
//# sourceMappingURL=matadataStore.js.map