import ApiManager from "./apiManager";
import Metadata from "../interfaces/metadataInterface";
import chalk from "chalk";
import TMDbMapper from "./mappers/TMDbMapper";

export default class TMDbManager extends ApiManager {
  ID = 'tmdb';
  URL = 'http://api.themoviedb.org';
  LIST_DATA_PATH = 'results';
  mapper = new TMDbMapper();

  check(json): number {
    return !json.status_code  ? 0 : 1;
  }

  fill(meta: Metadata): Promise<Metadata> {
    console.log(chalk.grey('getting metadata from TMDb...'));

    return this.find(meta)
      .then(findMeta =>  Object.assign(meta, findMeta))
      .then(meta => {
        if (meta.type === 'movie') {
          return this.getMovie(meta).then(movieMeta => Object.assign(meta, movieMeta));
        } else if (meta.type === 'series') {
          return this.getEpisode(meta).then(seriesMeta => Object.assign(meta, seriesMeta));
        } else {
          Promise.reject<Metadata>('No type');
        }
      });
  }

  find(meta: Metadata): Promise<Metadata> {
    var q: any = {
      query: meta.title
    };

    if (meta.year) {
      q.year = meta.year
    }

    var path = '/3/search/tv';

    if (meta.type === 'movie') {
      path = '/3/search/movie'
    }

    return new Promise<Metadata>((resolve, reject) => {
      this.list(path, q, meta)
      .then(list => {
        resolve(list[0])
      })
    });
  }

  getMovie(meta: Metadata): Promise<Metadata> {
    console.log(meta);
    var path = '/3/movie/{movie_id}';
    var pathData = {
      movie_id: meta.id
    }

    return this.get(this.getPath(path, pathData), {append_to_response: 'external_ids'}, meta);
  }

  getSeries(meta: Metadata): Promise<Metadata> {
    var path = '/3/tv/{tv_id}';
    var pathData = {
      tv_id: meta.id
    }

    return this.get(this.getPath(path, pathData), {append_to_response: 'external_ids'}, meta);
  }

  getExternalIds(id: string, season: number) {
    var path = '/3/tv/{tv_id}/season/{season_number}/external_ids';
    var pathData = {
      tv_id: id,
      season_number: season
    }
    return this.rawGet(this.getPath(path, pathData), {});
  }

  getEpisode(meta: Metadata): Promise<Metadata> {
    var path = '/3/tv/{tv_id}/season/{season_number}/episode/{episode_number}';
    var pathData = {
      tv_id: meta.id,
      season_number: meta.season,
      episode_number: meta.episode
    };

    return this.get(this.getPath(path, pathData), {append_to_response: 'external_ids'}, meta);
  }
}
/*
{ vote_count: 472,
    id: 269795,
    video: false,
    vote_average: 5.6,
    title: '2:22',
    popularity: 15.493135,
    poster_path: '/aQkXOiMi7yBR3XwDbGBzDI2Tqnq.jpg',
    original_language: 'en',
    original_title: '2:22',
    genre_ids: [ 18, 53, 10749, 878 ],
    backdrop_path: '/3zVBKPprJ9PeFBQbpT9uDiHGm61.jpg',
    adult: false,
    overview: 'A man\'s life is derailed when an ominous pattern of events repeats itself in exactly the same manner every day, ending at precisely 2:22 p.m.',
    release_date: '2017-06-29' }
*/