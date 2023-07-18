import type { Config } from '@jest/types';
import { Dogu } from './common/instance.js';

export default async function (globalConfig: Config.GlobalConfig, projectConfig: Config.ProjectConfig): Promise<void> {
  await Dogu.driver();
}
