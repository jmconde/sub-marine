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
import Commons from './utils/commons';
import OriginFactory from './utils/factory';
import FilenameManager from './managers/FilenameManager';
import Logger from './utils/logger';
import MetadataStore from './utils/matadataStore';

export default class SubMarine {
  public text: string;
  private OMDB = new OMDBManager();
  private TMDb = new TMDbManager();
  private log = Logger.Instance;
  private Filename = new FilenameManager();
  private store: MetadataStore = MetadataStore.Instance;

  get(originType: String, filepath: string, langs: string[]): Promise<Sub[]> {
    this.log.setLevel('all');
    let origin: OriginInterface;
    let promise: Promise<any> = Promise.resolve();


    origin =  OriginFactory.getOrigin(originType);

    if (origin.authRequired) {
      promise = promise.then(() => origin.authenticate());
    }

    promise = this.getMetadata(filepath)
      .then(meta => origin.search(meta, langs));

  // promise = promise.then(() => [])
  //   // promise.then((meta) => );
  //   // promise = promise.catch(() => []);
  return promise;

  }

  getMetadata(filePath: string): Promise<Metadata> {
    console.log(chalk.greenBright(this.log.getLevel()));
    return this.Filename.fill({path: normalize(filePath)})
      .then(fileMeta => {
        this.log.debug(chalk.blueBright(JSON.stringify(fileMeta, null, 2)));
        this.store.set(this.Filename.ID, fileMeta);
        return fileMeta;
      })
      .then((meta) =>  this.TMDb.fill(meta))
      .then(TMDbMeta => {
        this.log.debug(chalk.yellowBright(JSON.stringify(TMDbMeta, null, 2)));
        this.store.set(this.TMDb.ID, TMDbMeta);
        return TMDbMeta;
      })
      .then(meta => this.OMDB.fill(meta))
      .then(OMDBMeta => {
        console.log('================================');
        this.store.set(this.OMDB.ID, OMDBMeta)
        return this.store.get(this.TMDb.ID);
      })

      /*
      .then((meta) => this.OMDB.fill(meta).catch(err => Promise.resolve<Metadata>(meta)))
      .then(OMDBMeta => {
        this.log.debug(chalk.greenBright(JSON.stringify(OMDBMeta, null, 2)));
        this.store.set(this.OMDB.ID, OMDBMeta);
        return OMDBMeta;
      }) */
      .catch(err => this.log.error(err));
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