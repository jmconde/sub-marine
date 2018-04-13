import { request } from 'http';
import { stringify } from 'querystring';
import * as uriTemplate from 'uri-templates';

import FileInfo from '../interfaces/fileInfoInterface';
import Manager from '../interfaces/manager';
import Metadata from '../interfaces/metadataInterface';
import Logger from '../utils/logger';
import Mapper from './mappers/mapper';

export default abstract class ApiManager implements Manager {
  abstract URL:string;
  abstract ID: string;
  LIST_DATA_PATH?: string;
  abstract mapper: Mapper;
  static readonly REPONSE_OK = 0;
  static readonly REPONSE_NOT_FOUND = 1;

  protected log: Logger = Logger.getInstance();

  abstract fill(info: FileInfo): Promise<Metadata>;
  abstract check(json): number;

  async delete?(url: String): Promise<Metadata>;
  async post?(url: String, body: any): Promise<Metadata>;
  async put?(url: String, body: any): Promise<Metadata>;

  async get(path: string = '', query: any, type: string): Promise<Metadata> {
    return this.rawGet(path, query)
      .then(json => {
        var code: number = this.check(json);
        this.log.colored('debug', 'magentaBright', json);
        return (code === 0) ? this.mapper.map(json, type) : Promise.reject<Metadata>('Error ' +  code);
      });
  }

  async rawGet(path: string = '', query: any): Promise<any> {
    var url =  this.getUrl(query, path);
    return this.makeRequest(url, 'get');
  }

  async list(path: string = '', query: any, type: string): Promise<Metadata[]>{
    return this.makeRequest(this.getUrl(query, path), 'get')
      .then(json => {
        if (this.LIST_DATA_PATH) {
          json = json[this.LIST_DATA_PATH];
        }

        return json.map(d => this.mapper.map(d, type))
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
      if (token) {
        query[token.name] = token.token;
      }
    }
    return new uriTemplate(this.URL + path + '{?params*}').fillFromObject({params: query});;
  }

  getPath(path: string, data: any) {
    return new uriTemplate(path).fill(data);
  }

  makeRequest (url: string, method: string = 'get', body?: any) : Promise<any>{
    var postData;
    var data = [];
    this.log.cInfo(Logger.MAGENTA_BRIGHT, '->', url);

    return new Promise<any>((resolve, reject) => {
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