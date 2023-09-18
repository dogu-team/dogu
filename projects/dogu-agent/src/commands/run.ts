import { AppConfigLoader } from '@dogu-private/dogu-agent-core/app';
import { HostPaths, LoggerFactory } from '@dogu-tech/node';
findDogu;

export async function run(url: string, token: string) {
  const logger = LoggerFactory.create('run');
  const configsPath = HostPaths.configsPath(HostPaths.doguHomePath);
  const appName = 'dogu-agent-cli' + process.env.DOGU_RUN_TYPE ? `-${process.env.DOGU_RUN_TYPE?.toLowerCase()}` : '';
  const enableOpenInEditor = process.env.NODE_ENV !== 'production';

  /**
   * @fixme
   */
  console.log(process.cwd());
  const appConfigService = await new AppConfigLoader({
    configsPath,
    logger,
    appName,
    enableOpenInEditor,
    dotenvSearchPaths: [],
  }).load();
}
