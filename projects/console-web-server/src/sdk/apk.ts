import { stringify, stringifyError } from '@dogu-tech/common';
import { Manifest, open } from 'adbkit-apkreader';
import AdmZip, { IZipEntry } from 'adm-zip';
import childProcess from 'child_process';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import util from 'util';
import { logger } from '../module/logger/logger.instance';

import { BinaryPath } from './binary/path';

const execAsync = util.promisify(childProcess.exec);
const getDataEntryAsync = (entry: IZipEntry) => {
  return new Promise<Buffer>((resolve, reject) => {
    entry.getDataAsync((data, err) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

class LineBuffer {
  buffer = '';
  lines: string[] = [];

  push(data: string) {
    this.buffer += data;
    const splited = this.buffer.split('\n');
    this.buffer = splited.pop() || '';
    this.lines.push(...splited);
  }
}

export module Apk {
  interface ApkInfo {
    name: string;
    package: string;
    version: string;
    icon: Buffer | undefined;
  }

  async function writeApk(buffer: Buffer, hash: string) {
    const tempFilePath = path.resolve(os.tmpdir(), `tmp/${hash}.apk`);
    const tempFolderPath = path.dirname(tempFilePath);

    await fs.mkdir(tempFolderPath, { recursive: true });
    await fs.writeFile(tempFilePath, buffer);

    return tempFilePath;
  }

  async function readAndroidManifestXml(apkZip: AdmZip, appPath: string, tempName: string): Promise<Manifest> {
    const reader = await open(appPath);
    const manifest = await reader.readManifest();
    return manifest;
  }

  async function findResource(apkPath: string, resourceId: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      const lineBuffer = new LineBuffer();
      let isFound = false;
      let isResolved = false;
      let lineIndent = 0;
      const resourceLines: string[] = [];
      const child = childProcess.spawn(BinaryPath.Aapt, ['dump', 'resources', apkPath], { timeout: 60 * 1000 });
      child.stdout?.setEncoding('utf8');
      child.stdout?.on('data', (data) => {
        if (isResolved) {
          return;
        }
        const str = data.toString() as string;
        lineBuffer.push(str);

        for (const line of lineBuffer.lines) {
          if (line.includes(`resource ${resourceId}`)) {
            isFound = true;
            lineIndent = line.indexOf('resource');
          }
          if (isFound) {
            for (let i = 0; i < line.length; i++) {
              // depth changed to parent
              if (line[i] !== ' ' && i <= lineIndent && 0 < resourceLines.length) {
                isResolved = true;
                resolve(resourceLines);
                return;
              }
            }
            resourceLines.push(line);
          }
        }
        if (!isFound) {
          lineBuffer.lines = [];
        }
      });
      child.on('error', (err) => {
        logger.error(`readResources exit: ${stringifyError(err)}, ${apkPath} ${resourceId}`);
        resolve([]);
      });
      child.on('exit', (code) => {
        if (code && code !== 0) {
          logger.error(`readResources exit: ${code}, ${apkPath} ${resourceId}`);
        }
        resolve([]);
      });
    });
  }

  async function getIconPath(apkPath: string, androidManifestXml: Manifest) {
    const iconResourceId = androidManifestXml.application!.icon!.replace('@', '').replace('resourceId:', '').toLowerCase();
    const lines = await findResource(apkPath, iconResourceId);
    lines.reverse();

    let iconPath = 'apk_default_icon.png';
    for (const line of lines) {
      // ex. (mdpi) (file) res/fr.9.png type=PNG
      // ex. (xhdpi) (file) res/dCV.webp
      const splited = line.trim().split(' ');
      if (splited.length < 3) {
        continue;
      }
      const path = splited[2];
      if (path.endsWith('.png') || path.endsWith('.webp') || path.endsWith('.jpg') || path.endsWith('.jpeg')) {
        return line.trim().split(' ')[2];
      }
    }

    logger.warn(`getIconPath failed ${stringify({ apkPath, iconResourceId })}, default path returned`);
    return iconPath;
  }

  async function getAppName(apkPath: string) {
    const { stdout } = await execAsync(`${BinaryPath.Aapt} dump badging ${apkPath}`);

    const regex = /application-label:'(.*)'/g;
    const appName = regex.exec(stdout.toString())![1];
    return appName;
  }

  async function getIcon(apkZip: AdmZip, apkPath: string, androidManifestXml: Manifest): Promise<Buffer | undefined> {
    const iconPath = await getIconPath(apkPath, androidManifestXml);

    const iconEntry = apkZip.getEntry(iconPath);
    if (!iconEntry) {
      return undefined;
    }

    const iconData = await getDataEntryAsync(iconEntry);
    return iconData;
  }

  export async function getApkInfo(apk: Buffer, hash: string): Promise<ApkInfo> {
    let needToDeleteApkPath: string | undefined;

    try {
      const apkPath = await writeApk(apk, hash);
      needToDeleteApkPath = apkPath;

      const apkZip = new AdmZip(apk);
      const androidManifestXml = await readAndroidManifestXml(apkZip, apkPath, hash);
      const iconData = await getIcon(apkZip, apkPath, androidManifestXml);
      const appName = await getAppName(apkPath);

      const apkInfo: ApkInfo = {
        name: appName,
        package: androidManifestXml.package!,
        version: androidManifestXml.versionName!,
        icon: iconData,
      };

      return apkInfo;
    } finally {
      if (needToDeleteApkPath) {
        await Promise.all([fs.unlink(needToDeleteApkPath)]);
      }
    }
  }
}
