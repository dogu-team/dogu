import { Platform, Serial } from '@dogu-private/types';
import { delay, FilledPrintable, loopTime, Milisecond, Printable, setAxiosErrorFilterToIntercepter } from '@dogu-tech/common';
import { HostPaths } from '@dogu-tech/node';
import axios, { AxiosInstance } from 'axios';
import http from 'http';
import { Zombieable, ZombieProps, ZombieQueriable } from '../../services/zombie/zombie-component';
import { ZombieServiceInstance } from '../../services/zombie/zombie-service';
import { XcodeBuild } from '../index';
import { DerivedData } from '../xcode/deriveddata';
import { MobileDevice } from './mobiledevice';
import { ZombieTunnel } from './mobiledevice-tunnel';
import { XCTestRunContext } from './xcodebuild';

export class WebdriverAgentProcess {
  private readonly xctest: ZombieWdaXCTest;
  private readonly wdaTunnel: ZombieTunnel;

  constructor(private readonly serial: Serial, private readonly wdaHostPort: number, private readonly logger: FilledPrintable, private isKilled = false) {
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
    this.wdaTunnel = new ZombieTunnel(this.serial, wdaHostPort, 8100, this.logger);
  }

  static async start(serial: Serial, wdaHostPort: number, logger: FilledPrintable): Promise<WebdriverAgentProcess> {
    const originDerivedData = await DerivedData.create(HostPaths.external.xcodeProject.wdaDerivedDataPath());
    if (!originDerivedData.hasSerial(serial)) {
      throw new Error(`WebdriverAgent can't be executed on ${serial}`);
    }
    const ret = new WebdriverAgentProcess(serial, wdaHostPort, logger);
    await ret.xctest.zombieWaiter.waitUntilAlive();
    await ret.wdaTunnel.zombieWaiter.waitUntilAlive();
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
}

class ZombieWdaXCTest implements Zombieable {
  private xctestrun: XCTestRunContext | null = null;
  public readonly zombieWaiter: ZombieQueriable;
  private error = 'none';
  private client: AxiosInstance;
  private healthFailCount = 0;

  constructor(public readonly serial: Serial, private readonly wdaHostPort: number, private readonly logger: FilledPrintable) {
    this.zombieWaiter = ZombieServiceInstance.addComponent(this);
    this.client = axios.create({
      baseURL: `http://127.0.0.1:${wdaHostPort}`,
      httpAgent: new http.Agent({ keepAlive: true, maxSockets: 1, maxTotalSockets: 1, maxFreeSockets: 0 }),
      timeout: 5000,
      maxRedirects: 10,
      maxContentLength: 50 * 1000 * 1000,
    });
    setAxiosErrorFilterToIntercepter(this.client);
  }
  get name(): string {
    return `WebdriverAgent`;
  }
  get platform(): Platform {
    return Platform.PLATFORM_IOS;
  }
  get props(): ZombieProps {
    return { wdaHostPort: this.wdaHostPort, elapsed: this.xctestrun ? Date.now() - this.xctestrun?.startTime : 0, failCount: this.healthFailCount, error: this.error };
  }
  get printable(): Printable {
    return this.logger;
  }
  async revive(): Promise<void> {
    await this.reviveOnlyTest();
    this.healthFailCount = 0;
  }

  async update(): Promise<void> {
    if (!(await this.isHealth())) {
      this.healthFailCount++;
      if (this.healthFailCount > 3) {
        ZombieServiceInstance.notifyDie(this);
      }
      return;
    } else {
      this.healthFailCount = 0;
    }
    await delay(3000);
  }

  onDie(): void {
    this.logger.debug?.(`ZombieWdaXCTest.onDie`);
    this.xctestrun?.kill('ZombieWdaXCTest.onDie');
  }

  private async isHealth(): Promise<boolean> {
    if (!this.xctestrun?.isAlive) {
      this.error = this.xctestrun?.error ?? 'not-alive';
      return false;
    }
    this.xctestrun.update();
    try {
      await this.client.get('/status');
    } catch (e) {
      this.error = 'hello-failed';
      return false;
    }
    this.error = 'none';

    return true;
  }

  async reviveOnlyTest(): Promise<void> {
    this.logger.debug?.(`ZombieWdaXCTest.revive`);
    await delay(1000);

    await MobileDevice.uninstallApp(this.serial, 'com.facebook.WebDriverAgentRunner', this.logger).catch(() => {
      this.logger.warn?.('uninstallApp com.facebook.WebDriverAgentRunner failed');
    });
    await XcodeBuild.killPreviousXcodebuild(this.serial, `webdriveragent.*${this.serial}`, this.logger).catch(() => {
      this.logger.warn?.('killPreviousXcodebuild failed');
    });
    await delay(1000);
    const originDerivedData = await DerivedData.create(HostPaths.external.xcodeProject.wdaDerivedDataPath());
    if (!originDerivedData.hasSerial(this.serial)) {
      throw new Error(`WebdriverAgent can't be executed on ${this.serial}`);
    }
    const copiedDerivedData = await originDerivedData.copyToSerial(HostPaths.external.xcodeProject.wdaDerivedDataClonePath(), this.serial, this.logger);
    const xctestrun = copiedDerivedData.xctestrun;
    if (!xctestrun) {
      throw new Error('xctestrun not found');
    }
    this.xctestrun = XcodeBuild.testWithoutBuilding('wda', xctestrun.filePath, this.serial, { idleLogTimeoutMillis: Milisecond.t1Minute + Milisecond.t30Seconds }, this.logger);
    this.xctestrun.proc.on('close', () => {
      this.xctestrun = null;
      ZombieServiceInstance.notifyDie(this);
    });

    for await (const _ of loopTime(Milisecond.t3Seconds, Milisecond.t3Minutes)) {
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
}
