import { request, RequestOptions } from "http";
import { stringify } from "querystring";
import * as URI from "urijs";
import Metadata from "../interfaces/metadata";

export default abstract class Manager {
  abstract URL:string;
  abstract API_KEY: string;

  abstract mapper(response: any, meta?: Metadata): Metadata;
  async list?(url: String): Promise<Metadata[]>;
  async delete?(url: String): Promise<Metadata>;
  async post?(url: String, body: any): Promise<Metadata>;
  async put?(url: String, body: any): Promise<Metadata>;

  get(options: any, meta?: Metadata): Promise<Metadata> {
    console.log('In OMDBManager getMovie');

    return this.makeRequest(this.getUrl(options), 'get',  meta);
  }

  getToken(tokenId: string) {
    var tokens = {
      omdb: '6917d31e',
      tmdb: 'e03b8ee55f0715ceef0a188e53ad593d'
    }

    return tokens[tokenId];
  }

  getUrl(options): string {
    var uri = new URI(this.URL);

    uri.query(options);

    return uri.toString();
  }

  makeRequest (url: string, method: string = 'get', meta?: Metadata, body?: any) : Promise<Metadata>{
    // var options = new URL(url);
    var postData;
    var data = [];

    return new Promise<Metadata>((resolve, reject) => {
      console.log('->', url);
      var req = request(url, res => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          data.push(chunk);
        });
        res.on('end', () => {
          var json = JSON.parse(data.join(''));
          resolve(this.mapper(json, meta));
        })
      });

      req.on('error', (e) => {
        reject(e);
      });

      if (method !== 'get') {
        postData = stringify(body);
        req.write(postData);
      }

      req.end();
    });
  }

}