#!/usr/bin/env node

import { Command } from '@commander-js/extra-typings';
import { run } from './commands/run';

const program = new Command();

program.name('dogu-agent').description('Dogu Agent CLI').version('0.8.0');

program
  .command('run')
  .description('run Dogu Agent')
  .requiredOption('--url <url>', 'Dogu API URL')
  .requiredOption('--token <token>', 'Dogu Host Token')
  .action(async (options) => {
    const { url, token } = options;
    await run(url, token);
  });

program.parse();
