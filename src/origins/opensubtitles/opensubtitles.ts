import OriginInterface from "../../interfaces/originInterface";
import Sub from "../../interfaces/subInterface";
import AuthDataInterface from "../../interfaces/authdataInterface";
import OpenSubtitleAuth from "./opensubtitle-auth";

import { Builder, Parser } from "xml2js";
import Axios from "axios";

export default class OpenSubtitlesOrigin implements OriginInterface {
  private auth: AuthDataInterface;
  private readonly ENDPOINT: string = 'https://api.opensubtitles.org/xml-rpc';
  readonly authRequired = true;
  private authenticated: boolean;

  constructor(username: string, password: string, lang: string, agent: string) {
    this.setAuthData(username, password, lang, agent);
    this.authenticated = false;
  }

  search(text: String, tuneText?: String):  Promise<Sub[]> {
    return Promise.reject('Error xxx');
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

    return new Promise<any>((resolve, reject) => {
      var builder = new Builder();
        var reqXml = builder.buildObject(this.auth.getAuthData());

        Axios.post(this.ENDPOINT, reqXml, {
          headers: {'Content-Type': 'text/xml'}
        }).then(res => {
          var parser = new Parser();

          parser.parseString(res.data, (err, result) => {
            if (err) {
              reject(err);
              return;
            }
            console.dir(result);
            this.authenticated = true;
            resolve();
          });
        })
    });
  }
}