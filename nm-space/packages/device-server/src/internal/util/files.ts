import path from 'path';

export function makeTmpFilePath(filePath: string): string {
  const tmpFilePath = path.resolve(path.dirname(filePath), `tmp_${path.basename(filePath)}`);
  return tmpFilePath;
}

export function getOriginFilePathFromTmp(tmpfilePath: string): string {
  const originFilePath = path.resolve(path.dirname(tmpfilePath), path.basename(tmpfilePath).replace(/^tmp_/, ''));
  return originFilePath;
}
