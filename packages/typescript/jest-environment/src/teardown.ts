import type { Config } from '@jest/types';
import { Dogu } from './common/instance.js';
import { logger } from './common/utils.js';

export default async function (globalConfig: Config.GlobalConfig, projectConfig: Config.ProjectConfig): Promise<void> {
  try {
    await Dogu.destroy();
  } catch (error) {
    logger.error('Failed to teardown Dogu', error);
  }
}
