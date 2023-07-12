import fs from 'fs';
import path from 'path';

const SAMPLE_DIR = path.resolve(__dirname, '../../samples');
const BUILD_DIR = path.resolve(__dirname, '../../build/samples');

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
