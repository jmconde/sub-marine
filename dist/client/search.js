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
const glob = require("glob");
const inquirer_1 = require("inquirer");
const selectDir = require("inquirer-select-directory");
const path_1 = require("path");
const main_1 = require("../main");
const logger_1 = require("../utils/logger");
const origin_types_1 = require("../utils/origin-types");
const lang_1 = require("../utils/lang");
const config_1 = require("./config");
inquirer_1.prompt.registerPrompt('directory', selectDir);
const log = logger_1.default.getInstance();
const pageSize = 15;
var state = new Map();
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
    };
};
const OPTIONS = [{
        type: 'checkbox',
        name: 'origin',
        pageSize,
        message: 'Select a choice:',
        choices: [
            { name: 'SubDivX', value: origin_types_1.default.ORIGIN.SUBDIVX, checked: true },
            { name: 'OpenSubtitles', value: origin_types_1.default.ORIGIN.OPEN_SUBTITLES, checked: true },
        ]
    }];
const langOpts = () => {
    return {
        type: 'checkbox',
        name: 'lang',
        pageSize,
        message: 'Select languages:',
        choices: config_1.default.langs.map(l => {
            return { name: lang_1.default.getLocal(l.id), value: l.id, checked: l.checked };
        })
    };
};
const fileOpts = files => {
    return {
        type: 'list',
        name: 'file',
        message: `Select a file to search subtitles for: [${files.length} Found]`,
        pageSize,
        choices: files.map((file, i) => {
            var subInfo = [];
            var infoStr;
            config_1.default.langs.forEach(l => {
                var name = file.substring(0, file.lastIndexOf('.'))
                    .replace(/\[|\]|\(|\)/g, '?');
                var pattern = `${path_1.normalize(name)}.${l.id}?(.+[0-9]).{${config_1.default.subExtensions.join(',')}}`;
                var files = glob.sync(pattern);
                if (files.length) {
                    subInfo.push(l.id.toUpperCase());
                }
            });
            infoStr = !subInfo.length ? '' : ` (${subInfo.join(', ')})`;
            return {
                name: `${i + 1}) ` + file.substring(file.lastIndexOf(path_1.sep) + 1) + infoStr,
                value: file
            };
        }).concat([{ name: '<< Go back >>', value: '..' }])
    };
};
const subOptions = subs => {
    var name = subs[0] ? subs[0].file.fullName : '';
    var msg = subs.length ? `Select subs to download for '${name}': [${subs.length} Found]` : 'No subtitles found, please search again.';
    return {
        type: 'checkbox',
        name: 'sub',
        message: msg,
        pageSize,
        choices: subs.map((sub, i) => {
            return { name: `${i + 1}) ${sub.lang.toUpperCase()} - ${sub.origin} (Score: ${sub.score})`, value: sub };
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
            yield new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                inquirer_1.prompt(fileOpts(files)).then(choice => {
                    if (choice.file === '..') {
                        reject('back');
                        return;
                    }
                    else {
                        inquirer_1.prompt(langOpts()).then(langs => {
                            inquirer_1.prompt(OPTIONS).then(answers => {
                                submarine.get(answers.origin, choice.file, langs.lang)
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
                        });
                    }
                });
            }));
        }
        return Promise.resolve();
    });
}
function search(cmd) {
    return __awaiter(this, void 0, void 0, function* () {
        var last = state.get('lastPath');
        var basePath = last || (cmd.path ? path_1.normalize(cmd.path) : process.cwd());
        var extensions = `${path_1.sep}*.{${config_1.default.extensions}}`;
        inquirer_1.prompt(dirOpt(basePath)).then(sel => {
            var pattern;
            sel.path = path_1.normalize(sel.path);
            state.set('lastPath', sel.path);
            pattern = path_1.normalize(`${sel.path}${extensions}`).replace(/\[|\]|\(|\)/g, '?');
            glob(pattern, {}, function (err, files) {
                if (err) {
                    console.error(err);
                    process.exit(1);
                }
                files = files.map(d => path_1.normalize(d));
                searchCycle(files)
                    .catch(err => {
                    if (err === 'back') {
                        search(cmd);
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
exports.default = search;
//# sourceMappingURL=search.js.map