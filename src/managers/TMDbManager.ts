import Manager from "./manager";
import Metadata from "../interfaces/metadata";

export default class TMDbManager extends Manager {
  API_KEY = 'tmdb';
  URL = 'http://www.omdbapi.com';

  mapper(response: any, meta: Metadata): Metadata {
    return null;
  }
}