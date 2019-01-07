#!/usr/bin/env nodejs

import program from 'commander';
import pageLoader from '..';
import version from '../../package.json';

program
  .version(version)
  .description('Programm load page from url')
  .arguments('<url>')
  .action((url) => {
    pageLoader(url);
  })
  .parse(process.argv);
