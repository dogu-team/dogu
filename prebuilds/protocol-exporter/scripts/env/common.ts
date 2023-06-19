import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

export interface ParseOptions {}

export interface Entry {
  key: string;
  value: string;
}

export interface ContentCreator<Options> {
  create: (entries: Entry[], options: Options) => Promise<string>;
}

export async function parse(path: string, options: ParseOptions): Promise<Entry[]> {
  const content = await fs.promises.readFile(path, 'utf8');
  const result = dotenv.parse(content);
  return Object.entries(result).map(([key, value]) => ({ key, value }));
}

export class Exporter<CreationOptions, ContentCreatorType extends ContentCreator<CreationOptions>> {
  constructor(private readonly extension: string, private readonly type: { new (): ContentCreatorType }) {}

  async export(srcFilePath: string, dstDir: string, parseOptions: ParseOptions, creationOptions: CreationOptions): Promise<void> {
    const entries = await parse(srcFilePath, parseOptions);
    const instance: ContentCreatorType = new this.type();
    const content = await instance.create(entries, creationOptions);
    const filename = path.parse(srcFilePath).name;
    const dst = path.resolve(dstDir, `${filename}.${this.extension}`);
    await fs.promises.mkdir(path.parse(dst).dir, { recursive: true });
    await fs.promises.writeFile(dst, content, 'utf8');
  }
}
