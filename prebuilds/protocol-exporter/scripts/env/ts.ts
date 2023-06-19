import { ContentCreator, Entry } from './common';

export interface TsCreationOptions {}

export class TsContentCreator implements ContentCreator<TsCreationOptions> {
  async create(entries: Entry[], options: TsCreationOptions): Promise<string> {
    await Promise.resolve();
    return entries
      .map((entry) => {
        const { key, value } = entry;
        const line = `export const ${key} = '${value}';`;
        return line;
      })
      .join('\n');
  }
}
