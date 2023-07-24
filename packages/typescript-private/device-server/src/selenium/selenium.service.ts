import { errorify, PrefixLogger } from '@dogu-tech/common';
import { HostPaths, newCleanNodeEnv } from '@dogu-tech/node';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import AsyncLock from 'async-lock';
import _ from 'lodash';
import path from 'path';
import { setInterval } from 'timers/promises';
import { DoguLogger } from '../logger/logger';
import { DefaultSeleniumContextOptions, SeleniumContext, SeleniumContextInfo, SeleniumContextOptions } from './selenium.context';

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

  async open(options: SeleniumContextOptions): Promise<SeleniumContextInfo> {
    const info = await this.lock.acquire(LockKey, async () => {
      const { key } = options;
      const entry = this.map.get(key);
      if (entry) {
        entry.lastAccessedAt = new Date();
        return entry.context.info;
      }
      const mergedOptions = _.merge(this.defaultSeleniumContextOptions, options);
      const newContext = new SeleniumContext(mergedOptions, this.logger);
      await newContext.open();
      this.map.set(key, {
        context: newContext,
        lastAccessedAt: new Date(),
      });
      return newContext.info;
    });
    this.logger.info('Selenium context opened', { port: info.port });
    return info;
  }

  async close(key: string): Promise<void> {
    return this.lock.acquire(LockKey, async () => {
      const entry = this.map.get(key);
      if (!entry) {
        return;
      }
      this.map.delete(key);
      await entry.context.close();
    });
  }

  async getInfo(key: string): Promise<SeleniumContextInfo | null> {
    return this.lock.acquire(LockKey, (): SeleniumContextInfo | null => {
      const entry = this.map.get(key);
      if (!entry) {
        return null;
      }
      entry.lastAccessedAt = new Date();
      return entry.context.info;
    });
  }

  async closeBySessionId(sessionId: string): Promise<void> {
    return this.lock.acquire(LockKey, async () => {
      for (const [key, entry] of this.map.entries()) {
        if (entry.context.info.sessionId === sessionId) {
          this.map.delete(key);
          await entry.context.close();
        }
      }
    });
  }

  private createDefaultSeleniumContextOptions(): void {
    const javaHomePath = HostPaths.external.defaultJavaHomePath();
    const javaBinPath = HostPaths.java.binPath(javaHomePath);
    const javaPath = HostPaths.java.javaPath(javaHomePath);
    const cleanEnv = newCleanNodeEnv();
    const serverEnv = _.merge(cleanEnv, {
      PATH: `${javaBinPath}${path.delimiter}${cleanEnv.PATH ?? ''}`,
    });
    this._defaultSeleniumContextOptions = {
      javaPath,
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
        try {
          await this.collectGarbage();
        } catch (error) {
          this.logger.error('Failed to collect garbage', { error: errorify(error) });
        }
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
