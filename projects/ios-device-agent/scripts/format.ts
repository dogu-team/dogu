import child_process from 'child_process';
import fs from 'fs';
import glob from 'glob';
import path from 'path';
import util from 'util';

const exec = util.promisify(child_process.exec);
const globPromise = util.promisify(glob.glob);

const configPath = path.resolve('../../.swift-format');

async function validateExternals(configPath: string): Promise<void> {
  if (!fs.existsSync(configPath)) {
    throw new Error(`.swift-format file not found at ${configPath}`);
  }

  const { stdout, stderr } = await exec('swift-format --version');
  console.log(stdout);
  if (stderr) {
    throw new Error(stderr);
  }
}

async function main(): Promise<void> {
  await validateExternals(configPath);
  const files = glob.globSync('**/*.swift');
  const { stdout, stderr } = await exec(`swift-format --in-place --configuration ${configPath} ${files.join(' ')}`);
  console.log(stdout);
  if (stderr) {
    throw new Error(stderr);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
