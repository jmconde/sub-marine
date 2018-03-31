import chalk from 'chalk';
import * as del from 'del';
import { createWriteStream } from 'fs';
import * as request from 'request';

import Commons from './commons';
import OriginFactory from './factory';
import OriginInterface from './interfaces/originInterface';
import Sub from './interfaces/subInterface';

class SubMarine {
  public text: string;
  static readonly ORIGINS = {
    SUBDIVX: 'subdivx'
  };

  get(originType: String, textToSearch: String, tuneText?: String): Promise<Sub[]> {
    let origin: OriginInterface = OriginFactory.getOrigin(originType);
    return origin.search(textToSearch, tuneText);
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

export default SubMarine;