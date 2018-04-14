import chalk from 'chalk';

import FileInfo from '../interfaces/fileInfoInterface';
import Metadata from '../interfaces/metadataInterface';
import Logger from '../utils/logger';
import TYPES from '../utils/origin-types';
import ApiManager from './apiManager';
import OMDBMapper from './mappers/OMDBMapper';

export default class OMDBManager extends ApiManager {
  mapper = new OMDBMapper();
  RESPONSE_OK = 'True';

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
