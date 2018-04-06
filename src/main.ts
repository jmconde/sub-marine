import chalk from 'chalk';
import * as del from 'del';
import { createWriteStream } from 'fs';
import { normalize } from 'path';
import * as request from 'request';

import Commons from './utils/commons';
import OriginFactory from './utils/factory';
import OriginInterface from './interfaces/originInterface';
import Sub from './interfaces/subInterface';
import OMDBManager from './managers/OMDBManager';
import TMDbManager from './managers/TMDbManager';

export default class SubMarine {
  public text: string;
  private OMDB = new OMDBManager();
  private TMDb = new TMDbManager();
  static readonly ORIGINS = {
    SUBDIVX: 'subdivx'
  };

  get(originType: String, filepath: string, langs: string[]): Promise<Sub[]> {
    let origin: OriginInterface = OriginFactory.getOrigin(originType);
    let promise: Promise<any> = Promise.resolve();

    if (origin.authRequired) {
      promise = promise.then(() => origin.authenticate());
    }

    promise = promise.then(() => Commons.getMetaDataFromFilename(normalize(filepath)));
    promise = promise.then((meta) => this.TMDb.fill(meta));
    // promise = promise.then((meta) => this.OMDB.fill(meta));


    return promise.then((meta) => origin.search(meta, langs));
  }

  download(sub: Sub, path: string = './'): Promise<void> {
    var date = new Date().getTime();
    var tempFile = `./temp_${date}`;
    var found = false;
    var type;

    return new Promise<void>((resolve, reject) => {
      if (!sub.url) {
        console.error(chalk.red('Error: No URL.'));
        reject();
      }

      request(sub.url.toString())
        .on('response', function(response) {
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
        .on('close', function () {
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
          }).catch(() => {
            del(tempFile);
            console.log(chalk.red('Error!!'));
            reject();
          })

        });
    })
    // var request = http.get(sub.url.toString() , function(response) {
    //   response.pipe(file);
    // });
  }
}