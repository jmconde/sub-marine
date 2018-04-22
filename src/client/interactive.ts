import chalk from 'chalk';
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
import config from './config';

prompt.registerPrompt('directory', selectDir);

const log = Logger.getInstance();
const pageSize = 15;

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
      var subInfo: string[] = [];
      var infoStr: string;

      config.langs.forEach(l => {
        var name = file.substring(0, file.lastIndexOf('.'))
          .replace(/\[|\]|\(|\)/g, '?');
        var pattern = `${normalize(name)}.${l.id}?(.+[0-9]).{${config.subExtensions.join(',')}}`;
        var files = glob.sync(pattern);

        if (files.length) {
          subInfo.push(l.id.toUpperCase());
        }
      });

      infoStr = !subInfo.length ? '' : ` (${subInfo.join(', ')})`;

      return {
        name: `${i + 1}) ` + file.substring(file.lastIndexOf(sep) + 1) + infoStr,
        value: file
      };
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

async function searchCycle(files: string[], path?: string): Promise<void> {
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
                      submarine.download(subSelection.sub, path)
                        .then(() => {
                          prompt(AGAIN).then(again => {
                            again.confirm ? resolve() : reject();
                          })
                        })
                        .catch(e => {
                          console.error(chalk.red('Error!', e));
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

async function interactive(cmd) {
  var last = state.get('lastPath');
  var basePath = last || (cmd.path ? normalize(cmd.path) : process.cwd());
  var extensions = `${sep}*.{${config.extensions}}`

  prompt(dirOpt(basePath)).then(sel => {
    var pattern;
    sel.path = normalize(sel.path);
    state.set('lastPath', sel.path);
    pattern = normalize(`${sel.path}${extensions}`).replace(/\[|\]|\(|\)/g, '?');

    glob(pattern, {}, function (err, files) {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      files = files.map(d => normalize(d));

      searchCycle(files)
        .catch(err => {
          if (err === 'back') {
            interactive(cmd);
            return;
          }
          console.log(chalk.gray(`Thanks for using ${chalk.white('SubMarine')}.`));
          process.exit(0);
        });
    });
  });
}

async function searchByText(text: string, path?: string) {
  var submarine = new SubMarine();
  await new Promise<void>(async(resolve, reject) => {
    prompt(langOpts()).then(langs => {
      prompt(OPTIONS).then(answers => {
        submarine.get(answers.origin, text, langs.lang)
          .then(subs => {
            if (subs && subs.length) {
              prompt(subOptions(subs)).then(subSelection => {
                submarine.download(subSelection.sub, path)
                  .then(() => {
                    process.exit(0);
                  })
                  .catch(e => {
                    console.error(chalk.red('Error!', e));
                    process.exit(1);
                  })
              });
            } else {
              console.log(chalk.yellow('Not subs were found.'));
              process.exit(0);
            }
          })
      })
    });
  });
}

async function search(cmd) {
  if (cmd.text) {
    searchByText(cmd.text, cmd.destination || './');
  } else {
    interactive(cmd);
  }
};

export default search;