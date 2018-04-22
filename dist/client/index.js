#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander = require("commander");
const interactive_1 = require("./interactive");
commander
    .version('0.0.1')
    .description('subtitles marine');
commander
    .command('search')
    .alias('s')
    .option('-p --path <path>', 'Path where media files are.')
    .option('-t --text <string>', 'Search by filename (string).')
    .option('-d --destination <path>', '')
    .description('Search')
    .action(interactive_1.default);
commander.parse(process.argv);
//# sourceMappingURL=index.js.map