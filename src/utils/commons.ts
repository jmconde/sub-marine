import Axios from 'axios';
import chalk from 'chalk';
import { appendFileSync, createReadStream, createWriteStream, readFileSync } from 'fs';
import { pathExistsSync } from 'fs-extra';
import * as unrar from 'node-unrar-js';
import { sep } from 'path';
import * as unzip from 'unzip';

import Metadata from '../interfaces/metadata';
import Sub from '../interfaces/subInterface';

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

  static async getMetadataFromTMDb(meta: Metadata): Promise<Metadata> {
    return Promise.reject('Not implemented');
  }

  static async getMetadataFromOMDB(meta: Metadata): Promise<Metadata> {
    console.log(chalk.grey('getting metadata from OMDB...'));
    return new Promise<Metadata>((resolve, reject) => {
      var type = meta.type === 'movie' ? 'movie' : 'series';
      Axios.get(`http://www.omdbapi.com/?t=${encodeURIComponent(meta.title)}&apikey=6917d31e&type=${type}`)
        .then(response => {
          var data = response.data;

          if (data.Error) {
            reject('OMDb: ' + data.Error);
          }

          if (meta.type === 'movie') {
            meta.year = data.Year;
            meta.rated = data.Rated;
            meta.imdbID = data.imdbID;
            meta.plot = data.Plot;
            meta.runtime = data.Runtime;
            meta.search = Commons.getSearchText(meta);
            resolve(meta);
          } else {
            Axios.get(`http://www.omdbapi.com/?t=${encodeURIComponent(meta.title)}&apikey=6917d31e&type=episode&Season=${meta.season}&Episode=${meta.episode}`)
              .then(episodeResponse => {
                var episodeData = episodeResponse.data;

                if (episodeData.Error) {
                  reject('OMDb: Episode not found!');
                }

                meta.year = episodeData.Year;
                meta.episodeTitle = episodeData.Title;
                meta.rated = episodeData.Rated;
                meta.imdbID = episodeData.imdbID;
                meta.seriesID = episodeData.seriesID;
                meta.plot = episodeData.Plot;
                meta.runtime = episodeData.Runtime;
                meta.search = Commons.getSearchText(meta);
                resolve(meta);
              });
          }
        })
        .catch((err) => {
          reject(err);
        });
    })
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

    console.log(this.getTitle(tokens));
    console.log(chalk.grey("getting Metadata from filename..."));
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
        year = matcher[0];
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