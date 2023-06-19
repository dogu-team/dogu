import fs from 'fs';

export class PackageJson {
  private doc: Record<string, Record<string, unknown>>;

  constructor(public readonly filePath: string) {
    const fullString = fs.readFileSync(filePath, 'utf8');
    this.doc = JSON.parse(fullString) as Record<string, Record<string, unknown>>;
    if (!this.doc) {
      throw new Error(`Invalid package.json file: ${filePath}`);
    }
  }

  public getName(): string {
    return this.doc['name'] as unknown as string;
  }

  public setScript(key: string, value: string): void {
    this.doc['scripts'][key] = value;
  }

  public getDependency(key: string): string {
    return this.doc['dependencies'][key] as string;
  }

  public getDependencies(): { name: string; value: string }[] {
    if (!this.doc['dependencies']) {
      return [];
    }
    const entries = Object.entries(this.doc['dependencies']) as unknown as [string, string][];
    return entries.map((e) => ({ name: e[0], value: e[1] }));
  }

  public setDependency(key: string, value: string): void {
    this.doc['dependencies'][key] = value;
  }

  public getDevDependency(key: string): string {
    return this.doc['devDependencies'][key] as string;
  }
  public getDevDependencies(): { name: string; value: string }[] {
    if (!this.doc['devDependencies']) {
      return [];
    }
    const entries = Object.entries(this.doc['devDependencies']) as unknown as [string, string][];
    return entries.map((e) => ({ name: e[0], value: e[1] }));
  }

  public setDevDependency(key: string, value: string): void {
    this.doc['devDependencies'][key] = value;
  }

  public deleteDevDependency(key: string): void {
    delete this.doc['devDependencies'][key];
  }
  public deleteDevDependencies(): void {
    this.doc['devDependencies'] = {};
  }

  public write(): void {
    const newString = JSON.stringify(this.doc, null, 2);
    fs.writeFileSync(this.filePath, newString, 'utf8');
  }
}
