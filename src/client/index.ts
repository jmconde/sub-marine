import chalk from 'chalk';
import * as commander from 'commander';
import * as glob from 'glob';
import { prompt } from 'inquirer';
import { normalize, sep } from 'path';

import Sub from '../interfaces/subInterface';
import SubMarine from '../main';
import TYPES from '../utils/origin-types';

const FILES =  {
  type: 'input',
  name: 'path',
  message: 'Media files path:',
  default: 'd:\\downloads\\test'
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
      return {name: file.substring(file.lastIndexOf(sep) + 1) , value: file}
    })
 };
}

const subOptions = subs => {
  return {
    type: 'list',
    name: 'sub',
    message: `Select a sub to download: [${subs.length} Found]`,
    choices: subs.map((sub: Sub) => {
      return {name: `${sub.meta.filename} ${sub.lang} (Score: ${sub.score})`, value: sub}
    })
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
                      console.log(chalk.red('Error!'));
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
      });
    });
  }

  return Promise.resolve();
}

commander
  .version('0.0.1')
  .description('subtitles marine');

commander
  .command('search')
  .alias('s')
  .description('Search')
  .action(() => {
    prompt(FILES).then(sel => {
      console.log(normalize(`${sel.path}/**/*.{avi,mp4,mkv,webm}`));
      glob(normalize(`${sel.path}/**/*.{avi,mp4,mkv,webm}`), {}, function (err, files) {
        if (err) {
          console.log(err);
          process.exit(1);
        }

        files = files.map(d => normalize(d));

        searchCycle(files)
          .catch(() => {
            console.log(chalk.gray(`Thanks for using ${chalk.white('SubMarine')}.`));
            process.exit(0);
          });
          // files is an array of filenames.
          // If the `nonull` option is set, and nothing
          // was found, then files is ["**/*.js"]
          // er is an error object or null.
      })
    });



  });

commander.parse(process.argv);
