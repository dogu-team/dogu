import { PrivateDeviceJob } from '@dogu-private/console-host-agent';
import { BrowserName, createConsoleApiAuthHeader, DeviceId, OrganizationId, Platform, RoutineDeviceJobId, Serial } from '@dogu-private/types';
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

interface RecordInfo {
  filePath: string;
}

interface DeviceJobInfo {
  webSocket: WebSocket | null;

  organizationId: OrganizationId;
  deviceId: DeviceId;
  routineDeviceJobId: RoutineDeviceJobId;
  serial: Serial;

  browserName: BrowserName;
  record: RecordInfo | null;
}

@Injectable()
export class DeviceJobWindowsProcessRegistry {
  private hostResolutionInfo: HostResolutionInfo | null = null;
  private readonly webSockets = new Map<string, DeviceJobInfo>();

  constructor(private readonly logger: DoguLogger, private readonly record: DeviceJobRecordingService, private readonly consoleClientService: ConsoleClientService) {}

  @OnEvent(OnHostDisconnectedEvent.key)
  onHostDisconnected(value: Instance<typeof OnHostDisconnectedEvent.value>): void {
    this.webSockets.forEach((info, serial) => {
      const { webSocket } = info;
      if (!webSocket) {
        return;
      }
      closeWebSocketWithTruncateReason(webSocket, 1001, 'Host disconnected');
    });
    this.webSockets.clear();
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
    const { organizationId, deviceId, routineDeviceJobId, serial, platform, record, browserName, recordDeviceRunnerPath } = value;

    if (!browserName) {
      this.logger.info(`startRecording: DeviceJobRecordingWindowProcessRegistry doesn't handle when browserName is null`, { routineDeviceJobId, browserName });
      return;
    }
    const key = this.createKey(organizationId, deviceId, routineDeviceJobId);
    const fileName = toISOStringWithTimezone(new Date(), '-');
    const filePath = path.resolve(recordDeviceRunnerPath, `${fileName}${getRecordExt(platform)}`);

    this.quitSafari(browserName, organizationId, deviceId, routineDeviceJobId);

    this.webSockets.set(key, { webSocket: null, serial, organizationId, deviceId, routineDeviceJobId, browserName, record: record ? { filePath } : null });
  }

  @OnEvent(OnStepProcessStartedEvent.key)
  OnStepProcessStarted(value: Instance<typeof OnStepProcessStartedEvent.value>): void {
    if (!this.hostResolutionInfo) {
      throw new Error('OnStepProcessStarted: hostResolutionInfo not found');
    }

    const { organizationId, deviceId, routineDeviceJobId, serial, pid } = value;
    const key = this.createKey(organizationId, deviceId, routineDeviceJobId);
    const deviceJobInfo = this.webSockets.get(key);
    if (!deviceJobInfo) {
      this.logger.warn('OnStepProcessStarted: deviceJobInfo not found', { organizationId, deviceId, routineDeviceJobId });
      return;
    }
    if (!pid) {
      this.logger.warn('OnStepProcessStarted: pid is null', { organizationId, deviceId, routineDeviceJobId });
      return;
    }
    if (deviceJobInfo.webSocket) {
      closeWebSocketWithTruncateReason(deviceJobInfo.webSocket, 1000, 'Next step started');
    }

    const findWindowsSocket = this.record.connectFindWindowsWs({ serial, parentPid: pid, isSafari: deviceJobInfo.browserName === 'safari' }, (result) => {
      closeWebSocketWithTruncateReason(findWindowsSocket, 1000, 'Find device windows done');
      const window: WindowInfo = { pid: result.pid };
      if (deviceJobInfo.record) {
        const recordWebSocket = this.record.connectAndUploadRecordWs({ ...value, pid: result.pid }, deviceJobInfo.record.filePath, (_) => {
          this.webSockets.delete(key);
        });
        this.webSockets.set(key, { ...deviceJobInfo, webSocket: recordWebSocket });
      } else {
        this.webSockets.set(key, { ...deviceJobInfo, webSocket: null });
      }
      this.updateDeviceJobWindow(organizationId, deviceId, routineDeviceJobId, window).catch((error) => {
        this.logger.error('Failed to update deviceJob window', { error: errorify(error) });
      });
    });

    this.webSockets.set(key, { ...deviceJobInfo, webSocket: findWindowsSocket });
  }

  @OnEvent(OnDeviceJobCancelRequestedEvent.key)
  onDeviceJobCancelRequested(value: Instance<typeof OnDeviceJobCancelRequestedEvent.value>): void {
    const { organizationId, deviceId, routineDeviceJobId } = value;
    this.closeKey('onDeviceJobCancelRequested', organizationId, deviceId, routineDeviceJobId);
  }

  @OnEvent(OnDeviceJobPostProcessCompletedEvent.key)
  onDeviceJobPostProcessCompleted(value: Instance<typeof OnDeviceJobPostProcessCompletedEvent.value>): void {
    const { organizationId, deviceId, routineDeviceJobId } = value;
    this.closeKey('onDeviceJobCompleted', organizationId, deviceId, routineDeviceJobId);
  }

  private createKey(organizationId: OrganizationId, deviceId: DeviceId, routineDeviceJobId: RoutineDeviceJobId): string {
    return `${organizationId}:${deviceId}:${routineDeviceJobId}`;
  }

  private closeKey(comment: string, organizationId: OrganizationId, deviceId: DeviceId, routineDeviceJobId: RoutineDeviceJobId): void {
    const key = this.createKey(organizationId, deviceId, routineDeviceJobId);
    const deviceJobInfo = this.webSockets.get(key);
    if (!deviceJobInfo) {
      this.logger.warn(`${comment}: deviceJobInfo not found`, { organizationId, deviceId, routineDeviceJobId });
      return;
    }
    const { webSocket } = deviceJobInfo;
    if (!webSocket) {
      this.logger.warn(`${comment}: webSocket is null`, { organizationId, deviceId, routineDeviceJobId });
      return;
    }
    closeWebSocketWithTruncateReason(webSocket, 1000, 'Completed');
    this.webSockets.delete(key);
  }

  private quitSafari(browserName: string, organizationId: string, deviceId: string, routineDeviceJobId: number): void {
    if (browserName === 'safari' && process.platform === 'darwin') {
      this.logger.info('startRecording: kill Safari', { organizationId, deviceId, routineDeviceJobId });
      ChildProcess.exec(`osascript -e 'quit app "Safari"'`, {}, this.logger).catch((e) => {
        const error = errorify(e);
        this.logger.error('Failed to kill Safari', { error });
      });
    }
  }

  @Retry({ printable: logger })
  private async updateDeviceJobWindow(organizationId: OrganizationId, deviceId: DeviceId, routineDeviceJobId: RoutineDeviceJobId, windowInfo: WindowInfo): Promise<void> {
    const pathProvider = new PrivateDeviceJob.updateDeviceJobWindow.pathProvider(organizationId, deviceId, routineDeviceJobId);
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
          deviceId,
          routineDeviceJobId,
          requestBody,
          error: errorify(error),
        });
        throw error;
      });
    this.logger.verbose('DeviceJob window updated', { organizationId, deviceId, routineDeviceJobId, requestBody });
  }
}

function getRecordExt(platform: Platform): string {
  if (platform === Platform.PLATFORM_IOS) {
    return '.mp4';
  }
  return '.webm';
}
