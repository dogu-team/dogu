#!/usr/bin/env node

import { Command, Option } from '@commander-js/extra-typings';
import { run } from './commands/run';

const program = new Command();

program.name('dogu-agent').description('Dogu Agent CLI').version('0.8.0');

program
  .command('run')
  .description('run Dogu Agent')
  .addOption(new Option('--url <url>', 'Dogu API Base URL').env('DOGU_API_BASE_URL').makeOptionMandatory(true))
  .addOption(new Option('--token <token>', 'Dogu Host Token').env('DOGU_HOST_TOKEN').makeOptionMandatory(true))
  .action(async (options) => {
    const { url, token } = options;
    await run(url, token);
  });

program.parse();
