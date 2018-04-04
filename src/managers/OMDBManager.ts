import Manager from "./manager";
import Metadata from "../interfaces/metadata";

export default class OMDBManager extends Manager {
  URL = 'http://www.omdbapi.com';
  API_KEY = 'omdb';

  getMovie(meta: Metadata): Promise<Metadata> {
    var qParams = {
      apiKey: this.getToken(this.API_KEY),
      t: encodeURIComponent(meta.title),
      type: 'movie'
    };

    return this.get(qParams, meta);
  }

  getSeries(meta: Metadata): Promise<Metadata> {
    var qParams = {
      apiKey: this.getToken(this.API_KEY),
      t: encodeURIComponent(meta.title),
      type: 'series'
    };

    return this.get(qParams, meta);
  }

  getEpisode(meta: Metadata): Promise<Metadata> {
    var qParams = {
      apiKey: this.getToken(this.API_KEY),
      t: encodeURIComponent(meta.title),
      type: 'episode',
      Season: meta.season,
      Episode: meta.episode
    };

    return this.get(qParams, meta);
  }

  mapper(response: any, meta: Metadata): Metadata {
    if (!meta) {
      meta = {};
    }

    meta.year = response.Year || meta.year;
    meta.rated = response.Rated || meta.rated;
    meta.imdbID = response.imdbID || meta.imdbID;
    meta.plot = response.Plot || meta.plot;
    meta.runtime = response.Runtime || meta.runtime;
    if (meta.episode) {
      meta.episodeTitle = response.Title || meta.episodeTitle;
    }
    meta.seriesID = response.seriesID || meta.seriesID;

    return meta;
  }
}