import { pathExistsSync } from 'fs-extra';
import { sep } from 'path';

import Manager from '../interfaces/manager';
import Metadata from '../interfaces/metadataInterface';
import Commons from '../utils/commons';
import chalk from 'chalk';
import Logger from '../utils/logger';

export default class FilenameManager implements Manager {
  ID:string = 'file';
  private log = Logger.Instance;

  fill(meta: Metadata): Promise<Metadata> {
    var filepath = meta.path;
    var tokens = Commons.tokenize(Commons.getFilename(filepath));

    console.log(chalk.grey('getting metadata from Filename...'));

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
      matcher = filename.match(Commons.REGEX.SEASON_EPISODE);
      if (matcher) {
        type = 'series';
      } else {
        matcher = filename.match(Commons.REGEX.YEAR);
      }
      data = matcher[0].toUpperCase();
      title = filename.substring(0, matcher.index);

      if (type === 'series') {
        season = Number(data.substring(1, 3));
        episode = Number(data.substring(4));
        matcher = title.match(Commons.REGEX.YEAR);

        if (matcher) {
          year = matcher[0].replace(/\.|\(\)/g, ' ').trim();
          title = title.replace(year, ' ');
        }
      } else {
        year = matcher[0].replace(/\.|\(\)/g, ' ').trim();
      }

      title = title.replace(/\.|\(\)/g, ' ').trim();
      this.log.colored('debug', 'greenBright', title);

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

      resolve(meta);
    });
  }
}