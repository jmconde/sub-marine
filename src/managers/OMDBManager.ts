import ApiManager from "./apiManager";
import Metadata from "../interfaces/metadataInterface";
import chalk from "chalk";
import OMDBMapper from "./mappers/OMDBMapper";
import TYPES from "../utils/origin-types";
import FileInfo from "../interfaces/fileInfoInterface";
import Logger from "../utils/logger";

export default class OMDBManager extends ApiManager {
  ID = 'omdb';
  URL = 'http://www.omdbapi.com';
  mapper = new OMDBMapper();

  MOVIE = 'movie';
  RESPONSE_OK = 'True';

  // async get(path: string = '', query: any,  meta?: Metadata): Promise<Metadata> {
  //   return super.get(path, query, meta).then(json => {
  //     return Promise.reject<Metadata>('Error!');
  //   });
  // }

  check(json): number {
    return json.Response === this.RESPONSE_OK ? 0 : 1;
  }

  async fill(info: FileInfo): Promise<Metadata> {
    console.log(chalk.grey('getting metadata from OMDB...'));
    this.log.cDebug(Logger.BLUE_BRIGHT, TYPES.FILE.EPISODE)
    this.log.cDebug(Logger.BLUE_BRIGHT, info)
    if (info.type === TYPES.FILE.MOVIE) {
      return this.getMovie(info.title);
    } else if (info.type === TYPES.FILE.EPISODE) {
      return this.getSeries(info.title)
        .then(seriesMeta => {
          return this.getEpisode(info.title, info.season, info.episode).then(episodeMeta => {
            seriesMeta.episodeData = episodeMeta;

            return episodeMeta && seriesMeta;
          })
        });
    } else {
      return Promise.reject<Metadata>('OMDB: No type');
    }
  }

  async getMovie(title: string): Promise<Metadata> {
    var qParams = {
      t: title,
      type: 'movie'
    };

    return this.get('/', qParams, TYPES.FILE.MOVIE);
  }

  async getSeries(title: string): Promise<Metadata> {
    var qParams = {
      t: title,
      type: 'series'
    };

    return this.get('/', qParams, TYPES.FILE.SERIES);
  }

  async getEpisode(title: string, season: number, episode: number): Promise<Metadata> {
    var qParams = {
      t: title,
      type: 'episode',
      Season: season,
      Episode: episode
    };

    return this.get('/', qParams, TYPES.FILE.SERIES);
  }
}
