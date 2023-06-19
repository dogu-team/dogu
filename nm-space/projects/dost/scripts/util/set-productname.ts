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

function changeProductname(productname: string): void {
  if (!fs.existsSync(packagejsonPath)) {
    throw new Error('package.json not found');
  }
  let contents = fs.readFileSync(packagejsonPath, 'utf8');
  // replace productname
  contents = contents.replace(/"productName":\s*"[^"]*"/, `"productName": "${productname}"`);
  // change packagename too. because of windows program path issue. https://github.com/electron-userland/electron-builder/issues/2638
  contents = contents.replace(/"name":\s*"[^"]*"/, `"name": "${productname.toLowerCase().replaceAll(' ', '-')}"`);
  fs.writeFileSync(packagejsonPath, contents);
}

yargs(hideBin(process.argv))
  .command(
    'name <productname>',
    'description',
    () => {},
    (argv) => {
      console.log(argv);
      const productname = argv.productname as string;
      console.log('productname', productname);
      changeProductname(productname);
    },
  )
  .parseSync();
