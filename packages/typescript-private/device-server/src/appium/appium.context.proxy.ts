/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Platform } from '@dogu-private/types';
import { Class, Instance, loopTime, Milisecond, Printable, usingAsnyc } from '@dogu-tech/common';
import { Android, AppiumContextInfo, ContextPageSource, ScreenSize } from '@dogu-tech/device-client-common';
import { Logger } from '@dogu-tech/node';
import AsyncLock from 'async-lock';
import { Zombieable, ZombieProps, ZombieQueriable } from '../internal/services/zombie/zombie-component';
import { ZombieServiceInstance } from '../internal/services/zombie/zombie-service';
import { createAppiumLogger } from '../logger/logger.instance';
import { AppiumContext, AppiumContextImpl, AppiumContextKey, AppiumContextOptions, AppiumOpeningState, NullAppiumContext, WDIOBrowser, WDIOElement } from './appium.context';
import { AppiumRemoteContext } from './appium.remote.context';

const constructorMap = {
  builtin: AppiumContextImpl,
  remote: AppiumRemoteContext,
  null: NullAppiumContext,
};

export class AppiumRemoteContextRental {
  constructor(
    public context: AppiumRemoteContext,
    private onRelease: () => Promise<void>,
  ) {}

  async release(): Promise<void> {
    await this.onRelease();
  }
}

export class AppiumContextProxy implements AppiumContext, Zombieable {
  private readonly logger: Logger;
  private impl: AppiumContext;
  private implZombie: ZombieQueriable;
  private nullContext: NullAppiumContext;
  private contextLock = new AsyncLock();
  private rental: AppiumRemoteContextRental | null = null;

  constructor(public readonly options: AppiumContextOptions) {
    this.logger = createAppiumLogger(options.serial);
    this.nullContext = new NullAppiumContext(options, this.logger);

    this.impl = AppiumContextProxy.createAppiumContext(options, this.logger);
    this.implZombie = ZombieServiceInstance.addComponent(this.impl);
  }

  get name(): string {
    return 'AppiumContextProxy';
  }
  get platform(): Platform {
    return this.options.platform;
  }
  get serial(): string {
    return this.options.serial;
  }
  get printable(): Printable {
    return this.logger;
  }

  get props(): ZombieProps {
    return {};
  }

  private get implOrNull(): AppiumContext {
    if (this.implZombie.isAlive()) {
      return this.impl;
    }
    return this.nullContext;
  }

  async revive(): Promise<void> {
    await this.implZombie.waitUntilAlive();
  }

  onDie(): void {
    // noop
  }

  onComponentDeleted(): void {
    ZombieServiceInstance.deleteComponent(this.impl);
  }

  get key(): AppiumContextKey {
    return this.implOrNull.key;
  }

  get openingState(): AppiumOpeningState {
    return this.implOrNull.openingState;
  }

  getInfo(): AppiumContextInfo {
    return this.implOrNull.getInfo();
  }

  async getAndroid(): Promise<Android | undefined> {
    return this.implOrNull.getAndroid();
  }

  async getScreenSize(): Promise<ScreenSize> {
    return this.implOrNull.getScreenSize();
  }

  async switchContext(contextId: string): Promise<void> {
    return this.implOrNull.switchContext(contextId);
  }

  async getContext(): Promise<string> {
    return this.implOrNull.getContext();
  }

  async getContexts(): Promise<string[]> {
    return this.implOrNull.getContexts();
  }

  async getPageSource(): Promise<string> {
    return this.implOrNull.getPageSource();
  }

  async switchContextAndGetPageSource(contextId: string): Promise<string> {
    return this.implOrNull.switchContextAndGetPageSource(contextId);
  }

  async getContextPageSources(): Promise<ContextPageSource[]> {
    return this.implOrNull.getContextPageSources();
  }

  async rentRemote(reason: string): Promise<AppiumRemoteContextRental> {
    if (this.rental) {
      throw new Error('AppiumContextProxy.rentRemote failed. Already rented');
    }
    await this.switchAppiumContext('remote', `${reason} start`);
    const remoteContext = this.getImpl(AppiumRemoteContext);
    return new AppiumRemoteContextRental(remoteContext, async () => {
      await this.switchAppiumContext('builtin', `${reason} done`);
    });
  }

  async waitUntilBuiltin(): Promise<AppiumContextImpl> {
    for await (const _ of loopTime(Milisecond.t1Second, Milisecond.t5Minutes)) {
      if (this.impl.key === 'builtin') {
        return this.getImpl(AppiumContextImpl);
      }
    }
    throw new Error('AppiumContextProxy.waitUntilBuiltin failed. Timeout');
  }

  private async switchAppiumContext(key: AppiumContextKey, reason: string): Promise<void> {
    await this.contextLock.acquire('switchAppiumContext', async () => {
      if (key === this.impl.key) {
        return;
      }
      const random = Math.random();
      const befImplKey = this.impl.key;

      await usingAsnyc(
        {
          create: async () => {
            this.logger.info(`switching appium context start`, { bef: befImplKey, after: key, reason, random });
            await Promise.resolve();
          },
          dispose: async () => {
            this.logger.info(`switching appium context done`, { bef: befImplKey, after: key, reason, random });
            await Promise.resolve();
          },
        },
        async () => {
          ZombieServiceInstance.deleteAllComponentsIfExist((zombieable) => {
            if (zombieable.serial !== this.options.serial) {
              return false;
            }
            if (zombieable instanceof AppiumContextImpl || zombieable instanceof AppiumRemoteContext) {
              return true;
            }
            return false;
          }, 'switching appium context');

          const appiumContext = AppiumContextProxy.createAppiumContext({ ...this.options, key: key }, this.logger);
          const awaiter = ZombieServiceInstance.addComponent(appiumContext);
          await awaiter.waitUntilAlive();
          this.impl = appiumContext;
          this.implZombie = awaiter;
        },
      );
    });
  }

  async select(selector: string): Promise<WDIOElement | undefined> {
    return this.implOrNull.select(selector);
  }
  driver(): WDIOBrowser | undefined {
    return this.implOrNull.driver();
  }

  private getImpl<T extends Class<T>>(constructor: T): Instance<T> {
    if (!(this.impl instanceof constructor)) {
      throw new Error(`AppiumContextImpl is not instance of ${constructor.name}`);
    }
    return this.impl as Instance<T>;
  }

  private static createAppiumContext(options: AppiumContextOptions, logger: Logger): AppiumContext {
    if (options.key === 'null') {
      throw new Error('AppiumContextProxy.createAppiumContext failed. options.key is null');
    }
    const constructor = constructorMap[options.key];
    return new constructor(options, logger);
  }
}
