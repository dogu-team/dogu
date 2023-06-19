import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { ActionConfig } from './config';
import { ConfigOptions, fillConfigOptions } from './options';

export const ActionConfigFileName = 'action.config.yaml';

export class ActionConfigLoader {
  constructor(private readonly options?: ConfigOptions) {}

  async load(): Promise<ActionConfig> {
    const filledOptions = fillConfigOptions(this.options);
    const { workingDir } = filledOptions;
    const configPath = path.resolve(workingDir, ActionConfigFileName);
    const content = await fs.promises.readFile(configPath, 'utf8');
    const parsed = yaml.parse(content) as Record<string, unknown>;
    return new ActionConfig(parsed);
  }
}
