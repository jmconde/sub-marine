import chalk from 'chalk';
import * as del from 'del';
import { createWriteStream } from 'fs';
import { normalize } from 'path';
import * as request from 'request';

import FileInfo from './interfaces/fileInfoInterface';
import Metadata from './interfaces/metadataInterface';
import OriginInterface from './interfaces/originInterface';
import Search from './interfaces/searchInterface';
import Sub from './interfaces/subInterface';
import FilenameManager from './managers/FilenameManager';
import OMDBManager from './managers/OMDBManager';
import TMDbManager from './managers/TMDbManager';
import TVMazeManager from './managers/TVMazeManager';
import OriginFactory from './origins/originFactory';
import Commons from './utils/commons';
import Logger from './utils/logger';
import TYPES from './utils/origin-types';
import { isArray } from 'util';

export default class SubMarine {
  public text: string;
  private OMDB: OMDBManager;
  private TMDb: TMDbManager;
  private TVMaze: TVMazeManager;
  private log = Logger.getInstance('error');
  private Filename = new FilenameManager();
  private config: any;

  constructor() {
    // var config = this.config = Commons.readJson('./submarineconfig.json');
    var config = {
      "datasource": {
        "omdb": {
          "id": "omdb",
          "url": "http://www.omdbapi.com"
        },
        "tmdb": {
          "id": "tmdb",
          "url": "http://api.themoviedb.org"
        },
        "tvmaze": {
          "id": "tvmaze",
          "url": "http://api.tvmaze.com"
        }
      },
      "origins": {
        "opensubtitles": {
          "auth": true,
          "ISO693Version": "2",
          "url": "https://api.opensubtitles.org/xml-rpc"
        },
        "subdivx": {
          "ISO693Version": "2",
          "url": "https://www.subdivx.com/index.php"
        }
      },
      "client": {
        "langs": [
          { "id": "es", "checked": true},
          { "id": "en", "checked": true},
          { "id": "fr", "checked": false},
          { "id": "pt", "checked": false},
          { "id": "de", "checked": false},
          { "id": "it", "checked": false},
          { "id": "ru", "checked": false},
          { "id": "ko", "checked": false}
        ],
        "extensions": ["avi","mp4","mkv","webm"]
      }
    };
    this.OMDB = new OMDBManager(config.datasource.omdb);
    this.TMDb = new TMDbManager(config.datasource.tmdb);
    this.TVMaze = new TVMazeManager(config.datasource.tvmaze);
  }

  /**
   * Gets a list of donwloadable subtitles.
   *
   * @param originTypes array of subtitle databases IDs (origin)
   * @param filepath File to search for subtitles and info
   * @param langs langs required in ISO 639-1 code
   */
  async get(originTypes: string[], filepath: string, langs: string[]): Promise<Sub[]> {
    let promise: Promise<any> = Promise.resolve();
    var subs: Sub[] = [];
    var search: Search;

    return new Promise<Sub[]>(async (resolve, reject) => {
      var info = await this.getFileInfo(filepath);
      var metadataMap = await this.getMetadata(info);
      this.log.cDebug(Logger.YELLOW_BRIGHT, search)

      subs = await this.getSubs(this.getOrigins(originTypes), metadataMap, info, langs);
      resolve(subs);

    });
  }

  getOrigins(types: string[]): OriginInterface[] {
    return types.map<OriginInterface>(type => {
      return OriginFactory.getOrigin(type);
    });
  }

  async getSubs(origins: OriginInterface[],  metadataMap: Map<string, Metadata>, info: FileInfo, langs: string[]) : Promise<Sub[]> {
    var promises = [];
    var search = {
      fileInfo: info,
      searchString: Commons.getSearchText(info),
      langs,
      metadata: null,
      registry: new Map<string, string[]>()
    };

    origins.forEach(origin => {
      search.registry.set(origin.ID, []);
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
      r.forEach(s => {
        subs = subs.concat(s.filter(s => typeof s.url === 'string').slice(0,2))
      });
      subs = subs.reduce((acc, val) => {
        var mapped = urlMap.get(val.url);
        if (!mapped) {
          acc.push(val);
          urlMap.set(val.url, '=oOo=');
        }
        return acc;
      }, []);
      return Promise.resolve<Sub[]>(subs);
    });
  }

  async getFileInfo(path: string): Promise<FileInfo> {
    return this.Filename.fill(normalize(path))
      .then(fileInfo => {
        this.log.debug(chalk.blueBright(JSON.stringify(fileInfo, null, 2)));
        return fileInfo;
      });
  }

  async getMetadata(info: FileInfo): Promise<Map<string, Metadata>> {
    var map: Map<string, Metadata> = new Map();
    var omdb: Metadata = await this.OMDB.fill(info);
    var tmdb: Metadata = await this.TMDb.fill(info);
    var tvmaze: Metadata;

    if (omdb) map.set(this.OMDB.ID, omdb);
    if (tmdb) map.set(this.TMDb.ID, tmdb);
    if (info.type === TYPES.FILE.EPISODE) {
      tvmaze = await this.TVMaze.fill(info);
      if (tvmaze) map.set(this.TVMaze.ID, tvmaze);
    }

    return Promise.resolve(map);
  }

  async download(subs: Sub |Sub[], path?: string): Promise<void> {
    var promises = [];

    path = normalize(path);

    if (!isArray(subs)) {
      subs = [subs];
    }

    promises = subs.map(sub => {
      return this.downloadSingleSub(sub, path);
    })

    return new Promise<void>((resolve, reject) =>{
      Promise.all(promises).then(() => {
        console.log(chalk.gray('Process finished'));
        resolve();
      })
    });

  };

  private downloadSingleSub(sub: Sub, path?: string): Promise<void> {
    var date = new Date().getTime();
    var tempFile = `./temp_${date}_${(Math.random() *1000).toFixed(0)}`;
    var found = false;
    var type;

    path = path || sub.file.path;

    return new Promise<void>((resolve, reject) => {
      if (!sub.url) {
        console.error(chalk.red('Error: No URL.'));
        resolve();
        return;
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
            del.sync(tempFile);
            resolve();
          }).catch(e => {
            del.sync(tempFile);
            this.log.error(chalk.red('Error!!', e));
            resolve();
          })

        });
    })
  }
}