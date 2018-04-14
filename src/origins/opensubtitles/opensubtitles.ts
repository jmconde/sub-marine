import chalk from 'chalk';

import Metadata from '../../interfaces/metadataInterface';
import OriginInterface from '../../interfaces/originInterface';
import Search from '../../interfaces/searchInterface';
import Sub from '../../interfaces/subInterface';
import Commons from '../../utils/commons';
import Logger from '../../utils/logger';
import TYPES from '../../utils/origin-types';
import OpenSubtitleAuth from './opensubtitle-auth';
import OpensubtitlesManager from './opensubtitlesManager';

export default class OpenSubtitlesOrigin implements OriginInterface {
  readonly ID = TYPES.ORIGIN.OPEN_SUBTITLES;
  private auth: OpenSubtitleAuth;
  private readonly ENDPOINT: string = 'https://api.opensubtitles.org/xml-rpc';
  readonly authRequired = true;
  private authenticated: boolean;
  private manager: OpensubtitlesManager;
  private log: Logger = Logger.getInstance();

  constructor(username: string, password: string, lang: string, agent: string) {
    this.setAuthData(username, password, lang, agent);
    this.manager = new OpensubtitlesManager(this.auth);
  }

  search(search: Search):  Promise<Sub[]> {
    var meta = search.metadata;
    var registry = search.registry.get(TYPES.ORIGIN.OPEN_SUBTITLES);

    return new Promise<Sub[]>((resolve, reject) => {
      var imdbId, hash, bytesize, sArray;
      var hash = search.fileInfo.hashes[TYPES.ORIGIN.OPEN_SUBTITLES];
      if (hash) {
        if (registry.indexOf(hash.hash) !== -1) {
          resolve([]);
          return;
        }
        sArray = [{sublanguageid: 'spa, eng', moviehash: hash.hash, moviebytesize: hash.bytesize}];
        registry.push(hash.hash);
        console.log(chalk.gray('Opensubtitles: Searching for ... ') + chalk.yellow(`${search.searchString} - HASH: ${hash.hash}`));
      } else {
        if (meta.type === TYPES.FILE.EPISODE && meta.episodeData && meta.episodeData.imdbID) {
          imdbId = meta.episodeData.imdbID;
        } else if (meta.type === TYPES.FILE.MOVIE && meta.imdbID) {
          imdbId = meta.imdbID;
        }
        this.log.cInfo(Logger.GREEN_BRIGHT, meta);

        if (!imdbId) {
          console.log(chalk.gray('OpenSubtitles: No Episode or Movie IMDB ID.'));
          resolve([]);
          return;
        } else  if (registry.indexOf(imdbId) !== -1) {
          resolve([]);
          return;
        }
        sArray = [{sublanguageid: 'spa, eng', imdbid: imdbId.substring(2)}];
        registry.push(meta.imdbID);
        console.log(chalk.gray('Opensubtitles: Searching for ... ') + chalk.yellow(`${search.searchString} - IMDB ID: ${imdbId}`));
      }

      this.manager.call('SearchSubtitles', sArray)
        .then(response => {
          if (response.status === '200 OK') {
            resolve(response.data.map(d => {
              var sub: Sub = {
                description: '',
                rating: Number(d.MovieImdbRating),
                downloads: Number(d.SubDownloadsCnt),
                format: d.InfoFormat,
                uploader: d.UserID,
                group: d.InfoReleaseGroup,
                dateUpload: new Date(d.SubAddDate),
                url: d.ZipDownloadLink,
                lang: d.ISO639,
                meta: meta,
                file: search.fileInfo,
                origin: 'opensubtitles.org',
                score: d.Score
              };
              return sub;
            }).sort(Commons.sortSubFn));
          } else {
            reject(response.status)
          }
        }).catch(err => reject(err));
    });
  }

  download(sub, dest): Promise<any> {
    return Promise.reject('Error');
  }

  private setAuthData(username: string, password: string, lang: string, agent: string) {
    this.auth = new OpenSubtitleAuth(username, password, lang, agent);
  }

  authenticate(): Promise<any> {
    if (!this.auth) {
      Promise.reject('No auth data.');
      return;
    }

    return this.manager.call('LogIn', this.auth.getAuthData(), true)
      .then(data => {
        this.auth.authenticated = true;
        this.auth.token = data.token;
        this.auth.setRaw(data);
      });
  }
}