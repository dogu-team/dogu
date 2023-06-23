import { Printable, stringify } from '@dogu-tech/common';
import fs from 'fs/promises';
import path from 'path';

export async function copyDirectoryRecursive(sourceDir: string, destinationDir: string, logger: Printable): Promise<void> {
  try {
    if (!(await directoryExists(destinationDir))) {
      await fs.mkdir(destinationDir);
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
