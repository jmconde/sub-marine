import Metadata from '../../interfaces/metadataInterface';
import OriginInterface from '../../interfaces/originInterface';
import Sub from '../../interfaces/subInterface';
import OpenSubtitleAuth from './opensubtitle-auth';
import OpensubtitlesManager from './opensubtitlesManager';
import chalk from 'chalk';
import Logger from '../../utils/logger';
import Search from '../../interfaces/searchInterface';
import Commons from '../../utils/commons';
import TYPES from '../../utils/origin-types';

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
    var OMDBMeta: Metadata;
    var registry = search.registry.get(TYPES.ORIGIN.OPEN_SUBTITLES);

    return new Promise<Sub[]>((resolve, reject) => {
      var imdbId;
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
      console.log(chalk.gray('Opensubtitles: Searching for ... ') + chalk.yellow(`${search.searchString} - IMDB ID: ${imdbId}`));
      registry.push(meta.imdbID);

      this.manager.call('SearchSubtitles', [{sublanguageid: 'spa, eng', imdbid: imdbId.substring(2)}])
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
                score: 0,
                meta: meta,
                file: search.fileInfo,
                origin: 'opensubtitles.org'
              };
              return sub;
            }));
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