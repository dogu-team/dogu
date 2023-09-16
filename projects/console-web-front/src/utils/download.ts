/*
 * Parse semver-like string to major, minor, patch and rc(optional)
 * ex1. 1.4.0 => { major: 1, minor: 4, patch: 0, rc: undefined }
 * ex2. 1.11.0-rc.2 => { major: 1, minor: 11, patch: 0, rc: 2 }
 */
export const parseSemver = (
  version: string,
): { major: number; minor: number; patch: number; rc: number | undefined } => {
  const [versionStr, rcStr] = version.split('-rc.');
  const [major, minor, patch] = versionStr.split('.').map(Number);
  const rc = rcStr ? Number(rcStr) : undefined;

  return { major, minor, patch, rc };
};
