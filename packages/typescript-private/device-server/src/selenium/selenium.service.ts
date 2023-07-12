import { errorify, PrefixLogger } from '@dogu-tech/common';
import { newCleanNodeEnv } from '@dogu-tech/node';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import AsyncLock from 'async-lock';
import _ from 'lodash';
import path from 'path';
import { setInterval } from 'timers/promises';
import { DoguLogger } from '../logger/logger';
import { pathMap } from '../path-map';
import { createSeleniumContextKey, DefaultSeleniumContextOptions, SeleniumContext, SeleniumContextInfo, SeleniumContextOptions } from './selenium.context';

const LockKey = 'SeleniumService.map';
const GarbageCollectionInterval = 60 * 1000;
const GarbageCollectionAccessTimeout = 5 * 60 * 1000;

interface SeleniumContextEntry {
  context: SeleniumContext;
  lastAccessedAt: Date;
}

@Injectable()
export class SeleniumService implements OnModuleInit, OnModuleDestroy {
  private _defaultSeleniumContextOptions: DefaultSeleniumContextOptions | null = null;
  get defaultSeleniumContextOptions(): Readonly<DefaultSeleniumContextOptions> {
    if (!this._defaultSeleniumContextOptions) {
      throw new Error('Selenium context options is not initialized');
    }
    return this._defaultSeleniumContextOptions;
  }

  private logger: PrefixLogger;
  private map = new Map<string, SeleniumContextEntry>();
  private lock = new AsyncLock();
  private stopGarbageCollection = false;

  constructor(logger: DoguLogger) {
    this.logger = new PrefixLogger(logger, '[SeleniumService]');
  }

  onModuleInit(): void {
    this.createDefaultSeleniumContextOptions();
    this.startGarbageCollection();
  }

  async onModuleDestroy(): Promise<void> {
    this.stopGarbageCollection = true;
    const entries = await this.lock.acquire(LockKey, () => {
      const entries = Array.from(this.map.values());
      this.map.clear();
      return entries;
    });
    await Promise.all(entries.map((entry) => entry.context.close()));
  }

  async get(options: SeleniumContextOptions): Promise<SeleniumContextInfo> {
    return this.lock.acquire(LockKey, async () => {
      const key = createSeleniumContextKey(options);
      const entry = this.map.get(key);
      if (entry) {
        entry.lastAccessedAt = new Date();
        return entry.context.info;
      }
      const newContext = new SeleniumContext(options, this.logger);
      await newContext.open();
      this.map.set(key, {
        context: newContext,
        lastAccessedAt: new Date(),
      });
      return newContext.info;
    });
  }

  private createDefaultSeleniumContextOptions(): void {
    const pnpmPath = pathMap().common.pnpm;
    const cleanEnv = newCleanNodeEnv();
    const serverEnv = _.merge(cleanEnv, {
      PATH: `${pathMap().common.nodeBin}${path.delimiter}${cleanEnv.PATH ?? ''}`,
    });
    this._defaultSeleniumContextOptions = {
      pnpmPath,
      serverEnv,
    };
    this.logger.verbose('Default selenium context options created', {
      defaultSeleniumContextOptions: this._defaultSeleniumContextOptions,
    });
  }

  private startGarbageCollection(): void {
    (async (): Promise<void> => {
      for await (const _ of setInterval(GarbageCollectionInterval)) {
        if (this.stopGarbageCollection) {
          return;
        }
        await this.collectGarbage();
      }
    })().catch((error) => {
      this.logger.error('Failed to start garbage collection', { error: errorify(error) });
    });
  }

  private collectGarbage(): Promise<void> {
    return this.lock.acquire(LockKey, () => {
      const now = new Date();
      for (const [key, entry] of this.map.entries()) {
        if (now.getTime() - entry.lastAccessedAt.getTime() > GarbageCollectionAccessTimeout) {
          this.map.delete(key);
          entry.context.close().catch((error) => {
            this.logger.error('Failed to close selenium context', { error: errorify(error) });
          });
        }
      }
    });
  }
}
