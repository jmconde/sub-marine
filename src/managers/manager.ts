import { request, RequestOptions } from "http";
import { stringify } from "querystring";
import * as URI from "urijs";
import * as uriTemplate from "uri-templates";
import Metadata from "../interfaces/metadata";

export default abstract class Manager {
  abstract URL:string;
  API_KEY?: string;
  LIST_DATA_PATH?: string;

  abstract mapper(response: any, meta?: Metadata): Metadata;
  abstract fill(meta: Metadata): Promise<Metadata>;

  async delete?(url: String): Promise<Metadata>;
  async post?(url: String, body: any): Promise<Metadata>;
  async put?(url: String, body: any): Promise<Metadata>;

  async get(path: string = '', query: any,  meta?: Metadata): Promise<Metadata> {
    console.log('In OMDBManager getMovie');

    return this.makeRequest(this.getUrl(query, path), 'get',  meta)
      .then(json => this.mapper(json, meta));
  }

  async list(path: string = '', query: any,  meta?: Metadata): Promise<Metadata[]>{
    return this.makeRequest(this.getUrl(query, path), 'get',  meta)
      .then(json => {
        if (this.LIST_DATA_PATH) {
          json = json[this.LIST_DATA_PATH];
        }

        return json.map(d => this.mapper(d, meta))
      });
  }

  getToken(tokenId: string) {
    var tokens = {
      omdb: {
        name: 'apiKey',
        token: '6917d31e'
      },
      tmdb: {
        name: 'api_key',
        token: 'e03b8ee55f0715ceef0a188e53ad593d'
      }
    }

    return tokens[tokenId];
  }

  getUrl(query: any, path: string = ''): string {
    var token;

    query = query || {};

    if (this.API_KEY) {
      token = this.getToken(this.API_KEY);
      query[token.name] = token.token;
    }
    return new uriTemplate(this.URL + path + '{?params*}').fillFromObject({params: query});;
  }

  getPath(path: string, data: any) {
    return new uriTemplate(path).fill(data);
  }

  makeRequest (url: string, method: string = 'get', meta?: Metadata, body?: any) : Promise<any>{
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
          resolve(json);
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