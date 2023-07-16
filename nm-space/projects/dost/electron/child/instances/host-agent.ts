import { ChildCode, Status } from '@dogu-private/dost-children';
import { Code } from '@dogu-private/types';
import { Instance, parseAxiosError } from '@dogu-tech/common';
import { isFreePort, killProcessOnPort } from '@dogu-tech/node';
import axios from 'axios';
import { ChildProcess } from 'child_process';
import { HostAgentConnectionStatus, hostAgentKey } from '../../../src/shares/child';
import { AppConfigService } from '../../app-config/app-config-service';
import { FeatureConfigService } from '../../feature-config/feature-config-service';
import { getLogLevel, logger } from '../../log/logger.instance';
import { HostAgentLogsPath, HostAgentMainScriptPath } from '../../path-map';
import { Child, ChildLastError, fillChildOptions } from '../types';
import { closeChild, openChild } from './lifecycle';

export class HostAgentChild implements Child {
  constructor(private readonly appConfigService: AppConfigService, private readonly featureConfigService: FeatureConfigService) {}
  private _child: ChildProcess | undefined;
  private _lastError: ChildLastError | undefined;

  async open(): Promise<void> {
    const { appConfigService } = this;
    const DOGU_HOST_TOKEN = await appConfigService.get('DOGU_HOST_TOKEN');
    const NODE_ENV = await appConfigService.get('NODE_ENV');
    const DOGU_RUN_TYPE = await appConfigService.get('DOGU_RUN_TYPE');
    const DOGU_API_BASE_URL = await appConfigService.get('DOGU_API_BASE_URL');
    const DOGU_DEVICE_SERVER_HOST_PORT = await appConfigService.get('DOGU_DEVICE_SERVER_HOST_PORT');
    const DOGU_HOST_AGENT_PORT = await appConfigService.get('DOGU_HOST_AGENT_PORT');
    const DOGU_LOG_LEVEL = getLogLevel(DOGU_RUN_TYPE);
    await killProcessOnPort(DOGU_HOST_AGENT_PORT, logger).catch((err) => {
      logger.error('killProcessOnPort', { err });
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
      childLogger: logger,
    });

    this._child = openChild(hostAgentKey, HostAgentMainScriptPath, options, this.featureConfigService);
    this._child.on('close', (exitCode, signal) => {
      this._child = undefined;
      const childCode = new ChildCode(Code.CODE_HOST_AGENT_SUCCESS_BEGIN);
      childCode.code(exitCode, signal);
      logger.verbose('Connection. childCallback.onClose', { exitCode, signal, childCode });
    });
    return;
  }

  async openable(): Promise<boolean> {
    const DOGU_API_BASE_URL = await this.appConfigService.get<string>('DOGU_API_BASE_URL');
    const DOGU_HOST_TOKEN = await this.appConfigService.get<string>('DOGU_HOST_TOKEN');
    return !!DOGU_API_BASE_URL && !!DOGU_HOST_TOKEN;
  }

  async close(): Promise<void> {
    if (!this._child) {
      return;
    }
    await closeChild(hostAgentKey, this._child, logger);
    this._child = undefined;
  }

  async isActive(): Promise<boolean> {
    if (!this._child) {
      return false;
    }
    const DOGU_HOST_AGENT_PORT = await this.appConfigService.get('DOGU_HOST_AGENT_PORT');
    if (!DOGU_HOST_AGENT_PORT) {
      return false;
    }
    const isFree = await isFreePort(DOGU_HOST_AGENT_PORT);
    if (isFree) {
      return false;
    }
    return true;
  }

  async getConnectionStatus(): Promise<HostAgentConnectionStatus> {
    const DOGU_HOST_TOKEN = await this.appConfigService.get<string>('DOGU_HOST_TOKEN');
    if (!DOGU_HOST_TOKEN || DOGU_HOST_TOKEN.length === 0) {
      return {
        status: 'is-token-empty',
        code: Code.CODE_HOST_AGENT_NOT_RUNNING,
        updatedAt: new Date(),
      };
    }
    const doguHostAgentPort = await this.appConfigService.get<number>('DOGU_HOST_AGENT_PORT');
    const pathProvider = new Status.getConnectionStatus.pathProvider();
    const path = Status.getConnectionStatus.resolvePath(pathProvider);
    const response = await axios
      .get<Instance<typeof Status.getConnectionStatus.responseBody>>(`http://localhost:${doguHostAgentPort}${path}`, { timeout: 5000 })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        const parsed = parseAxiosError(error);
        logger.warn('getHostAgentConnectionStatus failed', { error: parsed });
        const response: HostAgentConnectionStatus = {
          status: 'disconnected',
          code: Code.CODE_HOST_AGENT_REQUEST_FAILED,
          reason: parsed.message,
          updatedAt: new Date(),
        };
        return response;
      });
    return response;
  }

  lastError(): ChildLastError | undefined {
    return this._lastError;
  }
}
