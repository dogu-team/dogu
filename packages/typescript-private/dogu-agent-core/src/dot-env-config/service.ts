import fs from 'fs';
import { DotEnvConfigKey } from './types';

export interface DotEnvConfigServiceOptions {
  dotEnvConfigPath: string;
}

export class DotEnvConfigService {
  private readonly dotEnvConfigPath: string;

  constructor(options: DotEnvConfigServiceOptions) {
    const { dotEnvConfigPath } = options;
    this.dotEnvConfigPath = dotEnvConfigPath;
  }

  getDotEnvConfigPath(): string {
    return this.dotEnvConfigPath;
  }

  get(key: DotEnvConfigKey): string | undefined {
    return process.env[key];
  }

  async write(key: DotEnvConfigKey, value: string): Promise<void> {
    process.env[key] = value;
    const content = await fs.promises.readFile(this.dotEnvConfigPath, 'utf8');
    const lines = content.split('\n');
    const lineIndex = lines.findIndex((line) => line.startsWith(`${key}=`));
    if (lineIndex === -1) {
      lines.push(`${key}=${value}`);
    } else {
      lines[lineIndex] = `${key}=${value}`;
    }
    await fs.promises.writeFile(this.dotEnvConfigPath, lines.join('\n'));
  }
}
