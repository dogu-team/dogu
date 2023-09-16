#!/usr/bin/env node

import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

const args = hideBin(process.argv);
yargs(args)
  .command(
    'run',
    'run Dogu Agent',
    (yargs) => {
      return yargs
        .option('url', {
          type: 'string',
          description: 'Dogu API URL',
          demandOption: true,
        })
        .option('token', {
          type: 'string',
          description: 'Dogu Host Token',
          demandOption: true,
        });
    },
    (argv) => {
      const { url, token } = argv;
      console.log(`url: ${url}`);
      console.log(`token: ${token}`);
    },
  )
  .strictCommands()
  .demandCommand(1)
  .scriptName('dogu-agent')
  .parse();
