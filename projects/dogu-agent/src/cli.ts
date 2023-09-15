#!/usr/bin/env node

import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

const args = hideBin(process.argv);
yargs(args)
  .command(
    'run --url <url> --token <token>',
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
  .command(
    'doctor',
    'check the system',
    (yargs) => yargs,
    (argv) => {
      console.log('doctor not implemented');
    },
  )
  .strictCommands()
  .demandCommand(1)
  .parse();
