import { app, Menu, nativeImage, shell, Tray } from 'electron';
import { DoguDocsUrl } from '../../src/shares/constants';
import { ChildService } from '../child/child-service';
import { logger } from '../log/logger.instance';
import { ReactPublicLogo192Path } from '../path-map';
import { WindowService } from '../window/window-service';

export class TrayService {
  static instance: TrayService;
  private tray: Tray;
  private constructor() {
    logger.debug(ReactPublicLogo192Path);
    const icon = nativeImage.createFromPath(ReactPublicLogo192Path).resize({ width: 16, height: 16 });
    this.tray = new Tray(icon);

    app.setAboutPanelOptions({
      applicationName: 'Dost',
      copyright: '©2023 Dogu Technologies. All rights reserved.',
      iconPath: ReactPublicLogo192Path,
      credits: 'https://dogutech.io/licenses/dost',
    });

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Preferences',
        type: 'normal',
        click: () => {
          WindowService.open();
        },
      },
      { label: '-', type: 'separator' },

      {
        label: 'Dost Help',
        type: 'normal',
        click: () => {
          shell.openExternal(DoguDocsUrl);
        },
      },
      { label: '-', type: 'separator' },
      {
        label: 'About',
        type: 'normal',
        click: () => {
          app.showAboutPanel();
        },
      },
      {
        label: 'Quit',
        type: 'normal',
        click: async () => {
          WindowService.close();
          await ChildService.close();
          setTimeout(() => {
            app.quit();
          }, 100);
        },
      },
      // {
      //   label: 'License',
      //   type: 'normal',
      //   click: () => {
      //     shell.openExternal('https://dogutech.io/');
      //   },
      // },
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  static open(): void {
    TrayService.instance = new TrayService();
  }
}
