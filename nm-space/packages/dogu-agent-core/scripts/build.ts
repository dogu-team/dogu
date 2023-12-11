import fg from 'fast-glob';
import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';

console.log('Building dogu-agent-core...');
if (shelljs.exec('tsc -b').code !== 0) {
  shelljs.echo('Error: tsc -b failed');
  shelljs.exit(1);
}

const featureFiles = fg.sync('src/app/feature-config/features/*.json');
console.log('Copying feature files...', featureFiles);

const srcRoot = process.cwd();
const dstRoot = path.resolve(srcRoot, 'build');
Promise.all(
  featureFiles
    .map((featureFile) => ({
      src: path.resolve(srcRoot, featureFile),
      dst: path.resolve(dstRoot, featureFile),
    }))
    .map(async ({ src, dst }) => fs.promises.cp(src, dst)),
).catch((error) => {
  console.error('Error copying feature files', error);
  process.exit(1);
});
