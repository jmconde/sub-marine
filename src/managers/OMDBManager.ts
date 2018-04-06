import Manager from "./manager";
import Metadata from "../interfaces/metadata";
import chalk from "chalk";

export default class OMDBManager extends Manager {
  URL = 'http://www.omdbapi.com';
  API_KEY = 'omdb';

  fill(meta: Metadata): Promise<Metadata> {
    console.log(chalk.grey('getting metadata from OMDB...'));
    var promise;
    console.log(meta.type);
    if (meta.type === 'movie') {
      promise = this.getMovie(meta);
    } else if (meta.type === 'series') {
      promise = this.getSeries(meta)
        .then(meta => this.getEpisode(meta));
    } else {
      Promise.reject<Metadata>('No type');
    }

    return promise;
  }

  getMovie(meta: Metadata): Promise<Metadata> {
    var qParams = {
      t: encodeURIComponent(meta.title),
      type: 'movie'
    };

    return this.get('/', qParams, meta);
  }

  getSeries(meta: Metadata): Promise<Metadata> {
    var qParams = {
      t: encodeURIComponent(meta.title),
      type: 'series'
    };

    return this.get('/', qParams, meta);
  }

  getEpisode(meta: Metadata): Promise<Metadata> {
    var qParams = {
      t: encodeURIComponent(meta.title),
      type: 'episode',
      Season: meta.season,
      Episode: meta.episode
    };

    return this.get('/', qParams, meta);
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
    meta.id = response.seriesID || meta.id;

    return meta;
  }
}