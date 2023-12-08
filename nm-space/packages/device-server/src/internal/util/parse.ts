export function parseRecord(line: string): string[] {
  if (0 === line.length) {
    return [];
  }
  const splited = line.trim().split(/\s{1,}|\t/);
  return splited;
}
