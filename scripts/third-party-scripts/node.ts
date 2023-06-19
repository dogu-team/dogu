import child_process from 'child_process';
import path from 'path';

export function enableCorepack(nodeOutPath: string): void {
  const binPath = process.platform === 'win32' ? path.resolve(nodeOutPath) : path.resolve(nodeOutPath, 'bin');
  const corepackPath = process.platform === 'win32' ? path.resolve(binPath, 'corepack.cmd') : path.resolve(binPath, 'corepack');
  const proc = child_process.spawnSync(corepackPath, ['enable'], {
    cwd: binPath,
    stdio: 'inherit',
    env: {
      ...process.env,
      PATH: `${binPath}${path.delimiter}${process.env.PATH ?? ''}`,
    },
  });
  proc.error && console.error(proc.error);
}
