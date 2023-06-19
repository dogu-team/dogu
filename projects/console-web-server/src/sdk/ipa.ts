import AdmZip, { IZipEntry } from 'adm-zip';
import bplist from 'bplist-parser';
import cgbiToPng from 'cgbi-to-png';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import plist, { PlistObject } from 'plist';
import { logger } from '../module/logger/logger.instance';

export module Ipa {
  interface Info {
    name: string;
    package: string;
    version: string;
    icon: Buffer | undefined;
  }

  async function writeFile(buffer: Buffer, hash: string) {
    const tempFilePath = path.resolve(os.tmpdir(), `tmp/${hash}.ipa`);
    const tempFolderPath = path.dirname(tempFilePath);

    await fs.mkdir(tempFolderPath, { recursive: true });
    await fs.writeFile(tempFilePath, buffer);

    return tempFilePath;
  }

  function getEntries(appZip: AdmZip, hash: string): { plist: IZipEntry | undefined; images: IZipEntry[] } {
    const images: IZipEntry[] = [];
    let plist: IZipEntry | undefined;
    const entries = appZip.getEntries();
    for (const entry of entries) {
      const enaaa = entry.entryName;
      if (entry.entryName.endsWith('.app/Info.plist')) {
        if (plist) {
          logger.error(`Duplicate info.plist in ipa`);
        } else {
          plist = entry;
        }
      }
      if (entry.entryName.endsWith('.png')) {
        images.push(entry);
      }
    }
    return { plist: plist, images: images };
  }

  function readInfoPlist(entry: IZipEntry): { name: string; package: string; version: string; iconPaths: string[] } {
    const fileData = entry.getData().toString('utf8');
    let doc: PlistObject = {};
    try {
      const bpdoc = bplist.parseBuffer(entry.getData());
      doc = bpdoc[0] as PlistObject;
    } catch {
      doc = plist.parse(fileData) as PlistObject;
    }
    const name = (doc.CFBundleDisplayName as string) || (doc.CFBundleName as string) || 'unknown';
    const packageName = (doc.CFBundleIdentifier as string) || 'unknown';
    const version = (doc.CFBundleShortVersionString as string) || 'unknown';
    let iconPaths: string[] = [];
    try {
      const bundleIcons = doc.CFBundleIcons as PlistObject;
      const bundlePrimaryIcon = bundleIcons.CFBundlePrimaryIcon as PlistObject;
      iconPaths = bundlePrimaryIcon.CFBundleIconFiles as string[];
    } catch {
      logger.error(`Cannot find icon path in plist`);
    }
    return { name: name, package: packageName, version: version, iconPaths: iconPaths };
  }

  function getIcon(images: IZipEntry[], iconPaths: string[]): Buffer | undefined {
    for (const iconPath of iconPaths) {
      const icon = images.find((image) => image.name.startsWith(iconPath));
      if (icon) {
        var pngBuffer = cgbiToPng.revert(icon.getData());
        return pngBuffer;
      }
    }
    return undefined;
  }

  export async function getIpaInfo(fileBuffer: Buffer, hash: string): Promise<Info> {
    const appZip = new AdmZip(fileBuffer);
    const entries = getEntries(appZip, hash);
    if (!entries.plist) {
      throw new Error(`Cannot find info.plist in ${hash}.ipa`);
    }
    const plistDoc = readInfoPlist(entries.plist);

    const iconData = getIcon(entries.images, plistDoc.iconPaths);

    const info: Info = {
      name: plistDoc.name,
      package: plistDoc.package,
      version: plistDoc.version,
      icon: iconData,
    };

    return info;
  }
}
