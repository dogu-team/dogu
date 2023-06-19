import { Printable } from '@dogu-tech/common';
import { download } from '@dogu-tech/node';
import { execSync } from 'child_process';
import compressing from 'compressing';
import fs from 'fs';
import path from 'path';

export interface AndroidSDKInstallOption {
  sdkRootPath: string;
  commandLineToolsVersion: string;
  buildToolsVersion: string;
  platformToolsVersion: string;
}

interface DownloadUrls {
  commandLineTools: string;
  platformTools: string;
}

interface PlatformDownloadUrls {
  [key: string]: DownloadUrls;
}

function buildDownloadUrls(option: AndroidSDKInstallOption): PlatformDownloadUrls {
  return {
    darwin: {
      commandLineTools: `https://dl.google.com/android/repository/commandlinetools-mac-${option.commandLineToolsVersion}_latest.zip`,
      platformTools: `https://dl.google.com/android/repository/platform-tools_${option.platformToolsVersion}-darwin.zip`,
    },
    win32: {
      commandLineTools: `https://dl.google.com/android/repository/commandlinetools-win-${option.commandLineToolsVersion}_latest.zip`,
      platformTools: `https://dl.google.com/android/repository/platform-tools_${option.platformToolsVersion}-windows.zip`,
    },
    linux: {
      commandLineTools: `https://dl.google.com/android/repository/commandlinetools-linux-${option.commandLineToolsVersion}_latest.zip`,
      platformTools: `https://dl.google.com/android/repository/platform-tools_${option.platformToolsVersion}-linux.zip`,
    },
  };
}

async function downloadAndUnzip(url: string, destPath: string, isZipHasRootFolder: boolean, printable: Printable): Promise<void> {
  const zipFilePath = `${destPath}.zip`;
  const result = await download(url, zipFilePath, {}, printable);
  try {
    if (!result) {
      throw new Error(`Download failed: ${url}`);
    }
    let unzipDestPath = destPath;
    if (isZipHasRootFolder) {
      unzipDestPath = path.dirname(destPath);
    }
    if (!fs.existsSync(unzipDestPath)) {
      await fs.promises.mkdir(unzipDestPath, { recursive: true });
    }
    await compressing.zip.uncompress(zipFilePath, unzipDestPath);
  } finally {
    if (fs.existsSync(zipFilePath)) {
      await fs.promises.rm(zipFilePath);
    }
  }
}

async function installPlatformTools(sdkRootPath: string, urls: PlatformDownloadUrls, printable: Printable): Promise<string> {
  if (!(process.platform in urls)) {
    throw new Error(`Unsupported platform: ${process.platform}`);
  }
  const platformToolsPath = `${sdkRootPath}/platform-tools`;

  if (fs.existsSync(platformToolsPath)) {
    if (process.platform === 'win32') {
      const adbPath = path.resolve(platformToolsPath, 'adb.exe');
      if (fs.existsSync(adbPath)) {
        printable.verbose?.(`Killing adb server`, { adbPath });
        const output = execSync(`"${adbPath}" kill-server`, { encoding: 'utf8' });
        printable.verbose?.(`Killed adb server`, { output });
      }
    }
    await fs.promises.rm(platformToolsPath, { recursive: true, force: true });
  }

  const url = urls[process.platform];
  await downloadAndUnzip(url.platformTools, platformToolsPath, true, printable);

  return platformToolsPath;
}

// async function installSdkManager(sdkRootPath: string, urls: PlatformDownloadUrls, printable: Printable): Promise<string> {
//   if (!(process.platform in urls)) {
//     throw new Error(`Unsupported platform: ${process.platform}`);
//   }
//   const zipDestPath = `${sdkRootPath}/cmdline-tools`;
//   let sdkManagerPath = path.resolve(zipDestPath, 'bin', 'sdkmanager');
//   if (process.platform === 'win32') {
//     sdkManagerPath += '.bat';
//   }

//   if (fs.existsSync(sdkManagerPath)) {
//     return sdkManagerPath;
//   }

//   const url = urls[process.platform];
//   await downloadAndUnzip(url.commandLineTools, zipDestPath, true, printable);

//   return sdkManagerPath;
// }

// async function execSdkManager(sdkManager: string, arg: string, printable: Printable): Promise<void> {
//   const acceptBuffer = Buffer.from(Array(10).fill('y').join('\n'), 'utf8');
//   printable.verbose?.(`${sdkManager} ${arg}`);
//   const child = child_process.spawn(sdkManager, arg.split(' '), {
//     stdio: ['pipe', 'pipe', 'pipe'],
//   });
//   child.stdin.write(acceptBuffer);
//   child.stdin.end();
//   child.stdout?.setEncoding('utf8');
//   child.stdout?.on('data', (data) => {
//     printable.info(String(data));
//   });

//   child.stderr?.setEncoding('utf8');
//   child.stderr?.on('data', (data) => {
//     printable.error(String(data));
//   });
//   await new Promise<void>((resolve, reject) => {
//     child.on('exit', (code) => {
//       if (code === 0) {
//         resolve();
//       } else {
//         reject(new Error(`sdkmanager exited with code ${code ?? ''}`));
//       }
//     });
//   });
// }

export async function install(option: AndroidSDKInstallOption, printable: Printable): Promise<void> {
  const downloadUrls = buildDownloadUrls(option);
  await installPlatformTools(option.sdkRootPath, downloadUrls, printable);
}

export function isInstalled(option: AndroidSDKInstallOption, printable: Printable): Promise<boolean> {
  const ext = process.platform === 'win32' ? '.exe' : '';
  const adbPath = path.resolve(option.sdkRootPath, 'platform-tools', `adb${ext}`);
  if (fs.existsSync(adbPath)) {
    return Promise.resolve(true);
  }
  return Promise.resolve(false);
}
