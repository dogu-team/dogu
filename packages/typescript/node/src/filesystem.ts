import { Printable, stringify } from '@dogu-tech/common';
import fs from 'fs/promises';
import path from 'path';

export async function copyDirectoryRecursive(sourceDir: string, destinationDir: string, logger: Printable): Promise<void> {
  try {
    if (!(await directoryExists(destinationDir))) {
      await fs.mkdir(destinationDir, { recursive: true });
    }

    const files = await fs.readdir(sourceDir);
    for (const file of files) {
      const sourcePath = path.join(sourceDir, file);
      const destinationPath = path.join(destinationDir, file);

      if (await isDirectory(sourcePath)) {
        await copyDirectoryRecursive(sourcePath, destinationPath, logger);
      } else {
        await fs.copyFile(sourcePath, destinationPath);
      }
    }
  } catch (error) {
    logger.error(`Error copying directory: ${stringify(error)}`);
  }
}

export async function getDirectorySize(dir: string): Promise<number> {
  const files = await fs.readdir(dir);
  let size = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const fileStat = await fs.lstat(filePath);

    if (fileStat.isDirectory()) {
      size += await getDirectorySize(filePath);
    } else {
      size += fileStat.size;
    }
  }

  return size;
}

export async function removeItemRecursive(itemPath: string): Promise<void> {
  const itemStat = await fs.lstat(itemPath);

  if (itemStat.isDirectory()) {
    const files = await fs.readdir(itemPath);

    for (const file of files) {
      const filePath = path.join(itemPath, file);
      await removeItemRecursive(filePath);
    }

    await fs.rmdir(itemPath);
  } else {
    await fs.unlink(itemPath);
  }
}

async function directoryExists(dir: string): Promise<boolean> {
  try {
    const stats = await fs.stat(dir);
    return stats.isDirectory();
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false;
    }

    throw error;
  }
}

export async function isDirectory(file: string): Promise<boolean> {
  const stats = await fs.stat(file);
  return stats.isDirectory();
}

export async function findEndswith(currentDir: string, ends: string): Promise<string[]> {
  const files = await fs.readdir(currentDir, { withFileTypes: true });
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
    } else {
      throw new Error(`path is not directory or file. path: ${file.name}`);
    }
  }
  return outPaths;
}
