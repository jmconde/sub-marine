import Metadata from '../../interfaces/metadataInterface';
import OriginInterface from '../../interfaces/originInterface';
import Sub from '../../interfaces/subInterface';
import OpenSubtitleAuth from './opensubtitle-auth';
import OpensubtitlesManager from './opensubtitlesManager';
import chalk from 'chalk';
import Logger from '../../utils/logger';
import MetadataStore from '../../utils/matadataStore';

export default class OpenSubtitlesOrigin implements OriginInterface {
  private auth: OpenSubtitleAuth;
  private readonly ENDPOINT: string = 'https://api.opensubtitles.org/xml-rpc';
  readonly authRequired = true;
  private authenticated: boolean;
  private manager: OpensubtitlesManager;
  private log: Logger = Logger.Instance;
  private store: MetadataStore = MetadataStore.Instance;

  constructor(username: string, password: string, lang: string, agent: string) {
    this.setAuthData(username, password, lang, agent);
    this.manager = new OpensubtitlesManager(this.auth);
  }

  search(meta: Metadata):  Promise<Sub[]> {
    var normalize = num => new String (100 + num).substring(1);
    var OMDBMeta: Metadata;

    return new Promise<Sub[]>((resolve, reject) => {
      console.log(chalk.gray('Searching for ... ') + chalk.yellow(`${meta.title} ${meta.season} ${meta.episode}`));

      if (!meta.imdbID) {
        OMDBMeta = this.store.get('omdb');
        meta.imdbID = OMDBMeta.imdbID;
      }

      this.manager.call('SearchSubtitles', [{sublanguageid: 'spa, eng', imdbid: meta.imdbID.substring(2)}])
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