import { ipcMain, nativeTheme } from 'electron';
import { themeClientKey } from '../../src/shares/theme';
export class ThemeService {
  static instance: ThemeService;
  private constructor() {
    nativeTheme.themeSource = 'system';
    ipcMain.handle(themeClientKey.shouldUseDarkColors, () => nativeTheme.shouldUseDarkColors);
  }

  static open(): void {
    ThemeService.instance = new ThemeService();
  }
}
