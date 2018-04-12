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
import OriginFactory from './utils/factory';
import FilenameManager from './managers/FilenameManager';
import Logger from './utils/logger';
import MetadataStore from './utils/matadataStore';
import FileInfo from './interfaces/fileInfoInterface';
import Search from './interfaces/searchInterface';

export default class SubMarine {
  public text: string;
  private OMDB = new OMDBManager();
  private TMDb = new TMDbManager();
  private TVMaze = new TVMazeManager();
  private log = Logger.getInstance();
  private Filename = new FilenameManager();
  private store: MetadataStore = MetadataStore.Instance;

  get(originType: String, filepath: string, langs: string[]): Promise<Sub[]> {
    let origin: OriginInterface;
    let promise: Promise<any> = Promise.resolve();
    var subs: Sub[] = [];
    var search: Search;

    return new Promise<Sub[]>((resolve, reject) => {
      var promises = [];

      this.getFileInfo(filepath).then(info => {
        search = {
          fileInfo: info,
          searchString: Commons.getSearchText(info),
          langs: [],
          metadata: null
        };

        this.log.cDebug(Logger.YELLOW_BRIGHT, search)

        promises[0] = this.OMDB.fill(info);
        promises[1] = this.TMDb.fill(info);
        promises[2] = this.TVMaze.fill(info);

        Promise.all(promises).then(r => {
          console.log('\n\n\n');
          console.log(r);
          resolve(subs);
        });
      });



      //   // var data = [

      //   // ]
      //   resolve([]);
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

  getFileInfo(path: string): Promise<FileInfo> {
    return this.Filename.fill(normalize(path))
      .then(fileInfo => {
        this.log.debug(chalk.blueBright(JSON.stringify(fileInfo, null, 2)));
        this.store.set(this.Filename.ID, fileInfo);
        return fileInfo;
      });
  }

  // getMetadata(meta: Metadata): Promise<Metadata> {
  //   console.log(chalk.greenBright(this.log.getLevel()));
  //   return this.TMDb.fill(meta)
  //     .then(TMDbMeta => {
  //       this.log.debug(chalk.yellowBright(JSON.stringify(TMDbMeta, null, 2)));
  //       this.store.set(this.TMDb.ID, TMDbMeta);
  //       return TMDbMeta;
  //     })
  //     .then(meta => this.OMDB.fill(meta))
  //     .then(OMDBMeta => {
  //       console.log('================================');
  //       this.store.set(this.OMDB.ID, OMDBMeta)
  //       return this.store.get(this.TMDb.ID);
  //     })

  //     /*
  //     .then((meta) => this.OMDB.fill(meta).catch(err => Promise.resolve<Metadata>(meta)))
  //     .then(OMDBMeta => {
  //       this.log.debug(chalk.greenBright(JSON.stringify(OMDBMeta, null, 2)));
  //       this.store.set(this.OMDB.ID, OMDBMeta);
  //       return OMDBMeta;
  //     }) */
  //     .catch(err => this.log.error(err));
  // }

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