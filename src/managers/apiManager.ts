import { request, RequestOptions } from "http";
import { stringify } from "querystring";
import * as URI from "urijs";
import * as uriTemplate from "uri-templates";
import Metadata from "../interfaces/metadataInterface";
import Mapper from "./mappers/mapper";
import Manager from "../interfaces/manager";
import Logger from "../utils/logger";
import chalk from "chalk";

export default abstract class ApiManager implements Manager {
  abstract URL:string;
  abstract ID: string;
  LIST_DATA_PATH?: string;
  abstract mapper: Mapper;
  static readonly REPONSE_OK = 0;
  static readonly REPONSE_NOT_FOUND = 1;

  protected log: Logger = Logger.Instance;

  abstract fill(meta: Metadata): Promise<Metadata>;
  abstract check(json): number;

  async delete?(url: String): Promise<Metadata>;
  async post?(url: String, body: any): Promise<Metadata>;
  async put?(url: String, body: any): Promise<Metadata>;

  async get(path: string = '', query: any,  meta: Metadata): Promise<Metadata> {
    return this.makeRequest(this.getUrl(query, path), 'get',  meta)
      .then(json => {
        var code: number = this.check(json);
        this.log.colored('debug', 'magentaBright', json);
        return (code === 0) ? this.mapper.map(json, meta.type) : Promise.reject<Metadata>('Error ' +  code);
      });
  }

  async rawGet(path: string = '', query: any): Promise<any> {
    return this.makeRequest(this.getUrl(query, path), 'get');
  }

  async list(path: string = '', query: any,  meta: Metadata): Promise<Metadata[]>{
    return this.makeRequest(this.getUrl(query, path), 'get',  meta)
      .then(json => {
        if (this.LIST_DATA_PATH) {
          json = json[this.LIST_DATA_PATH];
        }

        return json.map(d => this.mapper.map(d, meta.type))
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

    if (this.ID) {
      token = this.getToken(this.ID);
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
      this.log.debug('->', url);
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