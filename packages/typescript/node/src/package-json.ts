import fs from 'fs';
import path from 'path';

export function findParentPackageJson(): string {
  // find package.json in parent
  let current = process.cwd();
  for (let i = 0; i < 10; i++) {
    const packageJsonPath = path.resolve(current, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      return packageJsonPath;
    }
    const parent = path.resolve(current, '..');
    if (parent === current) {
      break;
    }
    current = parent;
  }

  throw new Error('Cannot find package.json');
}

export function isMajorMinorMatch(a: string, b: string): boolean {
  const aArr = a.split('.');
  const bArr = b.split('.');
  if (aArr.length !== 2 || bArr.length !== 2) {
    return false;
  }
  return aArr[0] === bArr[0] && aArr[1] === bArr[1];
}

export class PackageJson {
  public readonly doc: Record<string, unknown>;

  constructor(public readonly filePath: string) {
    const fullString = fs.readFileSync(filePath, 'utf8');
    this.doc = JSON.parse(fullString) as Record<string, unknown>;
    if (!this.doc) {
      throw new Error(`Invalid package.json file: ${filePath}`);
    }
  }
}
