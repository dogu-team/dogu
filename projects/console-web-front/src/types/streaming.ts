import { ObjectInfo } from 'gamium/common';

export enum StreamingErrorType {
  HA_DISCONNECT,
  WS_DISCONNECT,
  RTC_DISCONNECT,
  DEVICE_ERROR,
  RTC_FAILED,
  CONNECTION_REFUSED,
}

export class StreamingError {
  constructor(type: StreamingErrorType, reason: string) {
    this.type = type;
    this.reason = reason;
  }

  type: StreamingErrorType;
  reason: string;
}

export type ResizedObjectInfo = {
  width: number;
  height: number;
  x: number;
  y: number;
  origin: ObjectInfo;
};

export enum StreamingTabMenuKey {
  INFO = 'info',
  PROFILE = 'profile',
  INSPECTOR = 'inspector',
  INSTALL = 'install',
  LOGS = 'logs',
}

export enum InspectorType {
  APP = 'app',
  GAME = 'game',
}

export enum StreamingHotKey {
  INSPECTOR_RELOAD = 'inspector_reload',
  INSPECTOR_SELECT = 'inspector_select',
}
