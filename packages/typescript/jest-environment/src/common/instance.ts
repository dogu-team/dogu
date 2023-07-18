import AsyncLock from 'async-lock';
import { Config } from './config.js';
import { CreateDriverResult, DriverFactory } from './driver.js';

export class Dogu {
  private static locker = new AsyncLock();

  private static _config: Config | null = null;
  static async config(): Promise<Config> {
    return Dogu.locker.acquire(Config.name, async () => {
      if (!Dogu._config) {
        Dogu._config = await Config.create();
      }
      return Dogu._config;
    });
  }

  private static _createDriverResult: CreateDriverResult | null = null;
  static async driver(): Promise<WebdriverIO.Browser> {
    return Dogu.locker.acquire(DriverFactory.name, async () => {
      if (!Dogu._createDriverResult) {
        Dogu._createDriverResult = await new DriverFactory().create();
      }
      return Dogu._createDriverResult.driver;
    });
  }

  static async destroy(): Promise<void> {
    await Dogu.locker.acquire(DriverFactory.name, async () => {
      if (Dogu._createDriverResult) {
        await Dogu._createDriverResult.destroy();
        Dogu._createDriverResult = null;
      }
    });
  }
}
