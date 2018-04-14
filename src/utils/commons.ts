import chalk from 'chalk';
import { appendFileSync, createReadStream, createWriteStream, existsSync, readFileSync } from 'fs';
import { readJsonSync } from 'fs-extra';
import * as unrar from 'node-unrar-js';
import { normalize, sep } from 'path';
import * as unzip from 'unzip';

import FileInfo from '../interfaces/fileInfoInterface';
import Sub from '../interfaces/subInterface';
import Logger from './logger';
import TYPES from './origin-types';

export default class Commons {
  private static log: Logger = Logger.getInstance();

  static REGEX = {
    TOKENIZE: /([a-zA-Z0-9\[\]\(\)]{2,}|([a-zA-Z0-9]\.)+)/g,
    SEASON_EPISODE: /[s|S]\d{2}[e|E]\d{2}/,
    SEASON_EPISODE_OTHER: /\d{1,2}x\d{1,2}/,
    YEAR: /(\.|\s|\()\d{4}(\.|\s|\))/
  }

  static sortSubFn(a: Sub, b: Sub){
    if (a.score > b.score) {
      return -1;
    } else if (a.score === b.score) {
      return 0
    } else {
      return 1;
    }
  }

  static readJson(path: string) {
    return readJsonSync(path);
  }

  static numRightPad(value: number, num: number = 2) {
    return new String (Math.pow(10, num) + value).substring(1);
  }

  static getFileBaseTitle(sub: Sub, filename: string, index: number = 0): string {
    var indexStr = index > 0 ? `.${index}` : '';
    var ext =  filename.split('.').pop();
    var title = sub.file.filename;

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
          fname = this.getFileBaseTitle(sub, entry.path, i++);
          while (existsSync(`${dest}/${fname}`)) {
            fname = this.getFileBaseTitle(sub, entry.path, i++);
          }

          entry.pipe(createWriteStream(`${dest}/${fname}`)
            .on('close', () => {
              console.log(chalk.yellow(`File '${entry.path}' extracted as '${normalize(dest + sep + fname)}'`));
            }));
        } else {
          entry.autodrain();
        }
      })
      .on('close', () => resolve())
      .on('error', err => reject(err));
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
            filename =  this.getFileBaseTitle(sub, file.fileHeader.name, i++);

            while (existsSync(`${dest}/${filename}`)) {
              filename =  this.getFileBaseTitle(sub, file.fileHeader.name, i++);
            }
            //  // Uint8Array
            appendFileSync(`${dest}/${filename}`, new Buffer(buffer));
            console.log(chalk.yellow(`File '${file.fileHeader.name}' extracted as '${normalize(dest + sep + filename)}'`));
          }
        });
        resolve();
      } else {
        reject();
      }
    });

  }

  static tokenize(filepath: string): RegExpMatchArray {
    return filepath.match(this.REGEX.TOKENIZE).map(token => token.replace(/\./g, ' ').trim().replace(/\s/g, '.'));
  }

  static getFilename (filepath: string) {
    return filepath.substring(filepath.lastIndexOf(sep) + 1);
  }

  static getTitle(tokens: RegExpMatchArray): string {
    var title: string[] = [];

    for (let index = 0; index < tokens.length; index++) {
      const token: string = tokens[index];
      if (this.REGEX.SEASON_EPISODE.test(token)) {
        break;
      }
      title.push(token);
    }

    return title.join(' ');
  }

  static getSearchText(file: FileInfo): string {
    var title = file.title;
    var normalize = Commons.numRightPad;

    if (file.type === TYPES.FILE.MOVIE) {
      return `${title} ${file.year}`;
    }

    return `${title} S${normalize(file.season)}E${normalize(file.episode)}`;
  }

  static hash () {}
}