import { instanceKeys } from './electron-ipc';

export const updaterClientKey = instanceKeys<IUpdaterClient>('updaterClient');

export interface UpdateCheckResult {
  lastestVersion: string;
  error: string;
}

export interface InstallUpdateResult {
  error: string;
}

export interface IUpdaterClient {
  getAppVersion: () => Promise<string>;
  checkForUpdates: () => Promise<UpdateCheckResult>;
  downloadAndInstallUpdate: () => Promise<InstallUpdateResult>;
}
