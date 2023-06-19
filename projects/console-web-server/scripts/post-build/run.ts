import fs from 'fs';
import path from 'path';

const SAMPLE_DIR = path.resolve(__dirname, '../../sample');
const BUILD_DIR = path.resolve(__dirname, '../../build/sample');

async function main(): Promise<void> {
  fs.cp(SAMPLE_DIR, BUILD_DIR, { recursive: true, force: true }, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('success copy sample to build');
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
