#!/usr/bin/env nodejs

import program from 'commander';
import pageLoader from '..';
import { version } from '../../package.json';

program
  .version(version, '-v, --version')
  .description('Programm load page from url to local file.')
  .option('-o, --output [dir]', 'Output dirname to download page.')
  .arguments('<url>')
  .action(url => pageLoader(url, program.output)
    .then(succsesfull => console.log(succsesfull))
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    }))
  .parse(process.argv);
