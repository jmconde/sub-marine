#!/usr/bin/env node
import chalk from 'chalk';
import * as commander from 'commander';
import * as glob from 'glob';
import { prompt, Separator } from 'inquirer';
import * as selectDir from 'inquirer-select-directory';
import { normalize, sep } from 'path';

import Sub from '../interfaces/subInterface';
import SubMarine from '../main';
import Logger from '../utils/logger';
import TYPES from '../utils/origin-types';
import LangUtil from '../utils/lang';
import Commons from '../utils/commons';


prompt.registerPrompt('directory', selectDir);

const log = Logger.getInstance();
const pageSize = 15;
const config = Commons.readJson('./submarineconfig.json').client;
var state: Map<string, any> =  new Map();
log.setLevel('error');

const dirOpt = basePath => {
  return {
    type: 'directory',
    name: 'path',
    options: {
      displayHidden: true
    },
    pageSize,
    message: 'Media files path:',
    basePath
  }
};

const OPTIONS = [{
  type: 'checkbox',
  name: 'origin',
  pageSize,
  message: 'Select a choice:',
  choices: [
    { name: 'SubDivX', value: TYPES.ORIGIN.SUBDIVX, checked: true },
    { name: 'OpenSubtitles', value: TYPES.ORIGIN.OPEN_SUBTITLES, checked: true },
    // {name: 'SubDB', value: TYPES.ORIGIN.SUBDB, checked: true}
  ]
}];

const langOpts = () => {
  return {
    type: 'checkbox',
    name: 'lang',
    pageSize,
    message: 'Select languages:',
    choices: config.langs.map(l => {
      return { name: LangUtil.getLocal(l.id), value: l.id, checked: l.checked };
    })
  }
};

const fileOpts = files => {
  return {
    type: 'list',
    name: 'file',
    message: `Select a file to search subtitles for: [${files.length} Found]`,
    pageSize,
    choices: files.map((file: string, i: number) => {
      return { name: `${i + 1}) ` + file.substring(file.lastIndexOf(sep) + 1), value: file }
    }).concat([{ name: '<< Go back >>', value: '..' }])
  };
}

const subOptions = subs => {
  var name = subs[0] ? subs[0].file.fullName : '';
  var msg = subs.length ? `Select subs to download for '${name}': [${subs.length} Found]` : 'No subtitles found, please search again.'
  return {
    type: 'checkbox',
    name: 'sub',
    message: msg,
    pageSize,
    choices: subs.map((sub: Sub, i: number) => {
      return { name: `${i + 1}) ${sub.lang.toUpperCase()} - ${sub.origin} (Score: ${sub.score})`, value: sub }
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
    await new Promise<void>(async(resolve, reject) => {
      prompt(fileOpts(files)).then(choice => {
        if (choice.file === '..') {
          reject('back');
          return;
        } else {
          prompt(langOpts()).then(langs => {
            prompt(OPTIONS).then(answers => {
              submarine.get(answers.origin, choice.file, langs.lang)
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
          });
        }
      });
    });
  }

  return Promise.resolve();
}

async function pFiles(cmd) {
  var last = state.get('lastPath');
  var basePath = last || (cmd.path ? normalize(cmd.path) : process.cwd());
  var extensions = `${sep}*.{${config.extensions}}`

  prompt(dirOpt(basePath)).then(sel => {
    sel.path = normalize(sel.path);
    state.set('lastPath', sel.path);

    glob(normalize(`${sel.path}${extensions}`), {}, function (err, files) {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      files = files.map(d => normalize(d));

      searchCycle(files)
        .catch(err => {
          if (err === 'back') {
            pFiles(cmd);
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
  .option('-p --path <path>', 'Path where media files are.')
  .description('Search')
  .action(pFiles);

commander.parse(process.argv);
