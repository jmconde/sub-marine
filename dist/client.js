"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const commander = require("commander");
const inquirer_1 = require("inquirer");
const main_1 = require("./main");
const origin_types_1 = require("./origins/origin-types");
const OPTIONS = [{
        type: 'list',
        name: 'origin',
        message: 'Select a choice:',
        choices: [{ name: 'SubDivX', value: origin_types_1.default.ORIGIN.SUBDIVX }, { name: 'OpenSubtitles', value: origin_types_1.default.ORIGIN.OPEN_SUBTITLES }]
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
const AGAIN = {
    type: 'confirm',
    name: 'confirm',
    message: 'Do you want search again?'
};
function searchCycle() {
    return __awaiter(this, void 0, void 0, function* () {
        var finished = false;
        var submarine = new main_1.default();
        while (!finished) {
            yield new Promise((resolve, reject) => {
                inquirer_1.prompt(OPTIONS).then(answers => {
                    submarine.get(answers.origin, answers.title, answers.tune)
                        .then(subs => {
                        if (subs && subs.length) {
                            inquirer_1.prompt(subOptions(subs)).then(subSelection => {
                                submarine.download(subSelection.sub)
                                    .then(() => {
                                    inquirer_1.prompt(AGAIN).then(again => {
                                        again.confirm ? resolve() : reject();
                                    });
                                })
                                    .catch(() => {
                                    console.log(chalk_1.default.red('Error!'));
                                    inquirer_1.prompt(AGAIN).then(again => {
                                        again.confirm ? resolve() : reject();
                                    });
                                });
                            });
                        }
                        else {
                            console.log(chalk_1.default.yellow('Not subs were found.'));
                            inquirer_1.prompt(AGAIN).then(again => {
                                again.confirm ? resolve() : reject();
                            });
                        }
                    });
                });
            });
        }
        return Promise.resolve();
    });
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
        console.log(chalk_1.default.gray(`Thanks for using ${chalk_1.default.white('SubMarine')}.`));
        process.exit(0);
    });
});
commander.parse(process.argv);
//# sourceMappingURL=client.js.map