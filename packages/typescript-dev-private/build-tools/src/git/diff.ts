import child_process from 'child_process';
import { minimatch } from 'minimatch';

export function matchesChangedFiles(patterns: string[]): boolean {
  const changedFiles = getChangedFiles();
  console.log('Changed files:', changedFiles);
  return changedFiles.some((changedFile) => {
    return patterns.some((pattern) => {
      return minimatch(changedFile, pattern);
    });
  });
}

function getChangedFiles(): string[] {
  const changedFiles = child_process.execSync('git diff --name-only HEAD HEAD~1').toString().trim();
  return changedFiles.split('\n');
}
