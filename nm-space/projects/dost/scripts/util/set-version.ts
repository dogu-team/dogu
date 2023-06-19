import fs from 'fs';
import path from 'path';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

interface AnyDict {
  [key: string]: AnyDict | string | number;
}

interface PackageInfo {
  name: string;
  version: string;
}
const packagejsonPath = path.resolve(__dirname, '..', '..', 'package.json');

function changeVersion(version: string): void {
  if (!fs.existsSync(packagejsonPath)) {
    throw new Error('package.json not found');
  }
  let contents = fs.readFileSync(packagejsonPath, 'utf8');
  // replace version
  contents = contents.replace(/"version":\s*"[^"]*"/, `"version": "${version}"`);
  fs.writeFileSync(packagejsonPath, contents);
}

yargs(hideBin(process.argv))
  .command(
    'version <newversion>',
    'description',
    () => {},
    (argv) => {
      console.log(argv);
      const newversion = argv.newversion as string;
      console.log('newversion', newversion);
      changeVersion(newversion);
    },
  )
  .parseSync();
