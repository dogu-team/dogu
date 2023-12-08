import fs from 'fs';
import { DotenvConfigKey } from '../../shares/dotenv-config';

export interface DotenvConfigServiceOptions {
  dotenvConfigPath: string;
}

export class DotenvConfigService {
  private readonly dotenvConfigPath: string;

  constructor(options: DotenvConfigServiceOptions) {
    const { dotenvConfigPath } = options;
    this.dotenvConfigPath = dotenvConfigPath;
  }

  getDotenvConfigPath(): string {
    return this.dotenvConfigPath;
  }

  get(key: DotenvConfigKey): string | undefined {
    return process.env[key];
  }

  async write(key: DotenvConfigKey, value: string): Promise<void> {
    process.env[key] = value;
    const content = await fs.promises.readFile(this.dotenvConfigPath, 'utf8');
    const lines = content.split('\n');
    const lineIndex = lines.findIndex((line) => line.startsWith(`${key}=`));
    if (lineIndex === -1) {
      lines.push(`${key}=${value}`);
    } else {
      lines[lineIndex] = `${key}=${value}`;
    }
    await fs.promises.writeFile(this.dotenvConfigPath, lines.join('\n'));
  }
}
