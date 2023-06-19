import child_process from 'child_process';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import { newCleanEnv } from '../node_package/env';

yargs(hideBin(process.argv))
  .command(
    'detach <commands>',
    'detach command from current terminal',
    () => {},
    (argv) => {
      const commands = (argv.commands as string)
        .replace('[', '')
        .replace(']', '')
        .split(',')
        .map((c) => c.trim());
      console.log(commands);

      const spawnChild = (cmd: string): void => {
        console.log('start command: ', cmd);
        const proc = child_process.exec(cmd, { env: newCleanEnv() });
        proc.stdout?.pipe(process.stdout);
        proc.stderr?.pipe(process.stderr);
        proc.on('exit', (code) => {
          console.log(` command ${cmd} exited with code ${code ?? 0}`);
          process.exit(code ?? 1);
        });
      };

      for (let index = 0; index < commands.length; index++) {
        const element = commands[index];
        setTimeout(() => {
          spawnChild(element);
        }, index * (argv.interval as number));
      }
    },
  )
  .option('interval', {
    alias: 'i',
    type: 'number',
    default: 5000,
    description: 'interval between each command',
  })
  .parseSync();
