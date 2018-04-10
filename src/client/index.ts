import chalk from 'chalk';
import * as commander from 'commander';
import * as glob from 'glob';
import { prompt, Separator } from 'inquirer';
import { PathPrompt } from 'inquirer-path';
import * as selectDir from "inquirer-select-directory";
import { normalize, sep } from 'path';
import Sub from '../interfaces/subInterface';
import SubMarine from '../main';
import TYPES from '../utils/origin-types';
import Logger from '../utils/logger';

prompt.registerPrompt('directory', selectDir);

const log = Logger.Instance;
log.setLevel('all');

const FILES =  {
  type: 'directory',
  name: 'path',
  message: 'Media files path:',
  basePath: 'd:/downloads/' //process.cwd()
};

const OPTIONS = [{
  type: 'list',
  name: 'origin',
  message: 'Select a choice:',
  choices: [{name: 'SubDivX', value: TYPES.ORIGIN.SUBDIVX}, {name: 'OpenSubtitles', value: TYPES.ORIGIN.OPEN_SUBTITLES}]
}];

const fileOpts = files => {
 return {
  type: 'list',
    name: 'file',
    message: `Select a file to download: [${files.length} Found]`,
    choices: files.map((file: string, i: number) => {
      return {name: `${i + 1}) ` + file.substring(file.lastIndexOf(sep) + 1) , value: file}
    }).concat([{name: '<< Go back >>' , value: '..'}])
 };
}

const subOptions = subs => {
  return {
    type: 'list',
    name: 'sub',
    message: `Select a sub to download: [${subs.length} Found]`,
    choices: subs.map((sub: Sub, i: number) => {
      return {name: `${i + 1}) ${sub.meta.filename} ${sub.lang} (Score: ${sub.score})`, value: sub}
    }).concat([new Separator()])
  }
};

const AGAIN = {
  type: 'confirm',
  name: 'confirm',
  message: 'Do you want search again?'
}

async function searchCycle(files: string[]): Promise<void> {
  var finished = false;
  var submarine = new SubMarine();

  while (!finished) {
    await new Promise<void>((resolve, reject) => {
      prompt(fileOpts(files)).then(choice => {
        if (choice.file === '..') {
          reject('back');
          return;
        } else {
          prompt(OPTIONS).then(answers => {
            submarine.get(answers.origin, choice.file, [])
              .then(subs => {
                if (subs && subs.length) {
                  prompt(subOptions(subs)).then(subSelection => {
                    submarine.download(subSelection.sub)
                      .then(() => {
                        prompt(AGAIN).then(again => {
                          again.confirm ? resolve() : reject();
                        })
                      })
                      .catch(() => {
                        console.error(chalk.red('Error!'));
                        prompt(AGAIN).then(again => {
                          again.confirm ? resolve() : reject();
                        });
                      })
                  });
                } else {
                  console.log(chalk.yellow('Not subs were found.'));
                  prompt(AGAIN).then(again => {
                    again.confirm ? resolve() : reject();
                  });
                }
              })
          })
        }
      });
    });
  }

  return Promise.resolve();
}

async function pFiles() {
  prompt(FILES).then(sel => {
    console.log(normalize(`${sel.path}/*.{avi,mp4,mkv,webm}`));
    glob(normalize(`${sel.path}/*.{avi,mp4,mkv,webm}`), {}, function (err, files) {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      log.debug(files);

      files = files.map(d => normalize(d));

      searchCycle(files)
        .catch(err => {
          if (err === 'back') {
            pFiles();
            return;
          }
          console.log(chalk.gray(`Thanks for using ${chalk.white('SubMarine')}.`));
          process.exit(0);
        });
    });
  });
};

commander
  .version('0.0.1')
  .description('subtitles marine');

commander
  .command('search')
  .alias('s')
  .description('Search')
  .action(pFiles);

commander.parse(process.argv);
