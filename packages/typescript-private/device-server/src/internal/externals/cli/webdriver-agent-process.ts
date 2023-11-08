import { Platform, Serial } from '@dogu-private/types';
import { delay, errorify, FilledPrintable, loopTime, Milisecond, setAxiosErrorFilterToIntercepter, stringify } from '@dogu-tech/common';
import { HostPaths } from '@dogu-tech/node';
import axios, { AxiosInstance } from 'axios';
import http from 'http';
import _ from 'lodash';
import { Zombieable, ZombieProps, ZombieQueriable } from '../../services/zombie/zombie-component';
import { ZombieServiceInstance } from '../../services/zombie/zombie-service';
import { XcodeBuild } from '../index';
import { DerivedData } from '../xcode/deriveddata';
import { IdeviceInstaller } from './ideviceinstaller';
import { ZombieTunnel } from './mobiledevice-tunnel';
import { XCTestRunContext } from './xcodebuild';

export interface ActiveAppInfo {
  pid: number;
  bundleId: string;
}

export class WebdriverAgentProcess {
  private readonly xctest: ZombieWdaXCTest;
  private readonly wdaTunnel: ZombieTunnel;

  constructor(
    private readonly serial: Serial,
    private readonly wdaHostPort: number,
    private readonly logger: FilledPrintable,
    private isKilled = false,
  ) {
    ZombieServiceInstance.deleteComponentIfExist((zombieable: Zombieable): boolean => {
      if (zombieable instanceof ZombieWdaXCTest) {
        return zombieable.serial === this.serial;
      }
      return false;
    }, 'kill previous ZombieWdaXCTest');
    ZombieServiceInstance.deleteComponentIfExist((zombieable: Zombieable): boolean => {
      if (zombieable instanceof ZombieTunnel) {
        return zombieable.serial === this.serial && zombieable.hostPort === this.wdaHostPort;
      }
      return false;
    }, 'kill previous tunnel');
    this.xctest = new ZombieWdaXCTest(this.serial, wdaHostPort, this.logger);
    this.wdaTunnel = new ZombieTunnel(this.serial, 'wda', wdaHostPort, 8100, this.logger);
  }

  static async start(serial: Serial, wdaHostPort: number, logger: FilledPrintable): Promise<WebdriverAgentProcess> {
    const originDerivedData = await DerivedData.create(HostPaths.external.xcodeProject.wdaDerivedDataPath());
    if (!originDerivedData.hasSerial(serial)) {
      throw new Error(`WebdriverAgent can't be executed on ${serial}`);
    }
    const ret = new WebdriverAgentProcess(serial, wdaHostPort, logger);
    await ret.xctest.zombieWaiter.waitUntilAlive({ maxReviveCount: 30 });
    await ret.wdaTunnel.zombieWaiter.waitUntilAlive({ maxReviveCount: 30 });
    return ret;
  }

  static async isReady(serial: Serial): Promise<'build not found' | 'device not registered' | 'ok'> {
    try {
      const originDerivedData = await DerivedData.create(HostPaths.external.xcodeProject.wdaDerivedDataPath());
      if (!originDerivedData.hasSerial(serial)) {
        return 'device not registered';
      }
    } catch (e) {
      return 'build not found';
    }

    return 'ok';
  }

  delete(): void {
    ZombieServiceInstance.deleteComponent(this.xctest);
    ZombieServiceInstance.deleteComponent(this.wdaTunnel);
  }

  async waitUntilSessionId(): Promise<void> {
    for await (const _ of loopTime({ period: { milliseconds: 300 }, expire: { minutes: 5 } })) {
      if (this.xctest.sessionId) {
        break;
      }
    }
    if (!this.xctest.sessionId) {
      throw new Error('sessionId is undefined');
    }
  }

  private async regenerateSessionIdIfEmpty(): Promise<string | undefined> {
    return this.xctest.regenerateSessionIdIfEmpty();
  }

  async launchApp(bundleId: string): Promise<void> {
    const { sessionId, client } = this.xctest;
    if (!sessionId) {
      this.logger.warn('sessionId is undefined. so skip activateApp');
      return;
    }
    await client.post(`/session/${sessionId}/wda/apps/launch`, { bundleId });
  }

  async activateApp(bundleId: string): Promise<void> {
    const { sessionId, client } = this.xctest;
    if (!sessionId) {
      this.logger.warn('sessionId is undefined. so skip activateApp');
      return;
    }
    await client.post(`/session/${sessionId}/wda/apps/activate`, { bundleId });
  }

  /*
   * Caution: dangerous. If this called, trigger crash of IosDeviceAgent....
   */
  async terminateApp(bundleId: string): Promise<void> {
    const { sessionId, client } = this.xctest;
    if (!sessionId) {
      this.logger.warn('sessionId is undefined. so skip terminateApp');
      return;
    }
    await client.post(`/session/${sessionId}/wda/apps/terminate`, { bundleId });
  }

  async goToHome(): Promise<void> {
    const { sessionId, client } = this.xctest;
    if (!sessionId) {
      this.logger.warn('sessionId is undefined. so skip goToHome');
      return;
    }
    await client.post(`/session/${sessionId}/wda/pressButton`, { name: 'home', duration: 100 });
  }

  async screenshot(quality: 'high' | 'default' | 'low' = 'low'): Promise<string> {
    const { client } = this.xctest;

    const screenshotQuality = quality === 'high' ? 0 : quality === 'default' ? 1 : 2;

    await this.setSettings('screenshotQuality', screenshotQuality);
    const response = await client.get(`/screenshot`);
    if (!response || response.status !== 200) {
      throw new Error(`response is not 200. ${response?.status}`);
    }

    const value = _.get(response, 'data.value', undefined) as unknown;
    if (typeof value !== 'string') {
      throw new Error(`value is not string. ${stringify(value)}`);
    }

    const base64 = value;
    return base64;
  }

  async setSettings(key: string, value: string | number | boolean): Promise<void> {
    const { sessionId, client } = this.xctest;
    if (!sessionId) {
      this.logger.warn('sessionId is undefined. so skip goToHome');
      return;
    }
    await client.post(`/session/${sessionId}/appium/settings`, { settings: { [key]: value } });
  }

  /*
   * ref: https://github.com/appium/WebDriverAgent/blob/master/WebDriverAgentLib/Commands/FBSessionCommands.m#L46
   */
  async getActiveAppList(): Promise<ActiveAppInfo[]> {
    const { sessionId, client } = this.xctest;
    if (!sessionId) {
      this.logger.warn('sessionId is undefined. so skip getActiveAppList');
      return [];
    }
    const response = await client.get(`/session/${sessionId}/wda/apps/list`).catch((e) => {
      return errorify(e);
    });
    if (response instanceof Error) {
      return [];
    }
    if (!response || response.status !== 200) {
      return [];
    }

    const activeAppList = _.get(response, 'data.value', undefined) as unknown;
    if (!Array.isArray(activeAppList)) {
      return [];
    }
    return activeAppList as ActiveAppInfo[];
  }

  async dismissAlert(): Promise<void> {
    const { sessionId, client } = this.xctest;
    if (!sessionId) {
      this.logger.warn('sessionId is undefined. so skip dismiss alert');
      return;
    }
    await client
      .post(`/session/${sessionId}/alert/dismiss`)
      .then(() => {
        this.logger.info('dismiss alert success');
      })
      .catch(() => {
        this.logger.warn('dismiss alert failed');
      });
    await client
      .post(`/session/${sessionId}/alert/accept`)
      .then(() => {
        this.logger.info('accept alert success');
      })
      .catch(() => {
        this.logger.warn('accept alert failed');
      });
  }
}

class ZombieWdaXCTest implements Zombieable {
  public name = 'WebdriverAgent';
  public platform = Platform.PLATFORM_IOS;
  private xctestrun: XCTestRunContext | null = null;
  public readonly zombieWaiter: ZombieQueriable;
  private _sessionId: string | null = null;
  public client: AxiosInstance;
  private error = 'none';
  private healthFailCount = 0;

  constructor(
    public readonly serial: Serial,
    private readonly wdaHostPort: number,
    public printable: FilledPrintable,
  ) {
    this.zombieWaiter = ZombieServiceInstance.addComponent(this);
    this.client = axios.create({
      baseURL: `http://127.0.0.1:${wdaHostPort}`,
      httpAgent: new http.Agent({ keepAlive: true, maxSockets: 1, maxTotalSockets: 1, maxFreeSockets: 0 }),
      timeout: 10000,
      maxRedirects: 10,
      maxContentLength: 50 * 1000 * 1000,
    });
    setAxiosErrorFilterToIntercepter(this.client);
  }

  get props(): ZombieProps {
    return {
      wdaHostPort: this.wdaHostPort,
      elapsed: this.xctestrun ? Date.now() - this.xctestrun?.startTime : 0,
      failCount: this.healthFailCount,
      error: this.error,
      sessionId: this._sessionId,
    };
  }

  get sessionId(): string | null {
    return this._sessionId;
  }

  async revive(): Promise<void> {
    await this.reviveInternal();
    this.healthFailCount = 0;
  }

  async update(): Promise<void> {
    await delay(3000);
    if (!(await this.isHealth())) {
      this.healthFailCount++;
      if (this.healthFailCount > 5) {
        ZombieServiceInstance.notifyDie(this, `HelathCheck Failed error: ${this.error}`);
      }
      return;
    } else {
      this.healthFailCount = 0;
    }
  }

  onDie(reason: string): void {
    this.xctestrun?.kill(reason);
  }

  private async isHealth(): Promise<boolean> {
    if (!this.xctestrun?.isAlive) {
      this.error = this.xctestrun?.error ?? 'not-alive';
      return false;
    }
    this.xctestrun.update();
    try {
      const sessionId = await this.getSessionId();
      if (sessionId instanceof Error) {
        this.error = sessionId.message;
        return false;
      }
      this._sessionId = sessionId;
    } catch (e) {
      return false;
    }
    this.error = 'none';

    return true;
  }

  async reviveInternal(): Promise<void> {
    const { serial, printable: logger } = this;
    logger.debug(`ZombieWdaXCTest.revive`);
    await delay(1000);

    const installer = new IdeviceInstaller(serial, logger);
    await installer.uninstallApp('com.facebook.WebDriverAgentRunner').catch(() => {
      logger.warn('uninstallApp com.facebook.WebDriverAgentRunner failed');
    });
    await XcodeBuild.killPreviousXcodebuild(this.serial, `webdriveragent.*${this.serial}`, logger).catch(() => {
      logger.warn('killPreviousXcodebuild failed');
    });
    await delay(1000);
    const originDerivedData = await DerivedData.create(HostPaths.external.xcodeProject.wdaDerivedDataPath());
    if (!originDerivedData.hasSerial(this.serial)) {
      throw new Error(`WebdriverAgent can't be executed on ${this.serial}`);
    }
    const copiedDerivedData = await originDerivedData.copyToSerial(HostPaths.external.xcodeProject.wdaDerivedDataClonePath(), this.serial, logger);
    const xctestrun = copiedDerivedData.xctestrun;
    if (!xctestrun) {
      throw new Error('xctestrun not found');
    }
    this.xctestrun = XcodeBuild.testWithoutBuilding('wda', xctestrun.filePath, this.serial, { idleLogTimeoutMillis: Milisecond.t1Minute + Milisecond.t30Seconds }, logger);
    this.xctestrun.proc.on('close', () => {
      this.xctestrun = null;
      ZombieServiceInstance.notifyDie(this, `xctestrun close`);
    });

    for await (const _ of loopTime({ period: { seconds: 3 }, expire: { minutes: 3 } })) {
      if (await this.isHealth()) {
        break;
      }
      if (this.error === 'not-alive') {
        break;
      }
    }
    if (!(await this.isHealth())) {
      throw new Error(`ZombieWdaXCTest has error. ${this.serial}. ${this.error}`);
    }
  }

  async regenerateSessionIdIfEmpty(): Promise<string | undefined> {
    const { sessionId, client } = this;
    if (sessionId) {
      return sessionId;
    }
    const response = await client.post('/session', JSON.stringify({ capabilities: {} })).catch(() => {
      return undefined;
    });
    if (!response || response.status !== 200) {
      return undefined;
    }
    const newSessionId = _.get(response, 'data.sessionId', undefined) as unknown;
    if (typeof newSessionId !== 'string') {
      return undefined;
    }
    this._sessionId = newSessionId;
    return newSessionId;
  }

  private async getSessionId(): Promise<string | Error | null> {
    const response = await this.client.get('/status').catch((e) => {
      return errorify(e);
    });
    if (response instanceof Error) {
      return response;
    }
    if (!response || response.status !== 200) {
      return new Error(`response is not 200. ${response?.status}`);
    }

    const sessionId = _.get(response, 'data.sessionId', undefined) as unknown;
    if (typeof sessionId !== 'string') {
      return null;
    }
    return sessionId;
  }
}
