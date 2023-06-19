import { ContentCreator, Entry } from './common';

export interface GoCreationOptions {
  packageName: string;
}

export class GoContentCreator implements ContentCreator<GoCreationOptions> {
  async create(entries: Entry[], options: GoCreationOptions): Promise<string> {
    await Promise.resolve();
    const content = entries
      .map((entry) => {
        const { key, value } = entry;
        return `\t${key} string = "${value}"`;
      })
      .join('\n');
    return `package ${options.packageName}\n\nconst (\n${content}\n)`;
  }
}
