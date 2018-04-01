import OpenSubtitleAuth from "./opensubtitle-auth";
import { createClient } from "xmlrpc";

export default class OpensubtitlesManager {
  private auth: OpenSubtitleAuth;

  constructor (auth: OpenSubtitleAuth) {
    this.auth = auth;
  }

  call(method: string, data: any, login?: boolean): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        var client = createClient({
          host: 'api.opensubtitles.org',
          port: 80,
          path: '/xml-rpc'
        });

        if (typeof login === 'undefined' || login === false) {
          data = [this.auth.token, data];
        }

        client.methodCall(method, data, (err, data) => {
          if (err) {
            reject(err);
          }
          resolve(data);
        })
    });
  }
}