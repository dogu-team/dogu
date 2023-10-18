import { logger } from '../../../../logger/logger.instance';
import {
  AndroidDfInfo,
  AndroidProcCpuInfo,
  AndroidProcDiskstats,
  AndroidProcMemInfo,
  AndroidPropInfo,
  AndroidShellTopInfo,
  AndroidShellTopProcInfo,
  DefaultAndroidDfInfo,
  DefaultAndroidProcCpuInfo,
  DefaultAndroidProcDiskstats,
  DefaultAndroidProcMemInfo,
  DefaultAndroidPropInfo,
  DefaultAndroidShellTopInfo,
  DefaultAndroidShellTopProcInfo,
} from './info';

const isFirstCharNum = (str: string): boolean => str.charAt(0) >= '0' && str.charAt(0) <= '9';

function stripTokenInKey(key: string): string {
  let replaced = key.trim().replace('[', '').replace(']', '').replace(/\s/gi, '_').replace(/\%/gi, '_').replace(/\+/gi, '_').replace(/\./gi, '_').replace(/-/gi, '_');

  if (isFirstCharNum(replaced)) {
    replaced = `_${replaced}`;
  }

  return replaced;
}

function convertNumber(numStr: string): number {
  const numStrLower = numStr.toLowerCase().trim().replace(/\s/gi, '');
  let numStrStripped = numStrLower;
  let multipier = 1.0;
  if (numStrLower.endsWith('k') || numStrLower.endsWith('kb')) {
    numStrStripped = numStrStripped.replace('kb', '');
    numStrStripped = numStrStripped.replace('k', '');
    multipier = 1024;
  }
  if (numStrLower.endsWith('m') || numStrLower.endsWith('mb')) {
    numStrStripped = numStrStripped.replace('mb', '');
    numStrStripped = numStrStripped.replace('m', '');
    multipier = 1024 * 1024;
  }
  if (numStrLower.endsWith('g') || numStrLower.endsWith('gb')) {
    numStrStripped = numStrStripped.replace('gb', '');
    numStrStripped = numStrStripped.replace('g', '');
    multipier = 1024 * 1024 * 1024;
  }
  const ret = Number(numStrStripped) * multipier;

  return ret;
}

export function parseAndroidShellProp(contents: string): AndroidPropInfo {
  const propInfo: AndroidPropInfo = DefaultAndroidPropInfo();
  const lines = contents.split('\n');
  for (const l of lines) {
    const regex = new RegExp('(\\[[^\\[\\]]+\\])+', 'g');
    const matched = l.match(regex);
    if (!matched) continue;
    if (2 != matched.length) continue;
    if (matched[0] === undefined) continue;
    const key = stripTokenInKey(matched[0]);
    if (!Object.hasOwn(propInfo, key)) continue;
    if (matched[1] === undefined) continue;
    const value = matched[1].replace('[', '').replace(']', '');

    Reflect.set(propInfo, key, value);
  }

  return propInfo;
}

export function parseAndroidProcCpuInfo(contents: string): AndroidProcCpuInfo[] {
  const ret: AndroidProcCpuInfo[] = [];

  const cpuBlocks = contents.replace(/\r/gi, '').split('\n\n');
  for (const cb of cpuBlocks) {
    if (false === cb.startsWith('processor')) continue;
    const cpuInfo = DefaultAndroidProcCpuInfo();
    const lines = cb.split('\n');
    for (const l of lines) {
      const keyV = l.split(':');
      if (2 != keyV.length) continue;
      if (keyV[0] === undefined) continue;
      const key = stripTokenInKey(keyV[0]);
      if (!Object.hasOwn(cpuInfo, key)) continue;
      if (keyV[1] === undefined) continue;
      const v = keyV[1].trim();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const befV = Reflect.get(cpuInfo, key);
      if (typeof befV === 'number') {
        Reflect.set(cpuInfo, key, convertNumber(v));
      } else {
        Reflect.set(cpuInfo, key, v);
      }
    }
    ret.push(cpuInfo);
  }

  return ret;
}

export function parseAndroidProcMemInfo(contents: string): AndroidProcMemInfo {
  const memInfo: AndroidProcMemInfo = DefaultAndroidProcMemInfo();

  const lines = contents.replace(/\r/gi, '').split('\n');
  for (const l of lines) {
    const keyV = l.split(':');
    if (2 != keyV.length) continue;
    if (keyV[0] === undefined) continue;
    const key = stripTokenInKey(keyV[0]);
    if (!Object.hasOwn(memInfo, key)) continue;
    if (keyV[1] === undefined) continue;
    const v = convertNumber(keyV[1]);
    Reflect.set(memInfo, key, v);
  }

  return memInfo;
}

export function parseAndroidShellDf(contents: string): AndroidDfInfo[] {
  const ret: AndroidDfInfo[] = [];

  const lines = contents.replace(/\r/gi, '').split('\n');
  if (lines[0] === undefined) return ret;
  const schema = lines[0].split(/\s{1,}|\t/);
  for (let i = 1; i < lines.length; ++i) {
    const dfInfo: AndroidDfInfo = DefaultAndroidDfInfo();

    const l = lines[i];
    if (l === undefined) continue;
    const values = l.split(/\s{1,}|\t/);
    if (schema.length < values.length) continue;
    for (let vi = 0; vi < values.length; ++vi) {
      const schemaInfo = schema[vi];
      if (schemaInfo === undefined) continue;
      const key = stripTokenInKey(schemaInfo);
      if (!Object.hasOwn(dfInfo, key)) continue;
      const valueInfo = values[vi];
      if (valueInfo === undefined) continue;
      const v = valueInfo.trim();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const befV = Reflect.get(dfInfo, key);
      if (typeof befV === 'number') {
        Reflect.set(dfInfo, key, convertNumber(`${v}k`));
      } else {
        Reflect.set(dfInfo, key, v);
      }
    }

    ret.push(dfInfo);
  }

  return ret;
}

export function parseAndroidProcDiskstats(contents: string): AndroidProcDiskstats[] {
  contents = contents.trim().replace('\t', ' ').replace(/  +/g, ' ');

  const ret: AndroidProcDiskstats[] = [];
  const diskStatKeys = Object.keys(DefaultAndroidProcDiskstats());

  const lines = contents.replace(/\r/gi, '').split('\n');
  for (const l of lines) {
    const diskStat: AndroidProcDiskstats = DefaultAndroidProcDiskstats();
    const fields = l.trim().split(' ');
    for (let i = 0; i < fields.length; ++i) {
      const diskStatKey = diskStatKeys[i];
      if (diskStatKey === undefined) continue;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const befV = Reflect.get(diskStat, diskStatKey);
      if (typeof befV === 'number') {
        const field = fields[i];
        if (field === undefined) continue;
        Reflect.set(diskStat, diskStatKey, convertNumber(field));
      } else {
        Reflect.set(diskStat, diskStatKey, fields[i]);
      }
    }
    ret.push(diskStat);
  }

  return ret;
}

export function parseAndroidShellTop(contents: string): AndroidShellTopInfo {
  const topInfo: AndroidShellTopInfo = DefaultAndroidShellTopInfo();

  const lines = contents.replace(/\r/gi, '').split('\n');
  if (lines.length < 5) {
    logger.error('parseAndroidShellTop failed');
    return topInfo;
  }
  // header parse start //
  for (let i = 0; i < 3; ++i) {
    const l = lines[i];
    if (l === undefined) continue;
    const colonPos = l.search(':');
    const title = l.substring(0, colonPos).trim();
    const fields = l
      .substring(colonPos + 1)
      .trim()
      .split(',');
    for (const f of fields) {
      const splilted = f.trim().split(' ');
      if (2 != splilted.length) {
        logger.error(`parseAndroidShellTop split header failed ${l}`);
        continue;
      }
      if (splilted[0] === undefined) continue;
      const v = convertNumber(splilted[0]);
      if (splilted[1] === undefined) continue;
      const k = stripTokenInKey(splilted[1]);
      const propKey = `${title}${k}`;
      if (!Object.hasOwn(topInfo.header, propKey)) continue;

      Reflect.set(topInfo.header, propKey, v);
    }
  }
  {
    const l = lines[3];
    if (l === undefined) return topInfo;
    const fields = l.split(/\s{1,}|\t/);
    for (const f of fields) {
      const splilted = f.trim().split('%');
      if (2 != splilted.length) {
        logger.error(`parseAndroidShellTop split last header failed ${l}`);
        continue;
      }
      if (splilted[0] === undefined) continue;
      const v = convertNumber(splilted[0]);
      if (splilted[1] === undefined) continue;
      const k = stripTokenInKey(splilted[1]);
      if (!Object.hasOwn(topInfo.header, k)) continue;

      Reflect.set(topInfo.header, k, v);
    }
  }
  // header parse end //

  // body parse start //
  const line4th = lines[4];
  if (line4th === undefined) return topInfo;
  const schema = line4th
    .trim()
    .replace(/\[/gi, ' ')
    .split(/\s{1,}|\t/);
  for (let i = 5; i < lines.length; ++i) {
    const procInfo: AndroidShellTopProcInfo = DefaultAndroidShellTopProcInfo();
    const l = lines[i];
    if (l === undefined) continue;
    let values = l.trim().split(/\s{1,}|\t/);
    // split시 shema갯수보다 넘어간 value는 ARGS 컬럼 값으로 처리
    for (let vlasti = schema.length; vlasti < values.length; ++vlasti) {
      const vlast = values[vlasti];
      if (vlast === undefined) continue;
      values[schema.length - 1] += ` ${vlast}`;
    }
    values = values.slice(0, schema.length);
    for (let vi = 0; vi < values.length; ++vi) {
      const schemaInfo = schema[vi];
      if (schemaInfo === undefined) continue;
      const key = stripTokenInKey(schemaInfo);
      if (!Object.hasOwn(procInfo, key)) continue;

      const valueInfo = values[vi];
      if (valueInfo === undefined) continue;
      const v = valueInfo.trim();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const befV = Reflect.get(procInfo, key);
      if (typeof befV === 'number') {
        Reflect.set(procInfo, key, convertNumber(`${v}`));
      } else {
        Reflect.set(procInfo, key, v);
      }
    }

    topInfo.procs.push(procInfo);
  }
  // body parse end //

  return topInfo;
}

export interface AndroidFileEntry {
  isDirectory: boolean;
  name: string;
}

export function parseAndroidLs(contents: string): AndroidFileEntry[] {
  const ret: AndroidFileEntry[] = [];

  const lines = contents.replace(/\r/gi, '').split('\n');
  for (const l of lines) {
    const entry: AndroidFileEntry = {
      isDirectory: false,
      name: '',
    };
    const fields = l.split(/\s{1,}|\t/);
    if (fields.length < 8) continue;
    if (fields[0] === undefined) continue;
    if (fields[0].length < 1) continue;
    if (fields[0].charAt(0) !== 'd') continue;
    entry.isDirectory = true;
    if (fields[7] === undefined) continue;
    entry.name = fields.slice(7).join(' ');
    ret.push(entry);
  }

  return ret;
}
export interface ImeInfo {
  packageName: string;
  service: string;
}

export function parseIMEList(input: string): ImeInfo[] {
  const pattern = /(?<packageName>\S+)\/(?<service>\S+):/;
  const lines = input.split('\n');
  const imes: ImeInfo[] = [];

  let section = '';
  for (const line of lines) {
    if (line.startsWith(' ')) {
      continue;
    }
    const match = line.match(pattern);
    if (match) {
      const { packageName, service } = match.groups!;
      imes.push({
        packageName,
        service,
      });
    }
  }
  return imes;
}
