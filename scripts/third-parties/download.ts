import compressing from 'compressing';
import fs from 'fs';
import https from 'https';
import path from 'path';
import shelljs from 'shelljs';
import tar from 'tar';
import util from 'util';
import { findRootWorkspace } from '../workspace';
import { getFileSizeRecursive } from './filesystem';
import { enableCorepack } from './node';

interface ThirdPartyFile {
  /**
   * @note If condition is not specified, the file will be downloaded.
   */
  condition?: () => boolean;
  url: string;
  path: string;
  postAction?: (outPath: string) => void | Promise<void>;
  postDownload?: (outPath: string) => void | Promise<void>;
}

const files: ThirdPartyFile[] = [
  {
    url: 'https://github.com/steinwurf/adb-join-wifi/releases/download/1.0.1/adb-join-wifi.apk',
    path: 'common/adb-join-wifi.apk',
  },
  {
    condition: () => process.platform === 'darwin',
    url: 'https://github.com/dogu-team/third-party-binaries/releases/download/mobiledevice-2.0.0/mobiledevice-arm64',
    path: 'darwin/arm64/mobiledevice',
  },
  {
    condition: () => process.platform === 'darwin',
    url: 'https://github.com/dogu-team/third-party-binaries/releases/download/mobiledevice-2.0.0/mobiledevice-x64',
    path: 'darwin/x64/mobiledevice',
  },
  {
    condition: () => process.platform === 'darwin',
    url: 'https://github.com/dogu-team/third-party-binaries/releases/download/node-16.20.0/node-darwin-arm64.tar.gz',
    path: 'darwin/arm64/node/v16.20.0',
    // postAction: enableCorepack,
  },
  {
    condition: () => process.platform === 'darwin',
    url: 'https://github.com/dogu-team/third-party-binaries/releases/download/node-16.20.0/node-darwin-x64.tar.gz',
    path: 'darwin/x64/node/v16.20.0',
    // postAction: enableCorepack,
  },
  {
    condition: () => process.platform === 'darwin',
    url: 'https://github.com/dogu-team/third-party-binaries/releases/download/git-2.39.3/git-darwin-arm64.tar.gz',
    path: 'darwin/arm64/git',
  },
  {
    condition: () => process.platform === 'darwin',
    url: 'https://github.com/dogu-team/third-party-binaries/releases/download/git-2.39.3/git-darwin-x64.tar.gz',
    path: 'darwin/x64/git',
  },
  {
    condition: () => process.platform === 'win32',
    url: 'https://nodejs.org/dist/v16.20.0/node-v16.20.0-win-x64.zip',
    path: 'win32/x64/node/v16.20.0',
    postAction: enableCorepack,
  },
  {
    condition: () => process.platform === 'darwin',
    url: 'https://github.com/dogu-team/third-party-binaries/releases/download/ffmpeg-6.0-tessus/ffmpeg-darwin',
    path: 'darwin/common/ffmpeg',
  },
  {
    condition: () => process.platform === 'win32',
    url: 'https://github.com/dogu-team/third-party-binaries/releases/download/ffmpeg-6.0-tessus/ffmpeg-windows.exe',
    path: 'win32/common/ffmpeg.exe',
  },
  {
    condition: () => process.platform === 'linux' && process.arch === 'x64',
    url: 'https://github.com/dogu-team/third-party-binaries/releases/download/ffmpeg-6.0-tessus/ffmpeg-linux-x64',
    path: 'linux/x64/ffmpeg',
  },
  {
    condition: () => process.platform === 'win32',
    url: 'https://github.com/dogu-team/third-party-binaries/releases/download/zlib-1.2.13/zlib1-windows-x64.dll',
    path: 'win32/x64/zlib1.dll',
  },
  {
    condition: () => process.platform === 'win32',
    url: 'https://github.com/dogu-team/third-party-binaries/releases/download/git-2.39.3/git-windows-x64.zip',
    path: 'win32/x64/git',
  },
];

const rootPath = findRootWorkspace();

function makeDirectories(): void {
  for (const file of files) {
    const dirPath = path.resolve(rootPath, 'third-party', path.dirname(file.path));
    if (fs.existsSync(dirPath)) {
      continue;
    }
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function requestFileSizeRetry(url: string): Promise<number> {
  for (let i = 0; i < 20; i++) {
    try {
      return await requestFileSize(url);
    } catch (err) {
      console.error(`Failed to get file size of ${url}, retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  throw new Error(`Failed to get file size of ${url}`);
}

async function requestFileSize(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          requestFileSize(res.headers.location!).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to download ${url} with status code ${res.statusCode!}`));
          return;
        }
        resolve(Number(res.headers['content-length']));
      })
      .on('error', (err) => {
        console.error(`Failed to download ${url}`);
        reject(err);
      });
  });
}
async function getRetry(url: string, destPath: string): Promise<void> {
  for (let i = 0; i < 20; i++) {
    try {
      return await get(url, destPath);
    } catch (err) {
      console.error(`Failed to download ${url}, retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  throw new Error(`Failed to download ${url}`);
}

async function get(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject): void => {
    const file = fs.createWriteStream(destPath);
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          get(res.headers.location!, destPath).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to download ${url} with status code ${res.statusCode!}`));
          return;
        }
        res.pipe(file);
        file.on('finish', () => {
          fs.chmodSync(destPath, 0o777);
          file.close();
          resolve();
        });
      })
      .on('error', (err) => {
        console.error(`Failed to download ${url}`);
        fs.unlink(destPath, () => {
          reject(err);
        });
      });
  });
}

function removeMacosxFiles(destPath: string): void {
  const macosxPath = path.resolve(path.dirname(destPath), '__MACOSX');
  shelljs.rm('-rf', macosxPath);
}

async function renameUnzipedDir(fileUrl: string, destPath: string, ext: string): Promise<void> {
  const uncompressedDirPath = path.resolve(path.dirname(destPath), path.basename(fileUrl).replace(ext, ''));
  if (fs.existsSync(uncompressedDirPath) && !fs.existsSync(destPath)) {
    for (let i = 0; i < 10; i++) {
      try {
        fs.renameSync(uncompressedDirPath, destPath);
        break;
      } catch (e) {
        console.log(`rename failed ${i} times. ${util.inspect(e)}`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }
    }
  }
}

function extractTarball(tarballPath: string, extractPath: string): void {
  tar.extract({
    file: tarballPath,
    cwd: extractPath,
    sync: true,
  });
}

async function download(thirdPartyFile: ThirdPartyFile): Promise<void> {
  const shouldDownload = thirdPartyFile.condition?.() ?? true;
  if (!shouldDownload) {
    console.log(`${thirdPartyFile.path} skipped`);
    return;
  }
  const fileUrl = thirdPartyFile.url;
  const destinationPath = path.resolve(rootPath, 'third-party', thirdPartyFile.path);

  const fileSize = await requestFileSizeRetry(fileUrl);
  const preExistFileSize = fs.existsSync(destinationPath) ? getFileSizeRecursive(destinationPath) : 0;
  if (fileSize <= preExistFileSize) {
    const mbFileSize = (fileSize / 1024 / 1024).toFixed(2);
    const mbPreExistFileSize = (preExistFileSize / 1024 / 1024).toFixed(2);
    console.log(`File: ${thirdPartyFile.path} size is ${mbPreExistFileSize} MB, remote size is ${mbFileSize} MB. Skip download`);
    return;
  }

  shelljs.rm('-rf', destinationPath);
  const isZip = fileUrl.endsWith('.zip');
  const isTgz = fileUrl.endsWith('.tar.gz');

  await getRetry(fileUrl, destinationPath);

  console.log(`${thirdPartyFile.path} downloaded`);
  if (isZip) {
    console.log(`${thirdPartyFile.path} unzipping`);
    fs.renameSync(destinationPath, destinationPath + '.zip');
    await compressing.zip.uncompress(destinationPath + '.zip', path.dirname(destinationPath));
    removeMacosxFiles(destinationPath);
    await renameUnzipedDir(fileUrl, destinationPath, '.zip');

    fs.unlinkSync(destinationPath + '.zip');
  }
  if (isTgz) {
    console.log(`${thirdPartyFile.path} tarball unzipping`);
    fs.renameSync(destinationPath, destinationPath + '.tar.gz');
    extractTarball(destinationPath + '.tar.gz', path.dirname(destinationPath));
    removeMacosxFiles(destinationPath);
    await renameUnzipedDir(fileUrl, destinationPath, '.tar.gz');

    fs.unlinkSync(destinationPath + '.tar.gz');
  }
  console.log(`${thirdPartyFile.path} post action`);
  await thirdPartyFile.postAction?.(destinationPath);

  console.log(`${thirdPartyFile.path} all done`);
}

async function processAll(promises: Promise<void>[], errorMessage: string): Promise<void> {
  const results = await Promise.allSettled(promises);
  const rejectedResults = results.filter((result) => result.status === 'rejected') as PromiseRejectedResult[];
  if (rejectedResults.length > 0) {
    console.error(errorMessage);
    for (const result of rejectedResults) {
      console.error(result.reason);
    }
    throw new Error('See above for details');
  }
}

function downloadAll(): Promise<void> {
  return processAll(files.map(download), 'Failed to download some third-party files');
}

function postDownloadAll(): Promise<void> {
  return processAll(
    files.map((file) => file.postDownload?.(file.path) ?? Promise.resolve()),
    'Failed to post download some third-party files',
  );
}

(async (): Promise<void> => {
  makeDirectories();
  console.log('>> Start');
  await downloadAll();
  await postDownloadAll();
  console.log('>> Done');
})().catch((err) => {
  console.error('Error: ', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('UnhandledRejection: ', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('UncaughtException: ', err);
  process.exit(1);
});
