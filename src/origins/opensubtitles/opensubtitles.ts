import Metadata from '../../interfaces/metadata';
import OriginInterface from '../../interfaces/originInterface';
import Sub from '../../interfaces/subInterface';
import OpenSubtitleAuth from './opensubtitle-auth';
import OpensubtitlesManager from './opensubtitlesManager';

export default class OpenSubtitlesOrigin implements OriginInterface {
  private auth: OpenSubtitleAuth;
  private readonly ENDPOINT: string = 'https://api.opensubtitles.org/xml-rpc';
  readonly authRequired = true;
  private authenticated: boolean;
  private manager: OpensubtitlesManager;

  constructor(username: string, password: string, lang: string, agent: string) {
    this.setAuthData(username, password, lang, agent);
    this.manager = new OpensubtitlesManager(this.auth);
  }

  search(meta: Metadata):  Promise<Sub[]> {
    var normalize = num => new String (100 + num).substring(1);
    return new Promise<Sub[]>((resolve, reject) => {
      this.manager.call('SearchSubtitles', [{sublanguageid: 'spa', imdbid: meta.imdbID.substring(2)}])
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