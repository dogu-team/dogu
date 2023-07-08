import { ChildCode } from '@dogu-private/dost-children';
import { logger } from '@dogu-private/host-agent';
import { Code } from '@dogu-private/types';
import { ChildProcess } from 'child_process';
import { killPortProcess } from 'kill-port-process';
import { hostAgentKey } from '../../../src/shares/child';
import { AppConfigService } from '../../app-config/app-config-service';
import { getLogLevel } from '../../log/logger.instance';
import { HostAgentLogsPath, HostAgentMainScriptPath } from '../../path-map';
import { ChildFactory } from '../child-factory';
import { ChildService } from '../child-service';
import { Child, fillChildOptions } from '../types';

export class HostAgentChild implements Child {
  constructor(private readonly childFactory: ChildFactory, private readonly appConfigService: AppConfigService, private readonly childService: ChildService) {}

  async open(): Promise<ChildProcess> {
    const { appConfigService } = this;
    const DOGU_HOST_TOKEN = await appConfigService.get('DOGU_HOST_TOKEN');
    const NODE_ENV = await appConfigService.get('NODE_ENV');
    const DOGU_RUN_TYPE = await appConfigService.get('DOGU_RUN_TYPE');
    const DOGU_API_BASE_URL = await appConfigService.get('DOGU_API_BASE_URL');
    const DOGU_DEVICE_SERVER_HOST_PORT = await appConfigService.get('DOGU_DEVICE_SERVER_HOST_PORT');
    const DOGU_HOST_AGENT_PORT = await appConfigService.get('DOGU_HOST_AGENT_PORT');
    const DOGU_LOG_LEVEL = getLogLevel(DOGU_RUN_TYPE);
    await killPortProcess(DOGU_HOST_AGENT_PORT).catch((err) => {
      logger.error('killPortProcess', err);
    });
    logger.info(`HostAgentChild DOGU_LOG_LEVEL: ${DOGU_LOG_LEVEL}`);
    const options = await fillChildOptions({
      forkOptions: {
        env: {
          ...process.env,
          NODE_ENV,
          DOGU_RUN_TYPE,
          DOGU_HOST_TOKEN,
          DOGU_API_BASE_URL,
          DOGU_DEVICE_SERVER_HOST_PORT,
          DOGU_LOGS_PATH: HostAgentLogsPath,
          DOGU_HOST_AGENT_PORT,
          DOGU_LOG_LEVEL,
        },
      },
    });

    const child = this.childService.open(hostAgentKey, HostAgentMainScriptPath, options);
    child.on('close', (exitCode, signal) => {
      const childCode = new ChildCode(Code.CODE_HOST_AGENT_SUCCESS_BEGIN);
      childCode.code(exitCode, signal);
      logger.verbose('Connection. childCallback.onClose', { exitCode, signal, childCode });
    });
    return child;
  }

  async openable(): Promise<boolean> {
    const DOGU_API_BASE_URL = await this.appConfigService.get<string>('DOGU_API_BASE_URL');
    const DOGU_HOST_TOKEN = await this.appConfigService.get<string>('DOGU_HOST_TOKEN');
    return !!DOGU_API_BASE_URL && !!DOGU_HOST_TOKEN;
  }

  setOnChangeHandler(): void {
    const { appConfigService } = this;
    const reopen = async (fromToken: boolean = false) => {
      const isActive = await this.childService.isActive('host-agent');
      if (isActive) {
        await this.childService.close('host-agent');
      }
      if (fromToken) {
        const token = await appConfigService.get<string>('DOGU_HOST_TOKEN');
        if (!token) {
          return;
        }
      }
      return this.childFactory.open('host-agent');
    };
    appConfigService.client.onDidChange('NODE_ENV', () => reopen(false));
    appConfigService.client.onDidChange('DOGU_RUN_TYPE', () => reopen(false));
    appConfigService.client.onDidChange('DOGU_HOST_TOKEN', () => reopen(true));
    appConfigService.client.onDidChange('DOGU_API_BASE_URL', () => reopen(false));
    appConfigService.client.onDidChange('DOGU_DEVICE_SERVER_HOST_PORT', () => reopen(false));
    appConfigService.client.onDidChange('DOGU_HOST_AGENT_PORT', () => reopen(false));
  }
}
