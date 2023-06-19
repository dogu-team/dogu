import child_process from 'child_process';
import path from 'path';

export function newCleanNodeEnv(): NodeJS.ProcessEnv {
  const newEnv: NodeJS.ProcessEnv = {};
  Object.keys(process.env).forEach((key) => {
    if (key.toLowerCase().startsWith('node_')) return;
    if (key.toLowerCase().startsWith('npm_')) return;
    if (key.toLowerCase().startsWith('nvm_')) return;
    if (key.toLowerCase().startsWith('pnpm_')) return;
    newEnv[key] = process.env[key];
  });
  return newEnv;
}

export function enableCorepack(nodeOutPath: string): void {
  const binPath = process.platform === 'win32' ? path.resolve(nodeOutPath) : path.resolve(nodeOutPath, 'bin');
  const corepackPath = process.platform === 'win32' ? path.resolve(binPath, 'corepack.cmd') : path.resolve(binPath, 'corepack');
  const env = newCleanNodeEnv();
  const proc = child_process.spawnSync(corepackPath, ['enable'], {
    cwd: binPath,
    stdio: 'inherit',
    env: {
      ...env,
      PATH: `${binPath}${path.delimiter}${env.PATH ?? ''}`,
    },
  });
  proc.error && console.error(proc.error);
}
