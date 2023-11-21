import { PrivateDeviceJob } from '@dogu-private/console-host-agent';
import { BrowserName, createConsoleApiAuthHeader, OrganizationId, Platform, RoutineDeviceJobId } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, DefaultHttpOptions, errorify, Instance, Retry, toISOStringWithTimezone } from '@dogu-tech/common';
import { ChildProcess, logger } from '@dogu-tech/node';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import path from 'path';
import WebSocket from 'ws';
import { ConsoleClientService } from '../console-client/console-client.service';
import { OnDeviceJobCancelRequestedEvent, OnDeviceJobPostProcessCompletedEvent, OnDeviceJobStartedEvent } from '../device-job/device-job.events';
import { env } from '../env';
import { OnHostDisconnectedEvent, OnHostResolvedEvent } from '../host/host.events';
import { DoguLogger } from '../logger/logger';
import { OnStepProcessStartedEvent } from '../step/step.events';
import { HostResolutionInfo } from '../types';
import { DeviceJobRecordingService } from './device-job.recording-service';

interface WindowInfo {
  pid: number;
}

interface DeviceJobInfo {
  browserName: BrowserName;
  recordDeviceRunnerPath: string;
  record: boolean;
  platform: Platform;
}

@Injectable()
export class DeviceJobWindowsProcessRegistry {
  private hostResolutionInfo: HostResolutionInfo | null = null;
  private readonly deviceJobInfos = new Map<string, DeviceJobInfo>();
  private readonly findWindowsWebSockets = new Map<string, WebSocket[]>();
  private readonly recordWebSockets = new Map<string, WebSocket>();

  constructor(
    private readonly logger: DoguLogger,
    private readonly record: DeviceJobRecordingService,
    private readonly consoleClientService: ConsoleClientService,
  ) {}

  @OnEvent(OnHostDisconnectedEvent.key)
  onHostDisconnected(value: Instance<typeof OnHostDisconnectedEvent.value>): void {
    this.findWindowsWebSockets.forEach((webSockets) => {
      for (const webSocket of webSockets) {
        closeWebSocketWithTruncateReason(webSocket, 1001, 'Host disconnected');
      }
    });
    this.recordWebSockets.forEach((webSocket) => {
      closeWebSocketWithTruncateReason(webSocket, 1001, 'Host disconnected');
    });
    this.deviceJobInfos.clear();
    this.findWindowsWebSockets.clear();
    this.recordWebSockets.clear();
    this.hostResolutionInfo = null;
  }

  @OnEvent(OnHostResolvedEvent.key)
  onHostResolved(value: Instance<typeof OnHostResolvedEvent.value>): void {
    this.hostResolutionInfo = value;
  }

  @OnEvent(OnDeviceJobStartedEvent.key)
  onDeviceJobStarted(value: Instance<typeof OnDeviceJobStartedEvent.value>): void {
    if (!this.hostResolutionInfo) {
      throw new Error('onDeviceJobStarted: hostResolutionInfo not found');
    }
    const { executorOrganizationId, routineDeviceJobId, platform, record, browserName, recordDeviceRunnerPath } = value;

    if (!browserName) {
      this.logger.info(`startRecording: DeviceJobRecordingWindowProcessRegistry doesn't handle when browserName is null`, { routineDeviceJobId, browserName });
      return;
    }
    const key = this.createKey(executorOrganizationId, routineDeviceJobId);

    this.quitSafari(browserName, executorOrganizationId, routineDeviceJobId);

    this.deviceJobInfos.set(key, { browserName, platform, recordDeviceRunnerPath, record: !!record });
  }

  @OnEvent(OnStepProcessStartedEvent.key)
  OnStepProcessStarted(value: Instance<typeof OnStepProcessStartedEvent.value>): void {
    if (!this.hostResolutionInfo) {
      throw new Error('OnStepProcessStarted: hostResolutionInfo not found');
    }

    const { executorOrganizationId, routineDeviceJobId, serial, pid } = value;
    const key = this.createKey(executorOrganizationId, routineDeviceJobId);

    if (!pid) {
      this.logger.warn('OnStepProcessStarted: pid is null', { executorOrganizationId, routineDeviceJobId });
      return;
    }
    const deviceJobInfo = this.deviceJobInfos.get(key);
    if (!deviceJobInfo) {
      this.logger.warn('OnStepProcessStarted: deviceJobInfo not found', { executorOrganizationId, routineDeviceJobId });
      return;
    }

    const findWindowWebSockets = this.findWindowsWebSockets.get(key);
    if (findWindowWebSockets) {
      for (const findWindowWebSocket of findWindowWebSockets) {
        closeWebSocketWithTruncateReason(findWindowWebSocket, 1000, 'Next step started');
      }
    }

    const newFindWindowsWebSocket = this.record.connectFindWindowsWs(
      { serial, parentPid: pid, isSafari: deviceJobInfo.browserName === 'safari' },
      {
        onMessage: (result) => {
          closeWebSocketWithTruncateReason(newFindWindowsWebSocket, 1000, 'Find device windows done');
          const window: WindowInfo = { pid: result.pid };
          this.updateDeviceJobWindow(executorOrganizationId, routineDeviceJobId, window).catch((error) => {
            this.logger.error('Failed to update deviceJob window', { error: errorify(error) });
          });
          if (!deviceJobInfo.record) {
            return;
          }

          const fileName = toISOStringWithTimezone(new Date(), '-');
          const filePath = path.resolve(deviceJobInfo.recordDeviceRunnerPath, `${fileName}${getRecordExt(deviceJobInfo.platform)}`);
          const recordWebSocket = this.record.connectAndUploadRecordWs({ ...value, pid: result.pid }, filePath, {
            onClose: () => {
              this.recordWebSockets.delete(key);
            },
          });
          this.recordWebSockets.set(key, recordWebSocket);
        },
        onClose: () => {
          const findWindowWebSockets = this.findWindowsWebSockets.get(key);
          if (!findWindowWebSockets) {
            return;
          }
          this.findWindowsWebSockets.set(
            key,
            findWindowWebSockets.filter((webSocket) => webSocket !== newFindWindowsWebSocket),
          );
        },
      },
    );

    this.findWindowsWebSockets.set(key, [newFindWindowsWebSocket]);
  }

  @OnEvent(OnDeviceJobCancelRequestedEvent.key)
  onDeviceJobCancelRequested(value: Instance<typeof OnDeviceJobCancelRequestedEvent.value>): void {
    const { executorOrganizationId, routineDeviceJobId } = value;
    this.closeKey('onDeviceJobCancelRequested', executorOrganizationId, routineDeviceJobId);
  }

  @OnEvent(OnDeviceJobPostProcessCompletedEvent.key)
  onDeviceJobPostProcessCompleted(value: Instance<typeof OnDeviceJobPostProcessCompletedEvent.value>): void {
    const { executorOrganizationId, routineDeviceJobId } = value;
    this.closeKey('onDeviceJobCompleted', executorOrganizationId, routineDeviceJobId);
  }

  private createKey(organizationId: OrganizationId, routineDeviceJobId: RoutineDeviceJobId): string {
    return `${organizationId}:${routineDeviceJobId}`;
  }

  private closeKey(comment: string, organizationId: OrganizationId, routineDeviceJobId: RoutineDeviceJobId): void {
    const key = this.createKey(organizationId, routineDeviceJobId);
    this.deviceJobInfos.delete(key);
    this.closeKeyFindWindows(comment, key);
    this.closeKeyRecording(comment, key);
  }

  private closeKeyFindWindows(comment: string, key: string): void {
    const webSockets = this.findWindowsWebSockets.get(key);
    if (!webSockets) {
      this.logger.warn(`${comment}: findWindows webSockets not found`, { key });
      return;
    }
    for (const webSocket of webSockets) {
      closeWebSocketWithTruncateReason(webSocket, 1000, 'Completed');
    }
  }

  private closeKeyRecording(comment: string, key: string): void {
    const webSocket = this.recordWebSockets.get(key);
    if (!webSocket) {
      this.logger.warn(`${comment}: recording webSocket not found`, { key });
      return;
    }
    closeWebSocketWithTruncateReason(webSocket, 1000, 'Completed');
  }

  private quitSafari(browserName: string, organizationId: string, routineDeviceJobId: number): void {
    if (browserName === 'safari' && process.platform === 'darwin') {
      this.logger.info('startRecording: kill Safari', { organizationId, routineDeviceJobId });
      ChildProcess.exec(`osascript -e 'quit app "Safari"'`, {}).catch((e) => {
        const error = errorify(e);
        this.logger.error('Failed to kill Safari', { error });
      });
    }
  }

  @Retry({ printable: logger })
  private async updateDeviceJobWindow(organizationId: OrganizationId, routineDeviceJobId: RoutineDeviceJobId, windowInfo: WindowInfo): Promise<void> {
    const pathProvider = new PrivateDeviceJob.updateDeviceJobWindow.pathProvider(organizationId, routineDeviceJobId);
    const path = PrivateDeviceJob.updateDeviceJobWindow.resolvePath(pathProvider);
    const requestBody: Instance<typeof PrivateDeviceJob.updateDeviceJobWindow.requestBody> = {
      windowProcessId: windowInfo.pid,
    };
    await this.consoleClientService.client
      .patch(path, requestBody, {
        ...createConsoleApiAuthHeader(env.DOGU_HOST_TOKEN),
        timeout: DefaultHttpOptions.request.timeout,
      })
      .catch((error) => {
        this.logger.error('Failed to update deviceJob window', {
          organizationId,
          routineDeviceJobId,
          requestBody,
          error: errorify(error),
        });
        throw error;
      });
    this.logger.verbose('DeviceJob window updated', { organizationId, routineDeviceJobId, requestBody });
  }
}

function getRecordExt(platform: Platform): string {
  if (platform === Platform.PLATFORM_IOS) {
    return '.mp4';
  }
  return '.webm';
}
