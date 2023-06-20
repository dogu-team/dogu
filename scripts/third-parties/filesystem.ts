import fs from 'fs';
import path from 'path';

export function getFileSizeRecursive(destPath: string): number {
  if (fs.existsSync(destPath)) {
    const stat = fs.lstatSync(destPath);
    if (stat.isSymbolicLink()) {
      return 0;
    }
    if (stat.isFile()) {
      return stat.size;
    }
    if (stat.isDirectory()) {
      let size = 0;
      const files = fs.readdirSync(destPath);
      for (const file of files) {
        const filePath = path.resolve(destPath, file);
        size += getFileSizeRecursive(filePath);
      }
      return size;
    }
  }
  return 0;
}
