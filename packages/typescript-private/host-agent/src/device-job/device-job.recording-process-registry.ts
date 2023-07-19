import { PrivateDeviceJob } from '@dogu-private/console-host-agent';
import { createConsoleApiAuthHeader, DeviceId, OrganizationId, Platform, RoutineDeviceJobId, Serial } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, DefaultHttpOptions, errorify, Instance, loop, toISOStringWithTimezone } from '@dogu-tech/common';
import { DeviceRecording } from '@dogu-tech/device-client';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { lastValueFrom } from 'rxjs';
import WebSocket from 'ws';
import { ConsoleClientService } from '../console-client/console-client.service';
import { OnDeviceJobCancelRequestedEvent, OnDeviceJobPostProcessCompletedEvent, OnDeviceJobStartedEvent } from '../device-job/device-job.events';
import { env } from '../env';
import { OnHostDisconnectedEvent, OnHostResolvedEvent } from '../host/host.events';
import { DoguLogger } from '../logger/logger';
import { HostResolutionInfo } from '../types';

interface DeviceRecordingInfo {
  webSocket: WebSocket;
  organizationId: OrganizationId;
  deviceId: DeviceId;
  routineDeviceJobId: RoutineDeviceJobId;
  serial: Serial;
  filePath: string;
}

@Injectable()
export class DeviceJobRecordingProcessRegistry {
  private hostResolutionInfo: HostResolutionInfo | null = null;
  private readonly webSockets = new Map<string, DeviceRecordingInfo>();

  constructor(private readonly logger: DoguLogger, private readonly consoleClientService: ConsoleClientService) {}

  @OnEvent(OnHostDisconnectedEvent.key)
  onHostDisconnected(value: Instance<typeof OnHostDisconnectedEvent.value>): void {
    this.webSockets.forEach((info, serial) => {
      const { webSocket } = info;
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
    const { organizationId, deviceId, routineDeviceJobId, serial, platform, record, recordSerialPath } = value;
    if (!record) {
      this.logger.info('startRecording: record is false', { organizationId, deviceId, routineDeviceJobId });
      return;
    }
    const fileName = toISOStringWithTimezone(new Date(), '-');
    const filePath = path.resolve(recordSerialPath, `${fileName}${getRecordExt(platform)}`);
    const webSocket = new WebSocket(`ws://${env.DOGU_DEVICE_SERVER_HOST_PORT}${DeviceRecording.path}`);
    const key = this.createKey(organizationId, deviceId, routineDeviceJobId);
    this.webSockets.set(key, { webSocket, serial, organizationId, deviceId, routineDeviceJobId, filePath });
    webSocket.addEventListener('open', () => {
      this.logger.info('startRecording open');
      const sendMessage: Instance<typeof DeviceRecording.sendMessage> = {
        serial,
        screenRecordOption: {
          screen: {},
          filePath,
        },
      };
      webSocket.send(JSON.stringify(sendMessage), (error) => {
        if (error) {
          closeWebSocketWithTruncateReason(webSocket, 1001, 'Failed to device recording');
          this.logger.error('startRecording failed to send message', { error });
        } else {
          this.logger.info('startRecording sent message');
        }
      });
    });
    webSocket.addEventListener('error', (ev) => {
      this.logger.error('startRecording error', { error: errorify(ev.error) });
    });
    webSocket.addEventListener('close', (ev) => {
      const deviceRecordingInfo = this.webSockets.get(key);
      if (!deviceRecordingInfo) {
        this.logger.warn('startRecording close: deviceRecordingInfo not found', { organizationId, deviceId, routineDeviceJobId });
        return;
      }
      const { filePath } = deviceRecordingInfo;
      this.webSockets.delete(key);

      (async (): Promise<void> => {
        try {
          for await (const _ of loop(1000, 60)) {
            if (fs.existsSync(filePath)) {
              break;
            }
          }
          if (!fs.existsSync(filePath)) {
            throw new Error(`startRecording: file not found. ${filePath}`);
          }

          this.uploadDeviceRecording(organizationId, deviceId, routineDeviceJobId, filePath).catch((error) => {
            this.logger.error('uploadDeviceRecording failed', { error: errorify(error) });
          });
        } catch (error) {
          this.logger.error('startRecording postProcessRecord failed', { error: errorify(error) });
        }
      })().catch((error) => {
        this.logger.error('uploadDeviceRecording failed', { error: errorify(error) });
      });
    });
    webSocket.addEventListener('message', (ev) => {
      const { data } = ev;
      this.logger.info('startRecording message', { data });
    });
  }

  @OnEvent(OnDeviceJobCancelRequestedEvent.key)
  onDeviceJobCancelRequested(value: Instance<typeof OnDeviceJobCancelRequestedEvent.value>): void {
    const { organizationId, deviceId, routineDeviceJobId, record } = value;
    if (!record) {
      this.logger.info('onDeviceJobCancelRequested: record is false', { organizationId, deviceId, routineDeviceJobId });
      return;
    }
    const key = this.createKey(organizationId, deviceId, routineDeviceJobId);
    const deviceRecordingInfo = this.webSockets.get(key);
    if (!deviceRecordingInfo) {
      this.logger.warn('onDeviceJobCancelRequested: deviceRecordingInfo not found', { organizationId, deviceId, routineDeviceJobId });
      return;
    }
    const { webSocket } = deviceRecordingInfo;
    if (webSocket.readyState === WebSocket.CLOSING || webSocket.readyState === WebSocket.CLOSED) {
      this.logger.warn('onDeviceJobCancelRequested: webSocket is already closing or closed', { organizationId, deviceId, routineDeviceJobId });
      return;
    }
    closeWebSocketWithTruncateReason(webSocket, 1001, 'Cancel requested');
  }

  @OnEvent(OnDeviceJobPostProcessCompletedEvent.key)
  onDeviceJobPostProcessCompleted(value: Instance<typeof OnDeviceJobPostProcessCompletedEvent.value>): void {
    const { organizationId, deviceId, routineDeviceJobId, record } = value;
    if (!record) {
      this.logger.info('onDeviceJobCompleted: record is false', { organizationId, deviceId, routineDeviceJobId });
      return;
    }
    const key = this.createKey(organizationId, deviceId, routineDeviceJobId);
    const deviceRecordingInfo = this.webSockets.get(key);
    if (!deviceRecordingInfo) {
      this.logger.warn('onDeviceJobCompleted: deviceRecordingInfo not found', { organizationId, deviceId, routineDeviceJobId });
      return;
    }
    const { webSocket } = deviceRecordingInfo;
    closeWebSocketWithTruncateReason(webSocket, 1000, 'Completed');
  }

  private createKey(organizationId: OrganizationId, deviceId: DeviceId, routineDeviceJobId: RoutineDeviceJobId): string {
    return `${organizationId}:${deviceId}:${routineDeviceJobId}`;
  }

  private async uploadDeviceRecording(organizationId: OrganizationId, deviceId: DeviceId, routineDeviceJobId: RoutineDeviceJobId, filePath: string): Promise<void> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    const buffer = await fs.promises.readFile(filePath);
    const fileName = path.basename(filePath);
    const form = new FormData();
    form.append('record', buffer, fileName);
    const pathProvider = new PrivateDeviceJob.uploadDeviceJobRecord.pathProvider(organizationId, deviceId, routineDeviceJobId);
    const urlPath = PrivateDeviceJob.uploadDeviceJobRecord.resolvePath(pathProvider);
    await lastValueFrom(
      this.consoleClientService.service.post(urlPath, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: createConsoleApiAuthHeader(env.DOGU_HOST_TOKEN).headers.Authorization,
        },
        timeout: DefaultHttpOptions.request.timeout,
      }),
    );
  }
}

function getRecordExt(platform: Platform): string {
  if (platform === Platform.PLATFORM_IOS) {
    return '.mp4';
  }
  return '.webm';
}
