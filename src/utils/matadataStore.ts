import Metadata from "../interfaces/metadataInterface";

export default class MetadataStore {
  private _store: Map<string, Metadata>;
  private static _instance: MetadataStore;

  private constructor() {
    this._store= new Map<string, Metadata>();
  }

  static get Instance(): MetadataStore {
    return this._instance || (this._instance = new this());
  }

  set(key: string, meta: Metadata) {
    this._store.set(key, meta);
  }

  get(key: string): Metadata {
    return this._store.get(key);
  }
}