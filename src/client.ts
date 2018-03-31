import chalk from 'chalk';
import * as commander from 'commander';
import { prompt } from 'inquirer';

import Sub from './interfaces/subInterface';
import SubMarine from './main';
import TYPES from './origins/origin-types';

const OPTIONS = [{
  type: 'list',
  name: 'origin',
  message: 'Select a choice:',
  choices: [{name: 'SubDivX', value: TYPES.ORIGIN.SUBDIVX}, {name: 'OpenSubtitles', value: TYPES.ORIGIN.OPEN_SUBTITLES}]
}, {
  type: 'input',
  name: 'title',
  message: 'Title to search:'
}, {
  type: 'input',
  name: 'tune',
  message: 'Additional text to search:'
}];

const subOptions = subs => {
  return {
    type: 'list',
    name: 'sub',
    message: `Select a sub to download: [${subs.length} Found]`,
    choices: subs.map((sub: Sub) => {
      return {name: `${sub.title} (Score: ${sub.score})`, value: sub}
    })
  }
};

const AGAIN = {
  type: 'confirm',
  name: 'confirm',
  message: 'Do you want search again?'
}

async function searchCycle(): Promise<void> {
  var finished = false;
  var submarine = new SubMarine();

  while (!finished) {
    await new Promise<void>((resolve, reject) => {

      prompt(OPTIONS).then(answers => {
        submarine.get(answers.origin, answers.title, answers.tune)
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
     searchCycle()
      .catch(() => {
        console.log(chalk.gray(`Thanks for using ${chalk.white('SubMarine')}.`));
        process.exit(0);
      });
  });

commander.parse(process.argv);
