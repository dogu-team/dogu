import { Platform, Serial } from '@dogu-private/types';
import { delay, loopTime, Milisecond, Printable } from '@dogu-tech/common';
import { HostPaths } from '@dogu-tech/node';
import axios, { AxiosInstance } from 'axios';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { Zombieable, ZombieProps, ZombieWaiter } from '../../services/zombie/zombie-component';
import { ZombieServiceInstance } from '../../services/zombie/zombie-service';
import { XcodeBuild } from '../index';
import { DerivedData } from '../xcode/deriveddata';
import { MobileDevice } from './mobiledevice';
import { ZombieTunnel } from './mobiledevice-tunnel';
import { XCTestRunContext } from './xcodebuild';

export class WebdriverAgentProcess {
  private readonly xctest: ZombieWdaXCTest;
  private readonly wdaTunnel: ZombieTunnel;

  constructor(private readonly serial: Serial, private readonly wdaHostPort: number, private readonly logger: Printable, private isKilled = false) {
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

  static async start(serial: Serial, wdaHostPort: number, logger: Printable): Promise<WebdriverAgentProcess> {
    const originDerivedData = await DerivedData.create(HostPaths.external.xcodeProject.wdaDerivedDataPath());
    if (!originDerivedData.hasSerial(serial)) {
      throw new Error(`WebdriverAgent can't be executed on ${serial}`);
    }
    const ret = new WebdriverAgentProcess(serial, wdaHostPort, logger);
    await ret.xctest.zombieWaiter.waitUntilAlive();
    await ret.wdaTunnel.zombieWaiter.waitUntilAlive();
    return ret;
  }

  delete(): void {
    ZombieServiceInstance.deleteComponent(this.xctest);
    ZombieServiceInstance.deleteComponent(this.wdaTunnel);
  }
}

class ZombieWdaXCTest implements Zombieable {
  private xctestrun: XCTestRunContext | null = null;
  public readonly zombieWaiter: ZombieWaiter;
  private error: 'not-alive' | 'hello-failed' | 'none' = 'none';
  private client: AxiosInstance;

  constructor(public readonly serial: Serial, private readonly wdaHostPort: number, private readonly logger: Printable) {
    this.zombieWaiter = ZombieServiceInstance.addComponent(this);
    this.client = axios.create({
      baseURL: `http://127.0.0.1:${wdaHostPort}`,
      httpAgent: new http.Agent({ keepAlive: true, maxSockets: 1, maxTotalSockets: 1, maxFreeSockets: 0 }),
      timeout: 5000,
      maxRedirects: 10,
      maxContentLength: 50 * 1000 * 1000,
    });
  }
  get name(): string {
    return `WebdriverAgent`;
  }
  get platform(): Platform {
    return Platform.PLATFORM_IOS;
  }
  get props(): ZombieProps {
    return { wdaHostPort: this.wdaHostPort, elapsed: this.xctestrun ? Date.now() - this.xctestrun?.startTime : 0, error: this.error };
  }
  get printable(): Printable {
    return this.logger;
  }
  async revive(): Promise<void> {
    this.logger.debug?.(`ZombieWdaXCTest.revive`);
    await delay(1000);

    await MobileDevice.uninstallApp(this.serial, 'com.facebook.WebDriverAgentRunner', this.logger).catch(() => {
      this.logger.warn?.('uninstallApp com.facebook.WebDriverAgentRunner failed');
    });
    await XcodeBuild.killPreviousXcodebuild(this.serial, `webdriveragent.*${this.serial}`, this.printable).catch(() => {
      this.logger.warn?.('killPreviousXcodebuild failed');
    });
    const derivedDataPath = path.resolve(HostPaths.external.xcodeProject.wdaDerivedDataClonePath(), this.serial);
    if (!fs.existsSync(derivedDataPath)) {
      await fs.promises.mkdir(path.dirname(derivedDataPath), { recursive: true });
    }
    let timeout = Milisecond.t15Minutes;
    try {
      const cloneDerivedData = await DerivedData.create(derivedDataPath);
      if (0 < cloneDerivedData.debugiOSApps.length) {
        timeout = Milisecond.t2Minutes;
      }
    } catch (e) {
      this.logger.error?.(`cloneDerivedData not found `);
    }
    this.xctestrun = XcodeBuild.buildAndtest(
      this.serial,
      path.resolve(HostPaths.external.xcodeProject.wdaProjectDirectoryPath(), 'WebDriverAgent.xcodeproj'),
      'WebDriverAgentRunner',
      {
        extraArgs: ['-derivedDataPath', derivedDataPath, 'GCC_TREAT_WARNINGS_AS_ERRORS=0', 'COMPILER_INDEX_STORE_ENABLE=NO'],
        waitForLog: { str: 'ServerURLHere', timeout: timeout },
      },
      this.printable,
    );
    this.xctestrun.proc.on('close', () => {
      this.xctestrun = null;
      ZombieServiceInstance.notifyDie(this);
    });

    for await (const _ of loopTime(Milisecond.t3Seconds, timeout)) {
      if (await this.isHealth()) {
        break;
      }
    }
    if (!(await this.isHealth())) {
      throw new Error(`ZombieWdaXCTest is not alive. ${this.serial}`);
    }
  }

  async update(): Promise<void> {
    if (!(await this.isHealth())) {
      ZombieServiceInstance.notifyDie(this);
      return;
    }
    await delay(3000);
  }

  onDie(): void {
    this.logger.debug?.(`ZombieWdaXCTest.onDie`);
    this.xctestrun?.kill();
  }

  private async isHealth(): Promise<boolean> {
    if (!this.xctestrun?.isAlive) {
      this.error = 'not-alive';
      return false;
    }
    this.xctestrun.update();
    try {
      await this.client.get('/status');
    } catch (e) {
      this.error = 'hello-failed';
      return false;
    }

    return true;
  }
}
