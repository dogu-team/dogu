import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

function renameRecursive(rootDir: string, oldName: string, onMatch: (filePath: string, stat: fs.Stats) => void): void {
  const files = fs.readdirSync(rootDir);
  files.forEach((file) => {
    const filePath = path.join(rootDir, file);
    try {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        renameRecursive(filePath, oldName, onMatch);
      }
      if (file.includes(oldName)) {
        onMatch(filePath, stat);
      }
    } catch (e) {
      console.error(`rename ${filePath} failed`, e);
    }
  });
}

yargs(hideBin(process.argv))
  .command(
    'rename [workdir] [oldname] [newname]',
    'description',
    () => {
      console.log('rename');
    },
    (argv) => {
      const workdir = path.resolve(argv.workdir as string);
      const oldname = argv.oldname as string;
      const newname = argv.newname as string;
      console.log('workdir', workdir);
      console.log('oldname', oldname);
      console.log('newname', newname);
      renameRecursive(workdir, oldname, (filePath, stat) => {
        const newFilePath = filePath.replaceAll(oldname, newname);
        if (stat.isDirectory()) {
          shelljs.cp('-R', `${filePath}/*`, newFilePath);
          shelljs.rm('-rf', filePath);
        } else {
          fs.renameSync(filePath, newFilePath);
        }
        console.log(`rename ${filePath} -> ${newFilePath}`);
      });
    },
  )
  .parseSync();
