import path from 'path';
import fs from 'fs';
import child_process from 'child_process';
import util from 'util';
import glob from 'glob';

const exec = util.promisify(child_process.exec);
const globPromise = util.promisify(glob.glob);

const configPath = path.resolve('../../../.swift-format');

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
  const files = await globPromise('**/*.swift');
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
