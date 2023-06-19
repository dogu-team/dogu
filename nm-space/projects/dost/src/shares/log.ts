import { Printable } from '@dogu-tech/common';
import { IpcRendererEvent } from 'electron';
import { instanceKeys } from './electron-ipc';

export const rendererLoggerKey = instanceKeys<ILogger>('rendererLogger');

export type ILogger = Required<Printable>;

export const stdLogCallbackKey = instanceKeys<IStdLogCallback>('stdLogCallback');
export interface IStdLogCallback {
  onStdout: (callback: (event: IpcRendererEvent, message: string) => void) => void;
  onStderr: (callback: (event: IpcRendererEvent, message: string) => void) => void;
}
