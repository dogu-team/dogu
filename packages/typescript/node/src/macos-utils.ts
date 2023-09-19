import { errorify } from '@dogu-tech/common';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const defaultMountTimeout = 60_000;
export const defaultInstallTimeout = 10 * 60_000;

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

/**
 * @example installer: Package name is Microsoft Edge
 */
const installerPackageNamePattern = /^installer: Package name is (?<packageName>.+)$/;

/**
 * @example
 * installer: Upgrading at base path /Users/dogu
 * installer: Installing at base path /Users/dogu
 */
const installerBasePathPattern = /^installer: (Upgrading|Installing) at base path (?<basePath>.+)$/;

export interface InstallPkgResult {
  appPath: string;
}

export async function installPkg(downloadFilePath: string, timeout = defaultInstallTimeout): Promise<InstallPkgResult> {
  if (process.platform !== 'darwin') {
    throw new Error('This function is only available on macOS');
  }

  const { stdout, stderr } = await execAsync(`/usr/sbin/installer -pkg ${downloadFilePath} -target CurrentUserHomeDirectory`, {
    timeout,
  });

  if (stderr) {
    throw new Error(`Failed to install pkg. stderr: ${stderr}`);
  }

  const lines = stdout.split('\n');
  let packageName: string | undefined;
  let basePath: string | undefined;
  for (const line of lines) {
    if (!packageName) {
      const match = line.match(installerPackageNamePattern);
      if (match) {
        packageName = match.groups?.packageName;
      }
    }

    if (!basePath) {
      const match = line.match(installerBasePathPattern);
      if (match) {
        basePath = match.groups?.basePath;
      }
    }
  }

  if (!packageName) {
    throw new Error(`Failed to find package name. stdout: ${stdout}`);
  }

  if (!basePath) {
    throw new Error(`Failed to find base path. stdout: ${stdout}`);
  }

  const appPath = path.resolve(basePath, 'Applications', `${packageName}.app`);
  return {
    appPath,
  };
}
