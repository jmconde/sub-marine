#!/usr/bin/env node

import * as commander from 'commander';
import interactive from './interactive';

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
  .action(interactive);

commander.parse(process.argv);
