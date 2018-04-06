import chalk from 'chalk';
import { appendFileSync, createReadStream, createWriteStream, readFileSync } from 'fs';
import { pathExistsSync } from 'fs-extra';
import * as unrar from 'node-unrar-js';
import { sep } from 'path';
import * as unzip from 'unzip';

import Metadata from '../interfaces/metadata';
import Sub from '../interfaces/subInterface';
import OMDBManager from '../managers/OMDBManager';
import TMDbManager from '../managers/TMDbManager';

export default class Commons {
  static REGEX = {
    TOKENIZE: /([a-zA-Z0-9\[\]\(\)]{2,}|([a-zA-Z0-9]\.)+)/g,
    SEASON_EPISODE: /[s|S]\d{2}[e|E]\d{2}/,
    SEASON_EPISODE_OTHER: /\d{1,2}x\d{1,2}/,
    YEAR: /(\.|\s|\()\d{4}(\.|\s|\))/
  }
  static getFileBaseTitle(sub: Sub, filename: string, index: number = 0): string {
    var indexStr = index > 0 ? `.${index}` : '';
    var ext = filename.split('.').pop();
    var title = sub.meta.search.replace(/\s/g, '.');

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
            filename =  this.getFileBaseTitle(sub, file.fileHeader.name, i++);
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

  static async getMetaDataFromFilename(filepath: string): Promise<Metadata> {
    var tokens = this.tokenize(this.getFilename(filepath));

    return new Promise<Metadata>((resolve, reject) => {
      var type: string = 'movie';
      var matcher: RegExpMatchArray,
        data: string,
        season: number,
        episode: number,
        title: string,
        year: string,
        filename: string;

      if (!pathExistsSync(filepath)) {
        reject('File does not exist.')
        return;
      }
      filename = filepath.substring(filepath.lastIndexOf(sep) + 1);
      matcher = filename.match(this.REGEX.SEASON_EPISODE);
      if (matcher !== null) {
        type = 'series';
      } else {
        matcher = filename.match(this.REGEX.YEAR);
      }
      data = matcher[0].toUpperCase();
      title = filename.substring(0, matcher.index).replace(/\.|\(\)/g, ' ').trim();

      if (type === 'series') {
        season = Number(data.substring(1, 3));
        episode = Number(data.substring(4));
      } else {
        year = matcher[0].replace(/\.|\(\)/g, ' ').trim();
      }

      var meta: Metadata = {
        title,
        type,
        filename,
        path: filepath,
        season,
        episode,
        year
      };

      meta.search = Commons.getSearchText(meta);

      console.log(meta);

      resolve(meta);
    });
  }

  static getSearchText(meta: Metadata): string {
    var normalize = num => new String (100 + num).substring(1);

    if (meta.type === 'movie') {
      return `${meta.title} ${meta.year}`;
    }

    return `${meta.title} S${normalize(meta.season)}E${normalize(meta.episode)}`;
  }

  static hash () {}
}