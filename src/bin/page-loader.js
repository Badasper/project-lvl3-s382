#!/usr/bin/env nodejs

import program from 'commander';
import pageLoader from '..';
import { version } from '../../package.json';

program
  .version(version, '-v, --version')
  .description('Programm load page from url')
  .option('-o, --output [dir]', 'Output dirname to download page')
  .arguments('<url>')
  .action(url => pageLoader(url, program.output))
  .parse(process.argv);
