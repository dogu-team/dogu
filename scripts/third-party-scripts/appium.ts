import path from 'path';
import fs from 'fs';
import child_process from 'child_process';
import { newCleanNodeEnv } from './node';

export function pnpmInstall(outPath: string): void {
  const nodeBinDir = process.platform === 'win32' ? '' : 'bin';
  const cmdExtension = process.platform === 'win32' ? '.cmd' : '';
  const pnpmPath = path.resolve(process.cwd(), 'third-party', process.platform, process.arch, 'node', 'v16.20.0', nodeBinDir, `pnpm${cmdExtension}`);
  if (!fs.existsSync(pnpmPath)) {
    throw new Error(`pnpm not found at ${pnpmPath}`);
  }
  const cwd = path.resolve(process.cwd(), 'third-party', outPath);
  if (!fs.existsSync(cwd)) {
    throw new Error(`Directory not found: ${cwd}`);
  }
  const proc = child_process.spawnSync(pnpmPath, ['install', '--force'], {
    cwd,
    env: newCleanNodeEnv(),
    stdio: 'inherit',
  });
  proc.error && console.error(proc.error);
}
