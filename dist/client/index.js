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
const glob = require("glob");
const inquirer_1 = require("inquirer");
const selectDir = require("inquirer-select-directory");
const path_1 = require("path");
const main_1 = require("../main");
const origin_types_1 = require("../utils/origin-types");
const logger_1 = require("../utils/logger");
inquirer_1.prompt.registerPrompt('directory', selectDir);
const log = logger_1.default.Instance;
log.setLevel('all');
const FILES = {
    type: 'directory',
    name: 'path',
    message: 'Media files path:',
    basePath: 'd:/downloads/' //process.cwd()
};
const OPTIONS = [{
        type: 'list',
        name: 'origin',
        message: 'Select a choice:',
        choices: [{ name: 'SubDivX', value: origin_types_1.default.ORIGIN.SUBDIVX }, { name: 'OpenSubtitles', value: origin_types_1.default.ORIGIN.OPEN_SUBTITLES }]
    }];
const fileOpts = files => {
    return {
        type: 'list',
        name: 'file',
        message: `Select a file to download: [${files.length} Found]`,
        choices: files.map((file, i) => {
            return { name: `${i + 1}) ` + file.substring(file.lastIndexOf(path_1.sep) + 1), value: file };
        }).concat([{ name: '<< Go back >>', value: '..' }])
    };
};
const subOptions = subs => {
    return {
        type: 'list',
        name: 'sub',
        message: `Select a sub to download: [${subs.length} Found]`,
        choices: subs.map((sub, i) => {
            return { name: `${i + 1}) ${sub.meta.filename} ${sub.lang} (Score: ${sub.score})`, value: sub };
        }).concat([new inquirer_1.Separator()])
    };
};
const AGAIN = {
    type: 'confirm',
    name: 'confirm',
    message: 'Do you want search again?'
};
function searchCycle(files) {
    return __awaiter(this, void 0, void 0, function* () {
        var finished = false;
        var submarine = new main_1.default();
        while (!finished) {
            yield new Promise((resolve, reject) => {
                inquirer_1.prompt(fileOpts(files)).then(choice => {
                    if (choice.file === '..') {
                        reject('back');
                        return;
                    }
                    else {
                        inquirer_1.prompt(OPTIONS).then(answers => {
                            submarine.get(answers.origin, choice.file, [])
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
                                            console.error(chalk_1.default.red('Error!'));
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
                    }
                });
            });
        }
        return Promise.resolve();
    });
}
function pFiles() {
    return __awaiter(this, void 0, void 0, function* () {
        inquirer_1.prompt(FILES).then(sel => {
            console.log(path_1.normalize(`${sel.path}/*.{avi,mp4,mkv,webm}`));
            glob(path_1.normalize(`${sel.path}/*.{avi,mp4,mkv,webm}`), {}, function (err, files) {
                if (err) {
                    console.error(err);
                    process.exit(1);
                }
                log.debug(files);
                files = files.map(d => path_1.normalize(d));
                searchCycle(files)
                    .catch(err => {
                    if (err === 'back') {
                        pFiles();
                        return;
                    }
                    console.log(chalk_1.default.gray(`Thanks for using ${chalk_1.default.white('SubMarine')}.`));
                    process.exit(0);
                });
            });
        });
    });
}
;
commander
    .version('0.0.1')
    .description('subtitles marine');
commander
    .command('search')
    .alias('s')
    .description('Search')
    .action(pFiles);
commander.parse(process.argv);
//# sourceMappingURL=index.js.map