import fs from 'fs/promises';
import path from 'path';
import { logger } from '../log/logger.instance';

export async function copyDirectoryRecursive(sourceDir: string, destinationDir: string) {
  try {
    // Create the destination directory if it doesn't exist
    if (!(await directoryExists(destinationDir))) {
      await fs.mkdir(destinationDir);
    }

    // Read the contents of the source directory
    const files = await fs.readdir(sourceDir);

    // Iterate through the files and directories
    for (const file of files) {
      const sourcePath = path.join(sourceDir, file);
      const destinationPath = path.join(destinationDir, file);

      // Check if the current item is a directory
      if (await isDirectory(sourcePath)) {
        // Recursively copy the subdirectory
        await copyDirectoryRecursive(sourcePath, destinationPath);
      } else {
        // Copy the file
        await fs.copyFile(sourcePath, destinationPath);
      }
    }
  } catch (error) {
    logger.error(`Error copying directory: ${error}`);
  }
}

export async function directoryExists(dir: string) {
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

export async function isDirectory(file: string) {
  const stats = await fs.stat(file);
  return stats.isDirectory();
}
