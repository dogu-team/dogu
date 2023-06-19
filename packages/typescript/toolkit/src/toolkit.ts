import { AsyncClosable, errorify } from '@dogu-tech/common';
import { DeviceClient, DeviceHostClient } from '@dogu-tech/device-client';
import { Logger } from '@dogu-tech/node';
import { GamiumClient } from 'gamium';
import { GamiumContext } from './internal/gamium-context';
import { FilledToolkitOptions } from './options';

export class Toolkit implements AsyncClosable {
  private closeRequested = false;

  constructor(
    readonly logger: Logger,
    readonly filledOptions: FilledToolkitOptions,
    readonly device: DeviceClient,
    readonly deviceHost: DeviceHostClient,
    readonly _gamium: GamiumContext | null,
    readonly _appium: WebdriverIO.Browser | null,
  ) {
    process.on('exit', () => {
      this.close().catch((error) => {
        this.logger.error('Failed to close toolkit', { error: errorify(error) });
      });
    });
  }

  async close(): Promise<void> {
    if (this.closeRequested) {
      return;
    }
    this.closeRequested = true;
    this.logger.info('Closing Toolkit instance');
    await this._gamium?.close().catch((error) => {
      this.logger.error('Failed to close gamium context', { error: errorify(error) });
    });
    await this._appium?.deleteSession().catch((error) => {
      this.logger.error('Failed to close appium session', { error: errorify(error) });
    });
  }

  get gamium(): GamiumClient {
    if (!this._gamium) {
      throw new Error('Gamium is not enabled');
    }
    return this._gamium.client;
  }

  get appium(): WebdriverIO.Browser {
    if (!this._appium) {
      throw new Error('Appium is not enabled');
    }
    return this._appium;
  }
}
