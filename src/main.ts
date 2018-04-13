import chalk from 'chalk';
import * as del from 'del';
import { createWriteStream } from 'fs';
import { normalize, sep } from 'path';
import * as request from 'request';

import Metadata from './interfaces/metadataInterface';
import OriginInterface from './interfaces/originInterface';
import Sub from './interfaces/subInterface';
import OMDBManager from './managers/OMDBManager';
import TMDbManager from './managers/TMDbManager';
import TVMazeManager from './managers/TVMazeManager';
import Commons from './utils/commons';
import OriginFactory from './origins/originFactory';
import FilenameManager from './managers/FilenameManager';
import Logger from './utils/logger';
import MetadataStore from './utils/matadataStore';
import FileInfo from './interfaces/fileInfoInterface';
import Search from './interfaces/searchInterface';
import TYPES from './utils/origin-types';

export default class SubMarine {
  public text: string;
  private OMDB = new OMDBManager();
  private TMDb = new TMDbManager();
  private TVMaze = new TVMazeManager();
  private log = Logger.getInstance();
  private Filename = new FilenameManager();
  private store: MetadataStore = MetadataStore.Instance;

  async get(originType: String, filepath: string, langs: string[]): Promise<Sub[]> {
    let origin: OriginInterface;
    let promise: Promise<any> = Promise.resolve();
    var subs: Sub[] = [];
    var search: Search;

    return new Promise<Sub[]>(async (resolve, reject) => {
      var info = await this.getFileInfo(filepath);
      var metadataMap = await this.getMetadata(info);
      this.log.cDebug(Logger.YELLOW_BRIGHT, search)

      subs = await this.getSubs([OriginFactory.getOrigin(TYPES.ORIGIN.SUBDIVX), OriginFactory.getOrigin(TYPES.ORIGIN.OPEN_SUBTITLES)], metadataMap, info);
      resolve(subs);

    });
  }



    // origin =  OriginFactory.getOrigin(originType);

    // if (origin.authRequired) {
    //   promise = promise.then(() => origin.authenticate());
    // }

    // promise = this.getMetadata(filepath)
    //   .then(meta => origin.search(meta, langs));

  // promise = promise.then(() => [])
  //   // promise.then((meta) => );
  //   // promise = promise.catch(() => []);

  async getSubs(origins: OriginInterface[],  metadataMap: Map<string, Metadata>, info: FileInfo) : Promise<Sub[]> {
    var promises = [];
    var search = {
      fileInfo: info,
      searchString: Commons.getSearchText(info),
      langs: [],
      metadata: null
    };
    console.log('GET SUBIS::::::::::::::::::::::::::::::');
    origins.forEach(origin => {
      metadataMap.forEach((meta, key) => {
        var promise = Promise.resolve();
         if (origin.authRequired) {
          promise = promise.then(() => origin.authenticate());
        }
        search.metadata = meta;
        promises.push(promise.then(() => origin.search(search)));
      })
    });

    return Promise.all(promises).then(r => {
      var subs: Sub[] = [];
      var urlMap: Map<string, string> = new Map();
      r.forEach(s => subs = subs.concat(s));
      subs = subs.reduce((acc, val) => {
        var mapped = urlMap.get(val.url);
        if (!mapped) {
          acc.push(val);
          urlMap.set(val.url, '=oOo=');
        }
        return acc;
      }, []).filter(s => typeof s.url === 'string');
      return Promise.resolve<Sub[]>(subs);
    });
  }

  async getFileInfo(path: string): Promise<FileInfo> {
    return this.Filename.fill(normalize(path))
      .then(fileInfo => {
        this.log.debug(chalk.blueBright(JSON.stringify(fileInfo, null, 2)));
        this.store.set(this.Filename.ID, fileInfo);
        return fileInfo;
      });
  }

  async getMetadata(info: FileInfo): Promise<Map<string, Metadata>> {
    var map: Map<string, Metadata> = new Map();

    map.set(this.OMDB.ID, await this.OMDB.fill(info));
    map.set(this.TMDb.ID, await this.TMDb.fill(info));
    if (info.type === TYPES.FILE.EPISODE) {
      map.set(this.TVMaze.ID, await this.TVMaze.fill(info));
    }

    return Promise.resolve(map);
  }

  download(sub: Sub, path?: string): Promise<void> {
    var date = new Date().getTime();
    var tempFile = `./temp_${date}`;
    var found = false;
    var type;

    path = path || sub.meta.path.substring(0, sub.meta.path.lastIndexOf(sep));

    return new Promise<void>((resolve, reject) => {
      if (!sub.url) {
        console.error(chalk.red('Error: No URL.'));
        reject();
      }

      request(sub.url.toString())
        .on('response', response => {
          switch(response.headers['content-type']) {
            case 'application/x-rar-compressed':
              type = 'rar';
              break;
            case 'application/zip':
              type = 'zip';
              break;
            case 'text/plain':
              type = 'txt';
              break;
          }
        })
        .pipe(createWriteStream(tempFile))
        .on('close', () => {
          var promise: Promise<void>;
          if (type === 'zip') {
            promise = Commons.unzip(tempFile, path, sub);
          } else if (type === 'rar') {
            promise = Commons.unrar(tempFile, path, sub);
          } else if (type === 'txt') {
            // TOOD:
          } else {
            // TODO:
          }

          promise.then(() => {
            console.log(chalk.gray('Process finished'));
            del(tempFile);
            resolve();
          }).catch(e => {
            del(tempFile);
            this.log.error(chalk.red('Error!!', e));
            reject();
          })

        });
    })
  }
}