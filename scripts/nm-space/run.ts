import child_process from 'child_process';
import path from 'path';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import { newCleanEnv } from '../node_package/env';

yargs(hideBin(process.argv))
  .command(
    'run <params>',
    '',
    () => {},
    (argv) => {
      const nmSpacePath = path.resolve(__dirname, '../../nm-space');
      const proc = child_process.exec(argv.params as string, { env: newCleanEnv(), cwd: nmSpacePath });
      proc.stdout?.pipe(process.stdout);
      proc.stderr?.pipe(process.stderr);
      proc.on('exit', (code) => {
        process.exit(code ?? 1);
      });
    },
  )
  .demandCommand(1)
  .parseSync();
