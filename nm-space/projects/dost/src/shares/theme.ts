import { instanceKeys } from './electron-ipc';

export const themeClientKey = instanceKeys<IThemeClient>('themeClient');

export interface IThemeClient {
  shouldUseDarkColors: () => Promise<boolean>;
}
