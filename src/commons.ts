import chalk from 'chalk';
import { appendFileSync, createReadStream, createWriteStream, readFileSync } from 'fs';
import * as unrar from 'node-unrar-js';
import * as unzip from 'unzip';

import Sub from './interfaces/subInterface';

export default class Commons {
  static getBaseTitle(sub: Sub, filename: string, index: number = 0): string {
    var indexStr = index > 0 ? `.${index}` : '';
    var ext = filename.split('.').pop();
    var title = sub.title.replace(/\s/g, '.');

    return `${title}${indexStr}.${sub.lang}.${ext}`;
  }

  static isSubtitle(filename: string): boolean {
    return (/\.(srt|ssa|sub|sbv|mpsub|lrc|cap)$/i).test(filename);
  }

  static unzip (zipFile: string, dest: string, sub: Sub): Promise<void> {
    console.log(chalk.grey('Unzipping...'));
    return new Promise<void>((resolve, reject) => {
      createReadStream(zipFile)
      .pipe(unzip.Parse())
      .on('entry', entry => {
        var i = 0;
        var fname;

        if (entry.type === 'File' && this.isSubtitle(entry.path)) {
          fname = this.getBaseTitle(sub, entry.path, i++);
          entry.pipe(createWriteStream(`${dest}/${fname}`)
            .on('close', function () {
              console.log(chalk.yellow(`File '${entry.path}' extracted as ${dest}/${fname}.`));
            }));
        } else {
          entry.autodrain();
        }
      })
      .on('close', () => resolve())
      .on('error', () => reject());
    });
  }

  static unrar (rarFile: string, dest: string, sub: Sub): Promise<void> {
    console.log(chalk.grey('Unarchiving RAR...'));
    var buf = Uint8Array.from(readFileSync(rarFile)).buffer;
    var extractor = unrar.createExtractorFromData(buf);
    var downloadList = [];
    var list = extractor.getFileList();
    var i = 0;
    var suffix = '';
    var ext, filename, extracted;

    return new Promise<void>((resolve, reject) => {
      if (list[0].state === "SUCCESS" && list[1] !== null) {
        list[1].fileHeaders.forEach((file) => {
          if (!file.flags.directory) {
            downloadList.push(file.name);
          }
        });
      } else {
        reject();
        return;
      }

       extracted = extractor.extractFiles(downloadList);

      if (extracted[0].state === "SUCCESS") {
        extracted[1].files.forEach(file => {
          var buffer;

          if (file.extract[0].state === "SUCCESS") {
            buffer = file.extract[1];
            filename =  this.getBaseTitle(sub, file.fileHeader.name, i++);
            //  // Uint8Array
            appendFileSync(`${dest}/${filename}`, new Buffer(buffer));
            console.log(chalk.yellow(`File '${file.fileHeader.name}' extracted as '${dest}/${filename}'.`));
          }
        });
        resolve();
      } else {
        reject();
      }
    });

  }
}