import * as commander from 'commander';
import { prompt } from 'inquirer';
import SubMarine from './main';
import Sub from './interfaces/subInterface';

const OPTIONS = [{
  type: 'list',
  name: 'origin',
  message: 'Select a choice:',
  choices: [{name: 'SubDivX', value: SubMarine.ORIGINS.SUBDIVX}, {name: 'OpenSubtitles', value: 23}]
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

commander
  .version('0.0.1')
  .description('subtitles marine');

commander
  .command('search')
  .alias('s')
  .description('Search')
  .action(() => {
    prompt(OPTIONS).then(answers => {
      var submarine = new SubMarine();

      submarine.get(answers.origin, answers.title, answers.tune)
        .then(subs => {
          prompt(subOptions(subs)).then(subSelection => {
            submarine.download(subSelection.sub)
          });
        })

    })
  });

commander.parse(process.argv);
