import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';
import { PartialPackageJson } from './types';

export function checkEnv_DOGU_DEPLOY(): void {
  if (!process.env.DOGU_DEPLOY) {
    throw new Error('env DOGU_DEPLOY not found');
  } else {
    console.log('env DOGU_DEPLOY found', {
      DOGU_DEPLOY: process.env.DOGU_DEPLOY,
    });
  }
}

export function getRunType(): string {
  const runType = process.env.DOGU_RUN_TYPE;
  if (!runType) {
    throw new Error('env DOGU_RUN_TYPE not found');
  }
  return runType;
}

export function getNpmTagFromRunType(tag: string): string {
  if (tag === 'production') {
    return 'latest';
  } else {
    return tag;
  }
}

export async function cleanTemp(tempDir: string): Promise<void> {
  console.log('cleanTemp');
  await fs.promises.rm(tempDir, { recursive: true, force: true });
  await fs.promises.mkdir(tempDir, { recursive: true });
}

export function rebuild(): void {
  console.log('rebuild');
  if (shelljs.exec('yarn run rebuild').code !== 0) {
    throw new Error('yarn run rebuild failed');
  }
}

export async function getPackageNameFromPackageJson(): Promise<string> {
  console.log('parse package.json');
  const content = await fs.promises.readFile('package.json', 'utf8');
  const packageJson = JSON.parse(content) as PartialPackageJson;
  const { name } = packageJson;
  if (!name) {
    throw new Error('package.json name not found');
  }
  console.log('package name', name);
  return name;
}

export function findRootWorkspace(): string {
  // find .dogu_workspace in parent
  let current = process.cwd();
  for (let i = 0; i < 10; i++) {
    const doguWorkspace = path.resolve(current, '.dogu-workspace');
    if (fs.existsSync(doguWorkspace)) {
      return current;
    }
    const parent = path.resolve(current, '..');
    if (parent === current) {
      break;
    }
    current = parent;
  }

  throw new Error('Cannot find .dogu-workspace');
}
