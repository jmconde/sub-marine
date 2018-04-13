import ApiManager from "./apiManager";
import Metadata from "../interfaces/metadataInterface";
import chalk from "chalk";
import TMDbMapper from "./mappers/TMDbMapper";
import FileInfo from "../interfaces/fileInfoInterface";
import TYPES from "../utils/origin-types";

export default class TMDbManager extends ApiManager {
  ID = 'tmdb';
  URL = 'http://api.themoviedb.org';
  LIST_DATA_PATH = 'results';
  mapper = new TMDbMapper();

  check(json): number {
    return !json.status_code  ? 0 : 1;
  }

  async fill(info: FileInfo): Promise<Metadata> {
    console.log(chalk.grey('getting metadata from TMDb...'));

    return this.find(info.title, info.year, info.type)
      .then(meta => {
        if (info.type === TYPES.FILE.MOVIE) {
          return this.getMovie(meta.id);
        } else if (info.type === TYPES.FILE.EPISODE) {
          return this.getEpisode(meta.id, info.season, info.episode).then(episodeMeta => {
            meta.episodeData = episodeMeta;

            return meta;
          });
        } else {
          Promise.reject<Metadata>('TMDb: No type');
        }
      });
  }

  async find(title: string, year: string, type: string): Promise<Metadata> {
    var q: any = {
      query: title
    };

    if (year) {
      q.year = year
    }

    var path = '/3/search/tv';

    if (type === 'movie') {
      path = '/3/search/movie'
    }

    return new Promise<Metadata>((resolve, reject) => {
      this.list(path, q, type)
      .then(list => {
        resolve(list[0])
      })
    });
  }

  async getMovie(id: string): Promise<Metadata> {
    var path = '/3/movie/{movie_id}';
    var pathData = {
      movie_id: id
    }

    return this.get(this.getPath(path, pathData), {append_to_response: 'external_ids'}, TYPES.FILE.MOVIE);
  }

  async getSeries(id: string): Promise<Metadata> {
    var path = '/3/tv/{tv_id}';
    var pathData = {
      tv_id: id
    }

    return this.get(this.getPath(path, pathData), {append_to_response: 'external_ids'}, TYPES.FILE.SERIES);
  }

  async getExternalIds(id: string, season: number) {
    var path = '/3/tv/{tv_id}/season/{season_number}/external_ids';
    var pathData = {
      tv_id: id,
      season_number: season
    }
    return this.rawGet(this.getPath(path, pathData), {});
  }

  async getEpisode(id: string, season: number, episode: number): Promise<Metadata> {
    var path = '/3/tv/{tv_id}/season/{season_number}/episode/{episode_number}';
    var pathData = {
      tv_id: id,
      season_number: season,
      episode_number: episode
    };

    return this.get(this.getPath(path, pathData), {append_to_response: 'external_ids'}, TYPES.FILE.EPISODE);
  }
}
