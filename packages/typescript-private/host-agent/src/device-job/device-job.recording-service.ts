import { PrivateDeviceJob } from '@dogu-private/console-host-agent';
import { createConsoleApiAuthHeader, DeviceId, OrganizationId, RoutineDeviceJobId, Serial } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, DefaultHttpOptions, errorify, Instance, loop } from '@dogu-tech/common';
import { DeviceFindWindows, DeviceRecording } from '@dogu-tech/device-client';
import { Injectable } from '@nestjs/common';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';
import { ConsoleClientService } from '../console-client/console-client.service';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';

export interface DeviceJobRecordParam {
  organizationId: OrganizationId;
  deviceId: DeviceId;
  routineDeviceJobId: RoutineDeviceJobId;
  serial: Serial;
  pid?: number;
}

@Injectable()
export class DeviceJobRecordingService {
  constructor(private readonly logger: DoguLogger, private readonly consoleClientService: ConsoleClientService) {}

  connectAndUploadRecordWs(value: DeviceJobRecordParam, filePath: string, listener: { onClose: (ws: WebSocket) => void }): WebSocket {
    const { organizationId, deviceId, routineDeviceJobId, serial, pid } = value;
    const webSocket = new WebSocket(`ws://${env.DOGU_DEVICE_SERVER_HOST_PORT}${DeviceRecording.path}`);
    webSocket.addEventListener('open', () => {
      this.logger.info('startRecording open', {
        filePath,
      });
      const sendMessage: Instance<typeof DeviceRecording.sendMessage> = {
        serial,
        screenRecordOption: {
          screen: { pid },
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
      listener.onClose(webSocket);
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

          uploadDeviceRecording(this.consoleClientService, organizationId, deviceId, routineDeviceJobId, filePath).catch((error) => {
            this.logger.error('uploadDeviceRecording failed', { error: errorify(error) });
          });
        } catch (error) {
          this.logger.error('uploadDeviceRecording failed', { error: errorify(error) });
        }
      })().catch((error) => {
        this.logger.error('uploadDeviceRecording failed', { error: errorify(error) });
      });
    });
    webSocket.addEventListener('message', (ev) => {
      const { data } = ev;
      this.logger.info('startRecording message', { data });
    });
    return webSocket;
  }

  connectFindWindowsWs(
    param: Instance<typeof DeviceFindWindows.sendMessage>,
    listener: { onMessage: (result: Instance<typeof DeviceFindWindows.receiveMessage>) => void; onClose: (ws: WebSocket) => void },
  ): WebSocket {
    const webSocket = new WebSocket(`ws://${env.DOGU_DEVICE_SERVER_HOST_PORT}${DeviceFindWindows.path}`);
    webSocket.addEventListener('open', () => {
      this.logger.info('connectFindWindowsWs open', {
        param,
      });

      webSocket.send(JSON.stringify(param), (error) => {
        if (error) {
          closeWebSocketWithTruncateReason(webSocket, 1001, 'Failed to find device windows');
          this.logger.error('connectFindWindowsWs failed to send message', { error });
        } else {
          this.logger.info('connectFindWindowsWs sent message');
        }
      });
    });
    webSocket.addEventListener('error', (ev) => {
      this.logger.error('connectFindWindowsWs error', { error: errorify(ev.error) });
    });
    webSocket.addEventListener('close', (ev) => {
      listener.onClose(webSocket);
    });
    webSocket.addEventListener('message', (ev) => {
      const { data } = ev;
      this.logger.info('startRecording message', { data });
      const result = JSON.parse(data.toString('utf-8')) as Instance<typeof DeviceFindWindows.receiveMessage>;
      listener.onMessage(result);
    });
    return webSocket;
  }
}

async function uploadDeviceRecording(
  consoleClientService: ConsoleClientService,
  organizationId: OrganizationId,
  deviceId: DeviceId,
  routineDeviceJobId: RoutineDeviceJobId,
  filePath: string,
): Promise<void> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const buffer = await fs.promises.readFile(filePath);
  const fileName = path.basename(filePath);
  const form = new FormData();
  form.append('record', buffer, fileName);
  const pathProvider = new PrivateDeviceJob.uploadDeviceJobRecord.pathProvider(organizationId, deviceId, routineDeviceJobId);
  const urlPath = PrivateDeviceJob.uploadDeviceJobRecord.resolvePath(pathProvider);
  await consoleClientService.client.post(urlPath, form, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: createConsoleApiAuthHeader(env.DOGU_HOST_TOKEN).headers.Authorization,
    },
    timeout: DefaultHttpOptions.request.timeout1minutes,
  });
}
