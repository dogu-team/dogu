import { Status } from '@dogu-private/dost-children';
import { Instance, ProcessInfo } from '@dogu-tech/common';
import { IpcRendererEvent } from 'electron';
import { instanceKeys } from './electron-ipc';

export const hostAgentKey = 'host-agent' as const;
export const deviceServerKey = 'device-server' as const;

export const keys = [hostAgentKey, deviceServerKey] as const;
export type Key = (typeof keys)[number];

export type HostAgentConnectionStatus = Instance<typeof Status.getConnectionStatus.responseBody>;

export const childClientKey = instanceKeys<IChildClient>('childClient');

export interface ChildTree {
  childs: ProcessInfo[];
}

export interface IChildClient {
  isActive: (key: Key) => Promise<boolean>;
  connect: (token: string) => Promise<HostAgentConnectionStatus>;
  getHostAgentConnectionStatus: () => Promise<HostAgentConnectionStatus>;
  getChildTree: () => Promise<ChildTree>;
}

export const childCallbackKey = instanceKeys<IChildCallback>('childCallback');
export interface IChildCallback {
  onSpawn: (callback: (event: IpcRendererEvent, key: Key) => void) => void;
  onError: (callback: (event: IpcRendererEvent, key: Key, error: Error) => void) => void;
  onClose: (callback: (event: IpcRendererEvent, key: Key, exitCode?: number, signal?: string) => void) => void;
}
