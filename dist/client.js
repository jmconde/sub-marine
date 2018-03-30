"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander = require("commander");
const inquirer_1 = require("inquirer");
const main_1 = require("./main");
const OPTIONS = [{
        type: 'list',
        name: 'origin',
        message: 'Select a choice:',
        choices: [{ name: 'SubDivX', value: main_1.default.ORIGINS.SUBDIVX }, { name: 'OpenSubtitles', value: 23 }]
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
        choices: subs.map((sub) => {
            return { name: `${sub.title} (Score: ${sub.score})`, value: sub };
        })
    };
};
commander
    .version('0.0.1')
    .description('subtitles marine');
commander
    .command('search')
    .alias('s')
    .description('Search')
    .action(() => {
    inquirer_1.prompt(OPTIONS).then(answers => {
        var submarine = new main_1.default();
        submarine.get(answers.origin, answers.title, answers.tune)
            .then(subs => {
            inquirer_1.prompt(subOptions(subs)).then(subSelection => {
                submarine.download(subSelection.sub);
            });
        });
    });
});
commander.parse(process.argv);
//# sourceMappingURL=client.js.map