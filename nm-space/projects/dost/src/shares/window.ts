import { instanceKeys } from './electron-ipc';

export const windowClientKey = instanceKeys<IWindowClient>('windowClient');

export interface IWindowClient {
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  unmaximize: () => Promise<void>;
  onMaximize: (callback: () => void) => void;
  onUnmaximize: (callback: () => void) => void;
  close: () => Promise<void>;
}
