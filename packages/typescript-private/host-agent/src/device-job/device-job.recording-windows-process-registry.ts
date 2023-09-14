import { BrowserName, DeviceId, OrganizationId, Platform, RoutineDeviceJobId, Serial } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, Instance, toISOStringWithTimezone } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import path from 'path';
import WebSocket from 'ws';
import { OnDeviceJobCancelRequestedEvent, OnDeviceJobPostProcessCompletedEvent, OnDeviceJobStartedEvent } from '../device-job/device-job.events';
import { OnHostDisconnectedEvent, OnHostResolvedEvent } from '../host/host.events';
import { DoguLogger } from '../logger/logger';
import { OnStepProcessStartedEvent } from '../step/step.events';
import { HostResolutionInfo } from '../types';
import { DeviceJobRecordingService } from './device-job.recording-service';

interface DeviceRecordingInfo {
  webSocket: WebSocket | null;
  organizationId: OrganizationId;
  deviceId: DeviceId;
  routineDeviceJobId: RoutineDeviceJobId;
  serial: Serial;
  browserName?: BrowserName;
  filePath: string;
}

@Injectable()
export class DeviceJobRecordingWindowProcessRegistry {
  private hostResolutionInfo: HostResolutionInfo | null = null;
  private readonly webSockets = new Map<string, DeviceRecordingInfo>();

  constructor(private readonly logger: DoguLogger, private readonly record: DeviceJobRecordingService) {}

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
    if (!record) {
      this.logger.info('startRecording: record is false', { organizationId, deviceId, routineDeviceJobId });
      return;
    }

    if (!browserName) {
      this.logger.info(`startRecording: DeviceJobRecordingWindowProcessRegistry doesn't handle when browserName is null`, { routineDeviceJobId, browserName });
      return;
    }
    const key = this.createKey(organizationId, deviceId, routineDeviceJobId);
    const fileName = toISOStringWithTimezone(new Date(), '-');
    const filePath = path.resolve(recordDeviceRunnerPath, `${fileName}${getRecordExt(platform)}`);

    this.webSockets.set(key, { webSocket: null, serial, organizationId, deviceId, routineDeviceJobId, browserName, filePath });
  }

  @OnEvent(OnStepProcessStartedEvent.key)
  OnStepProcessStarted(value: Instance<typeof OnStepProcessStartedEvent.value>): void {
    if (!this.hostResolutionInfo) {
      throw new Error('OnStepProcessStarted: hostResolutionInfo not found');
    }

    const { organizationId, deviceId, routineDeviceJobId, serial, pid } = value;
    const key = this.createKey(organizationId, deviceId, routineDeviceJobId);
    const deviceRecordingInfo = this.webSockets.get(key);
    if (!deviceRecordingInfo) {
      this.logger.warn('OnStepProcessStarted: deviceRecordingInfo not found', { organizationId, deviceId, routineDeviceJobId });
      return;
    }
    if (!pid) {
      this.logger.warn('OnStepProcessStarted: pid is null', { organizationId, deviceId, routineDeviceJobId });
      return;
    }
    if (deviceRecordingInfo.webSocket) {
      closeWebSocketWithTruncateReason(deviceRecordingInfo.webSocket, 1000, 'Next step started');
    }

    const findWindowsSocket = this.record.connectFindWindowsWs({ serial, parentPid: pid }, (result) => {
      closeWebSocketWithTruncateReason(findWindowsSocket, 1000, 'Find device windows done');
      const recordWebSocket = this.record.connectAndUploadRecordWs({ ...value, pid: result.pid, width: result.width, height: result.height }, deviceRecordingInfo.filePath, (_) => {
        this.webSockets.delete(key);
      });
      this.webSockets.set(key, { ...deviceRecordingInfo, webSocket: recordWebSocket });
    });

    this.webSockets.set(key, { ...deviceRecordingInfo, webSocket: findWindowsSocket });
  }

  @OnEvent(OnDeviceJobCancelRequestedEvent.key)
  onDeviceJobCancelRequested(value: Instance<typeof OnDeviceJobCancelRequestedEvent.value>): void {
    const { organizationId, deviceId, routineDeviceJobId } = value;
    const key = this.createKey(organizationId, deviceId, routineDeviceJobId);
    const deviceRecordingInfo = this.webSockets.get(key);
    if (!deviceRecordingInfo) {
      this.logger.warn('onDeviceJobCancelRequested: deviceRecordingInfo not found', { organizationId, deviceId, routineDeviceJobId });
      return;
    }
    const { webSocket } = deviceRecordingInfo;
    if (!webSocket) {
      this.logger.warn('onDeviceJobCancelRequested: webSocket is null', { organizationId, deviceId, routineDeviceJobId });
      return;
    }
    if (webSocket.readyState === WebSocket.CLOSING || webSocket.readyState === WebSocket.CLOSED) {
      this.logger.warn('onDeviceJobCancelRequested: webSocket is already closing or closed', { organizationId, deviceId, routineDeviceJobId });
      return;
    }
    closeWebSocketWithTruncateReason(webSocket, 1001, 'Cancel requested');
  }

  @OnEvent(OnDeviceJobPostProcessCompletedEvent.key)
  onDeviceJobPostProcessCompleted(value: Instance<typeof OnDeviceJobPostProcessCompletedEvent.value>): void {
    const { organizationId, deviceId, routineDeviceJobId } = value;
    const key = this.createKey(organizationId, deviceId, routineDeviceJobId);
    const deviceRecordingInfo = this.webSockets.get(key);
    if (!deviceRecordingInfo) {
      this.logger.warn('onDeviceJobCompleted: deviceRecordingInfo not found', { organizationId, deviceId, routineDeviceJobId });
      return;
    }
    const { webSocket } = deviceRecordingInfo;
    if (!webSocket) {
      this.logger.warn('onDeviceJobCancelRequested: webSocket is null', { organizationId, deviceId, routineDeviceJobId });
      return;
    }
    closeWebSocketWithTruncateReason(webSocket, 1000, 'Completed');
  }

  private createKey(organizationId: OrganizationId, deviceId: DeviceId, routineDeviceJobId: RoutineDeviceJobId): string {
    return `${organizationId}:${deviceId}:${routineDeviceJobId}`;
  }
}

function getRecordExt(platform: Platform): string {
  if (platform === Platform.PLATFORM_IOS) {
    return '.mp4';
  }
  return '.webm';
}
