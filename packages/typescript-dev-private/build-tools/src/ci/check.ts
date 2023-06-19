export function isCI(): boolean {
  return process.env.CI === 'true' || undefined !== process.env.GITHUB_ACTION;
}
