import { errorify } from '@dogu-tech/common';
import { exec } from 'child_process';
import fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

const defaultMountTimeout = 60_000;

async function mountDmg(dmgPath: string, mountPath: string, timeout = defaultMountTimeout): Promise<string> {
  if (process.platform !== 'darwin') {
    throw new Error('This function is only available on macOS');
  }

  await fs.promises.mkdir(mountPath, { recursive: true });
  try {
    await execAsync(`hdiutil attach -nobrowse -readonly -mountpoint "${mountPath}" "${dmgPath}"`, {
      encoding: 'utf8',
      timeout,
    });
    return mountPath;
  } catch (error) {
    throw new Error(`Failed to mount dmg. dmgPath: ${dmgPath}`, { cause: errorify(error) });
  }
}

async function unmountDmg(mountPath: string, timeout = defaultMountTimeout): Promise<void> {
  try {
    await execAsync(`hdiutil detach "${mountPath}"`, { encoding: 'utf8', timeout });
  } catch (error) {
    throw new Error(`Failed to unmount dmg. mountPath: ${mountPath}`, { cause: errorify(error) });
  }
}

export async function onDmgMounted(dmgPath: string, mountPath: string, timeout = defaultMountTimeout, fn: (mountPath: string) => Promise<void>): Promise<void> {
  await mountDmg(dmgPath, mountPath, timeout);
  try {
    await fn(mountPath);
  } finally {
    await unmountDmg(mountPath, timeout);
    await fs.promises.rm(mountPath, { recursive: true, force: true });
  }
}
