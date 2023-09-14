import { BrowserName, DeviceId, OrganizationId, RoutineDeviceJobId, Serial } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, Instance } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import WebSocket from 'ws';
import { ConsoleClientService } from '../console-client/console-client.service';
import { OnHostDisconnectedEvent, OnHostResolvedEvent } from '../host/host.events';
import { DoguLogger } from '../logger/logger';
import { HostResolutionInfo } from '../types';

interface DeviceRecordingWindowInfo {
  webSocket: WebSocket;
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
  private readonly webSockets = new Map<string, DeviceRecordingWindowInfo>();

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
}
