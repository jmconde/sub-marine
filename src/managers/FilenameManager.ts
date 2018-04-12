import { pathExistsSync } from 'fs-extra';
import { sep } from 'path';

import Manager from '../interfaces/manager';
import Metadata from '../interfaces/metadataInterface';
import Commons from '../utils/commons';
import chalk from 'chalk';
import Logger from '../utils/logger';
import FileInfo from '../interfaces/fileInfoInterface';
import TYPES from '../utils/origin-types';

export default class FilenameManager implements Manager{
  ID = 'fileInfo';
  private log = Logger.getInstance();

  fill(filePath): Promise<FileInfo> {
    var tokens = Commons.tokenize(Commons.getFilename(filePath));

    console.log(chalk.grey('getting metadata from Filename...'));

    return new Promise<FileInfo>((resolve, reject) => {
      var type: string = TYPES.FILE.MOVIE;
      var lastIndex = filePath.lastIndexOf(sep);
      var matcher: RegExpMatchArray,
        data: string,
        season: number,
        episode: number,
        title: string,
        year: string,
        filename: string,
        extension: string,
        fullName: string,
        path: string;

      if (!pathExistsSync(filePath)) {
        reject('File does not exist.')
        return;
      }
      fullName = filePath.substring(lastIndex + 1);
      filename = fullName.substring(0, fullName.lastIndexOf('.'))
      extension = fullName.split('.').pop();
      path = filePath.substring(0, lastIndex)
      matcher = filename.match(Commons.REGEX.SEASON_EPISODE);
      if (matcher) {
        type = TYPES.FILE.EPISODE;
      } else {
        matcher = filename.match(Commons.REGEX.YEAR);
      }
      data = matcher[0].toUpperCase();
      title = filename.substring(0, matcher.index);

      if (type === TYPES.FILE.EPISODE) {
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

      var info: FileInfo = {
        fullPath: filePath,
        filename,
        fullName,
        path,
        extension,
        title,
        type,
        season,
        episode,
        year
      };

      resolve(info);
    });
  }
}