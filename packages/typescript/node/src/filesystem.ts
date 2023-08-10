import { Printable, stringify } from '@dogu-tech/common';
import fs from 'fs';
import fsPromise from 'fs/promises';
import path from 'path';

export async function copyDirectoryRecursive(sourceDir: string, destinationDir: string, logger: Printable): Promise<void> {
  try {
    if (!(await directoryExists(destinationDir))) {
      await fsPromise.mkdir(destinationDir, { recursive: true });
    }

    const files = await fsPromise.readdir(sourceDir);
    for (const file of files) {
      const sourcePath = path.join(sourceDir, file);
      const destinationPath = path.join(destinationDir, file);

      if (await isDirectory(sourcePath)) {
        await copyDirectoryRecursive(sourcePath, destinationPath, logger);
      } else {
        await fsPromise.copyFile(sourcePath, destinationPath);
      }
    }
  } catch (error) {
    logger.error(`Error copying directory: ${stringify(error)}`);
  }
}

export async function getDirectorySize(dir: string): Promise<number> {
  const files = await fsPromise.readdir(dir);
  let size = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const fileStat = await fsPromise.lstat(filePath);

    if (fileStat.isDirectory()) {
      size += await getDirectorySize(filePath);
    } else {
      size += fileStat.size;
    }
  }

  return size;
}

export async function getFileSizeRecursive(destPath: string): Promise<number> {
  if (fs.existsSync(destPath)) {
    const stat = await fsPromise.lstat(destPath);
    if (stat.isSymbolicLink()) {
      return 0;
    }
    if (stat.isFile()) {
      return stat.size;
    }
    if (stat.isDirectory()) {
      let size = 0;
      const files = await fsPromise.readdir(destPath);
      for (const file of files) {
        const filePath = path.resolve(destPath, file);
        size += await getFileSizeRecursive(filePath);
      }
      return size;
    }
  }
  return 0;
}

export async function removeItemRecursive(itemPath: string): Promise<void> {
  const itemStat = await fsPromise.lstat(itemPath);

  if (itemStat.isDirectory()) {
    const files = await fsPromise.readdir(itemPath);

    for (const file of files) {
      const filePath = path.join(itemPath, file);
      await removeItemRecursive(filePath);
    }

    await fsPromise.rmdir(itemPath);
  } else {
    await fsPromise.unlink(itemPath);
  }
}

async function directoryExists(dir: string): Promise<boolean> {
  try {
    const stats = await fsPromise.stat(dir);
    return stats.isDirectory();
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false;
    }

    throw error;
  }
}

export async function isDirectory(file: string): Promise<boolean> {
  const stats = await fsPromise.stat(file);
  return stats.isDirectory();
}

export async function findEndswith(currentDir: string, ends: string): Promise<string[]> {
  const files = await fsPromise.readdir(currentDir, { withFileTypes: true });
  const outPaths: string[] = [];
  for (const file of files) {
    if (file.isDirectory()) {
      const innerRet = await findEndswith(path.posix.join(currentDir, file.name), ends);
      outPaths.push(...innerRet);
      continue;
    } else if (file.isFile()) {
      if (file.name.endsWith(ends)) {
        outPaths.push(path.posix.join(currentDir, file.name));
      }
    }
  }
  return outPaths;
}

export async function checkDirectoryEqual(srcDirPath: string, destDirPath: string, ext: string): Promise<{ isEqual: boolean; reason: string }> {
  const srcFiles = await findEndswith(srcDirPath, ext);
  const destFiles = await findEndswith(destDirPath, ext);
  if (srcFiles.length !== destFiles.length) {
    return { isEqual: false, reason: `file count is different src:${srcFiles.length}, dest:${destFiles.length}` };
  }
  for (const srcFile of srcFiles) {
    const destFile = srcFile.replace(srcDirPath, destDirPath);
    if (!destFiles.includes(destFile)) {
      return { isEqual: false, reason: `file not found in dest. src:${srcFile}, dest:${destFile}` };
    }
    const srcFileContents = await fs.promises.readFile(srcFile, { encoding: 'utf-8' });
    const destFileContens = await fs.promises.readFile(destFile, { encoding: 'utf-8' });
    if (srcFileContents !== destFileContens) {
      return { isEqual: false, reason: `file contents is different. file: ${destFile}` };
    }
  }

  return { isEqual: true, reason: '' };
}
