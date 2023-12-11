import { HostPaths } from '@dogu-tech/node';
import path from 'path';

export type FilePathValidationType = 'home' | 'temp' | 'download';

export const FilePathValidationTypeToPath = (type: FilePathValidationType): string => {
  switch (type) {
    case 'home':
      return HostPaths.doguHomePath;
    case 'temp':
      return HostPaths.doguTempPath();
    case 'download':
      return HostPaths.downloadsPath(HostPaths.doguHomePath);
  }
};

export function validateFilePath(filePath: string, types: FilePathValidationType[]): Error | undefined {
  const filePathResolved = path.resolve(filePath);
  const allowedPaths = types.map(FilePathValidationTypeToPath);
  const hasSome = allowedPaths.some((allowedPath) => {
    const relativeFrom = path.relative(allowedPath, filePathResolved);
    if (relativeFrom.startsWith('..')) {
      return false;
    }
    return true;
  });
  if (hasSome) {
    return;
  }
  return new Error(`File path is not allowed: ${filePath}`);
}
