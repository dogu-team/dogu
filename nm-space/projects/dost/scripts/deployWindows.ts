import { ArtifactCreated } from 'electron-builder';
import path from 'path';

export async function findWindowsDistfile(ctx: ArtifactCreated): Promise<string> {
  // find file endswith .dmg

  const files = [path.basename(ctx.file)];
  let exeFiles = files.filter((file) => file.endsWith('.exe') || file.endsWith('.nsis.7z'));
  if (0 === exeFiles.length) {
    console.warn('No exe file found in dist folder');
    return '';
  }
  if (1 < exeFiles.length) {
    console.warn('Multiple exe files found');
    return '';
  }

  return path.resolve(ctx.file);
}
