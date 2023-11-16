import { ChildCode, GetLatestVersionResponse, Status, UpdateLatestVersionRequest, UpdateLatestVersionResponse } from '@dogu-private/dost-children';
import { isValidDoguRunType } from '@dogu-private/types';
import { DefaultHttpOptions, delay, errorify, Instance, Printable, setAxiosErrorFilterToIntercepter } from '@dogu-tech/common';
import { isFreePort, killProcessOnPort } from '@dogu-tech/node';
import { Code } from '@dogu-tech/types';
import axios, { AxiosInstance } from 'axios';
import { ChildProcess } from 'child_process';
import http from 'http';
import path from 'path';
import { hostAgentKey } from '../../../shares/child';
import { AppConfigService } from '../../app-config/service';
import { FeatureConfigService } from '../../index';
import { getLogLevel } from '../../log-utils';
import { closeChild, openChild } from '../lifecycle';
import { Child, ChildLastError, ChildListener, fillChildOptions, HostAgentConnectionStatus } from '../types';

const hostAgentMainScriptPath = path.resolve(__dirname, 'main.js');

export class HostAgentChild implements Child {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly featureConfigService: FeatureConfigService,
    private readonly logsPath: string,
    private readonly listener: ChildListener,
    private readonly logger: Printable,
  ) {}
  private _child: ChildProcess | undefined;
  private _lastError: ChildLastError | undefined;
  private _client: AxiosInstance | undefined;
  private _lastStatusAndTime: { status: HostAgentConnectionStatus; time: number } | undefined;

  async open(): Promise<void> {
    const { appConfigService } = this;
    const DOGU_HOST_TOKEN = appConfigService.get<string>('DOGU_HOST_TOKEN');
    const NODE_ENV = appConfigService.get<string>('NODE_ENV');
    const DOGU_RUN_TYPE = appConfigService.get<string>('DOGU_RUN_TYPE');
    const DOGU_API_BASE_URL = appConfigService.get<string>('DOGU_API_BASE_URL');
    const DOGU_DEVICE_SERVER_HOST_PORT = appConfigService.get<string>('DOGU_DEVICE_SERVER_HOST_PORT');
    const DOGU_HOST_AGENT_PORT = appConfigService.get<number>('DOGU_HOST_AGENT_PORT');
    const DOGU_USE_SENTRY = this.featureConfigService.get('useSentry');
    if (!isValidDoguRunType(DOGU_RUN_TYPE)) {
      throw new Error(`Invalid DOGU_RUN_TYPE: ${DOGU_RUN_TYPE}`);
    }

    const DOGU_LOG_LEVEL = getLogLevel(DOGU_RUN_TYPE, appConfigService);
    const DOGU_ROOT_PID = process.pid.toString();
    await killProcessOnPort(DOGU_HOST_AGENT_PORT, this.logger).catch((err) => {
      this.logger.error('killProcessOnPort', { error: errorify(err) });
    });

    const hostAgentLogsPath = path.resolve(this.logsPath, 'host-agent');
    this.logger.info(`HostAgentChild DOGU_LOG_LEVEL: ${DOGU_LOG_LEVEL}`);
    const options = await fillChildOptions({
      forkOptions: {
        env: {
          ...process.env,
          NODE_ENV,
          DOGU_RUN_TYPE,
          DOGU_HOST_TOKEN,
          DOGU_API_BASE_URL,
          DOGU_DEVICE_SERVER_HOST_PORT,
          DOGU_LOGS_PATH: hostAgentLogsPath,
          DOGU_HOST_AGENT_PORT: `${DOGU_HOST_AGENT_PORT}`,
          DOGU_LOG_LEVEL,
          DOGU_ROOT_PID,
          DOGU_USE_SENTRY: DOGU_USE_SENTRY ? 'true' : 'false',
        },
      },
      childLogger: this.logger,
    });

    this._child = openChild(hostAgentKey, hostAgentMainScriptPath, options, this.listener);
    this._child.on('close', (exitCode, signal) => {
      this.logger.error('HostAgentChild close critical error!!', { exitCode, signal });
      this._child = undefined;
      const childCode = new ChildCode(Code.CODE_HOST_AGENT_SUCCESS_BEGIN);
      childCode.code(exitCode, signal);
      this.logger.verbose?.('Connection. childCallback.onClose', { exitCode, signal, childCode });
    });
    this._client = axios.create({
      baseURL: `http://127.0.0.1:${DOGU_HOST_AGENT_PORT}`,
      httpAgent: new http.Agent({ keepAlive: true, maxSockets: 1, maxTotalSockets: 1, maxFreeSockets: 0 }),
      timeout: 5000,
      maxRedirects: 10,
      maxContentLength: 50 * 1000 * 1000,
    });
    setAxiosErrorFilterToIntercepter(this._client);
  }

  openable(): boolean {
    const DOGU_API_BASE_URL = this.appConfigService.get<string>('DOGU_API_BASE_URL');
    const DOGU_HOST_TOKEN = this.appConfigService.get<string>('DOGU_HOST_TOKEN');
    return !!DOGU_API_BASE_URL && !!DOGU_HOST_TOKEN;
  }

  async close(): Promise<void> {
    if (!this._child) {
      return;
    }
    await closeChild(hostAgentKey, this._child, this.logger);
    this._child = undefined;
  }

  async isActive(): Promise<boolean> {
    if (!this._child) {
      return false;
    }
    const DOGU_HOST_AGENT_PORT = this.appConfigService.get<number>('DOGU_HOST_AGENT_PORT');
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
    const DOGU_HOST_TOKEN = this.appConfigService.get<string>('DOGU_HOST_TOKEN');
    if (!DOGU_HOST_TOKEN || DOGU_HOST_TOKEN.length === 0) {
      return {
        status: 'is-token-empty',
        code: Code.CODE_HOST_AGENT_NOT_RUNNING,
        updatedAt: new Date(),
      };
    }
    if (!this._client) {
      return {
        status: 'disconnected',
        code: Code.CODE_HOST_AGENT_NOT_RUNNING,
        updatedAt: new Date(),
      };
    }
    if (this._lastStatusAndTime && this._lastStatusAndTime.time + 3000 > Date.now()) {
      return this._lastStatusAndTime.status;
    }
    const pathProvider = new Status.getConnectionStatus.pathProvider();
    const path = Status.getConnectionStatus.resolvePath(pathProvider);
    const response = await this._client
      .get<Instance<typeof Status.getConnectionStatus.responseBody>>(path, { timeout: DefaultHttpOptions.request.timeout })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        const errorified = errorify(error);
        this.logger.warn?.('getHostAgentConnectionStatus failed', { error: errorified });
        const response: HostAgentConnectionStatus = {
          status: 'disconnected',
          code: Code.CODE_HOST_AGENT_REQUEST_FAILED,
          reason: errorified.message,
          updatedAt: new Date(),
        };
        return response;
      });
    this._lastStatusAndTime = { status: response, time: Date.now() };
    return response;
  }

  async getLatestVersion(): Promise<GetLatestVersionResponse> {
    if (!this._client) {
      throw new Error('Not connected');
    }
    const pathProvider = new Status.getLatestVersion.pathProvider();
    const path = Status.getLatestVersion.resolvePath(pathProvider);
    const response = await this._client
      .get<Instance<typeof Status.getLatestVersion.responseBody>>(path, { timeout: DefaultHttpOptions.request.timeout1minutes })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        this.logger.warn?.('getLatestVersion failed', { error: errorify(error) });
        throw error;
      });
    return response;
  }

  async updateLatestVersion(req: UpdateLatestVersionRequest): Promise<UpdateLatestVersionResponse> {
    if (!this._client) {
      throw new Error('Not connected');
    }
    const pathProvider = new Status.updateLatestVersion.pathProvider();
    const path = Status.updateLatestVersion.resolvePath(pathProvider);
    const res = await this._client.post<Instance<typeof Status.updateLatestVersion.responseBody>>(path, req, { timeout: DefaultHttpOptions.request.timeout30minutes });
    const data = res.data;
    if (data.isOk) {
      await delay(3_600_000); // wait until die
    }
    return data;
  }

  lastError(): ChildLastError | undefined {
    return this._lastError;
  }
}
