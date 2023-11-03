import { Platform, Serial } from '@dogu-private/types';
import { delay, FilledPrintable, loopTime, Milisecond, Printable } from '@dogu-tech/common';
import { HostPaths } from '@dogu-tech/node';
import { Socket } from 'net';
import { config } from '../../config';
import { IosDeviceAgentService } from '../../services/device-agent/ios-device-agent-service';
import { IosResetService } from '../../services/reset/ios-reset';
import { StreamingService } from '../../services/streaming/streaming-service';
import { Zombieable, ZombieProps, ZombieQueriable } from '../../services/zombie/zombie-component';
import { ZombieServiceInstance } from '../../services/zombie/zombie-service';
import { XcodeBuild } from '../index';
import { DerivedData } from '../xcode/deriveddata';
import { Xctestrun as XctestrunFile } from '../xcode/xctestrun';
import { IdeviceInstaller } from './ideviceinstaller';
import { ZombieTunnel } from './mobiledevice-tunnel';
import { WebdriverAgentProcess } from './webdriver-agent-process';
import { XCTestRunContext } from './xcodebuild';

export class IosDeviceAgentProcess {
  private readonly xctest: ZombieIdaXCTest;
  private readonly screenTunnel: ZombieTunnel;
  private readonly grpcTunnel: ZombieTunnel;
  constructor(
    private readonly serial: Serial,
    xctestrunFile: XctestrunFile,
    screenForwardPort: number,
    screenDevicePort: number,
    grpcForwardPort: number,
    grpcDevicePort: number,
    webdriverAgentProcess: WebdriverAgentProcess,
    idaWdaDevicePort: number,
    iosDeviceAgentService: IosDeviceAgentService,
    streamingService: StreamingService,
    reset: IosResetService,
    private readonly logger: FilledPrintable,
  ) {
    ZombieServiceInstance.deleteComponentIfExist((zombieable: Zombieable): boolean => {
      if (zombieable instanceof ZombieIdaXCTest) {
        return zombieable.serial === this.serial;
      }
      return false;
    }, 'kill previous xctest');
    ZombieServiceInstance.deleteComponentIfExist((zombieable: Zombieable): boolean => {
      if (zombieable instanceof ZombieTunnel) {
        return zombieable.serial === this.serial && zombieable.hostPort === screenForwardPort;
      }
      return false;
    }, 'kill previous tunnel');

    ZombieServiceInstance.deleteComponentIfExist((zombieable: Zombieable): boolean => {
      if (zombieable instanceof ZombieTunnel) {
        return zombieable.serial === this.serial && zombieable.hostPort === grpcForwardPort;
      }
      return false;
    }, 'kill previous tunnel');
    this.xctest = new ZombieIdaXCTest(
      this.serial,
      xctestrunFile,
      screenForwardPort,
      webdriverAgentProcess,
      idaWdaDevicePort,
      grpcDevicePort,
      iosDeviceAgentService,
      streamingService,
      reset,
      this.logger,
    );
    this.screenTunnel = new ZombieTunnel(this.serial, screenForwardPort, screenDevicePort, this.logger);
    this.grpcTunnel = new ZombieTunnel(this.serial, grpcForwardPort, grpcDevicePort, this.logger);
  }

  static async isReady(serial: Serial): Promise<'build not found' | 'device not registered' | 'ok'> {
    try {
      const originDerivedData = await DerivedData.create(HostPaths.external.xcodeProject.idaDerivedDataPath());
      if (!originDerivedData.hasSerial(serial)) {
        return 'device not registered';
      }
    } catch (e) {
      return 'build not found';
    }
    return 'ok';
  }

  static async start(
    serial: Serial,
    screenForwardPort: number,
    screenDevicePort: number,
    grpcForwardPort: number,
    grpcDevicePort: number,
    webdriverAgentProcess: WebdriverAgentProcess,
    idaWdaDevicePort: number,
    iosDeviceAgentService: IosDeviceAgentService,
    streamingService: StreamingService,
    reset: IosResetService,
    logger: FilledPrintable,
  ): Promise<IosDeviceAgentProcess> {
    const originDerivedData = await DerivedData.create(HostPaths.external.xcodeProject.idaDerivedDataPath());
    if (!originDerivedData.hasSerial(serial)) {
      throw new Error(`iOSDeviceAgent can't be executed on ${serial}`);
    }
    const copiedDerivedData = await originDerivedData.copyToSerial(HostPaths.external.xcodeProject.idaDerivedDataClonePath(), serial, logger);
    const xctestrun = copiedDerivedData.xctestrun;
    if (!xctestrun) {
      throw new Error('xctestrun not found');
    }
    await copiedDerivedData.removeExceptAppsAndXctestrun();
    const ret = new IosDeviceAgentProcess(
      serial,
      xctestrun,
      screenForwardPort,
      screenDevicePort,
      grpcForwardPort,
      grpcDevicePort,
      webdriverAgentProcess,
      idaWdaDevicePort,
      iosDeviceAgentService,
      streamingService,
      reset,
      logger,
    );
    await ret.xctest.zombieWaiter.waitUntilAlive({ maxReviveCount: 5 });
    await ret.screenTunnel.zombieWaiter.waitUntilAlive({ maxReviveCount: 30 });
    await ret.grpcTunnel.zombieWaiter.waitUntilAlive({ maxReviveCount: 30 });

    return ret;
  }

  delete(): void {
    ZombieServiceInstance.deleteComponent(this.xctest);
    ZombieServiceInstance.deleteComponent(this.screenTunnel);
    ZombieServiceInstance.deleteComponent(this.grpcTunnel);
  }

  error(): string | undefined {
    if (!this.xctest.zombieWaiter.isAlive()) {
      return `IosDeviceAgent error. ${this.xctest.error}`;
    }
    if (!this.screenTunnel.zombieWaiter.isAlive()) {
      return 'Screen port forward error';
    }

    if (!this.grpcTunnel.zombieWaiter.isAlive()) {
      return 'Input port forward error';
    }
    return undefined;
  }
}

class ZombieIdaXCTest implements Zombieable {
  private xctestrun: XCTestRunContext | null = null;
  public readonly zombieWaiter: ZombieQueriable;
  private _error = 'none';
  private healthFailCount = 0;

  private isLiveCheckSocketConnected = false;
  private lastLiveCheckRecvTime = Date.now();

  constructor(
    public readonly serial: Serial,
    private readonly xctestrunfile: XctestrunFile,
    private readonly screenForwadPort: number,
    private readonly webdriverAgentProcess: WebdriverAgentProcess,
    private readonly idaWdaDevicePort: number,
    private readonly grpcPort: number,
    private readonly iosDeviceAgentService: IosDeviceAgentService,
    private readonly streamingService: StreamingService,
    private readonly reset: IosResetService,
    private readonly logger: FilledPrintable,
  ) {
    this.zombieWaiter = ZombieServiceInstance.addComponent(this);
  }
  get name(): string {
    return `IosDeviceAgent`;
  }
  get platform(): Platform {
    return Platform.PLATFORM_IOS;
  }
  get props(): ZombieProps {
    return {
      grpcPort: this.grpcPort,
      elapsed: this.xctestrun ? Date.now() - this.xctestrun?.startTime : 0,
      failCount: this.healthFailCount,
      error: this._error,
    };
  }
  get printable(): Printable {
    return this.logger;
  }

  get error(): string {
    return this._error;
  }

  async revive(): Promise<void> {
    const { serial, logger } = this;
    logger.debug?.(`ZombieIdaXCTest.revive`);
    if (config.externalIosDeviceAgent.use) {
      return;
    }
    if (this.reset.isResetting) {
      return;
    }

    await delay(1000);

    const xctestrunPath = this.xctestrunfile.filePath;
    await this.webdriverAgentProcess.waitUntilSessionId();
    await this.webdriverAgentProcess.dissmissAlert();

    const installer = new IdeviceInstaller(serial, logger);
    await installer.uninstallApp('com.dogu.IOSDeviceAgentRunner').catch(() => {
      this.logger.warn?.('uninstallApp com.dogu.IOSDeviceAgentRunner failed');
    });
    await installer.uninstallApp('com.dogu.IOSDeviceAgentRunner.xctrunner').catch(() => {
      this.logger.warn?.('uninstallApp com.dogu.IOSDeviceAgentRunner.xctrunner failed');
    });
    await this.webdriverAgentProcess.dissmissAlert();

    await this.xctestrunfile.updateIdaXctestrunFile(this.idaWdaDevicePort, this.grpcPort);
    await this.trySendKill();
    await XcodeBuild.killPreviousXcodebuild(this.serial, `ios-device-agent.*${this.serial}`, this.logger).catch(() => {
      this.logger.warn?.('killPreviousXcodebuild failed');
    });
    await delay(1000);
    this.xctestrun = XcodeBuild.testWithoutBuilding('ida', xctestrunPath, this.serial, { idleLogTimeoutMillis: Milisecond.t1Minute + Milisecond.t30Seconds }, this.logger);
    this.xctestrun.proc.on('close', () => {
      this.xctestrun = null;
      ZombieServiceInstance.notifyDie(this, `Proc closed`);
    });

    for await (const _ of loopTime({ period: { seconds: 3 }, expire: { minutes: 5 } })) {
      if (await this.isHealth()) {
        break;
      }
      if (this._error === 'not-alive') {
        break;
      }
    }
    if (!(await this.isHealth())) {
      throw new Error(`ZombieIdaXCTest has error. ${this.serial}. ${this._error}`);
    }
    this.healthFailCount = 0;
  }

  async update(): Promise<void> {
    if (config.externalIosDeviceAgent.use) {
      return;
    }
    if (!(await this.isHealth())) {
      this.healthFailCount++;
      if (this.healthFailCount > 3) {
        ZombieServiceInstance.notifyDie(this, `health check failed ${this.healthFailCount}`);
      }
      return;
    } else {
      this.healthFailCount = 0;
    }
    await delay(3000);
  }

  onDie(reason: string): void {
    this.logger.debug?.(`ZombieIdaXCTest.onDie ${reason}`);
    this.xctestrun?.kill(reason);
  }

  private async isHealth(): Promise<boolean> {
    if (!this.xctestrun?.isAlive) {
      this._error = this.xctestrun?.error ?? 'not-alive';
      return false;
    }
    this.xctestrun.update();
    this.checkAlive();
    if (Date.now() - this.lastLiveCheckRecvTime > Milisecond.t5Seconds) {
      this._error = 'no signal';
      return false;
    }

    if (!this.iosDeviceAgentService.isAlive) {
      this._error = 'client not alive';
      return false;
    }
    const surfaceStatus = await this.streamingService.getSurfaceStatus(this.serial).catch(() => {
      return { hasSurface: null };
    });
    if (surfaceStatus.hasSurface && surfaceStatus.isPlaying && surfaceStatus.lastFrameDeltaMillisec > Milisecond.t15Seconds) {
      this._error = 'not stable playing';
      return false;
    }

    this._error = 'none';
    return true;
  }

  private async connectSocket(): Promise<Socket> {
    const socket = new Socket();
    return new Promise((resolve, reject) => {
      let isNotified = false;
      const rejectIfNotNotified = (error: Error): void => {
        if (!isNotified) {
          isNotified = true;
          reject(error);
        }
      };
      socket.once('connect', () => {
        isNotified = true;
        resolve(socket);
      });

      socket.once('error', (error: Error) => {
        rejectIfNotNotified(error);
      });

      socket.once('timeout', () => {
        rejectIfNotNotified(new Error('timeout'));
      });

      socket.once('end', () => {
        rejectIfNotNotified(new Error('end'));
      });
      socket.connect({ host: '127.0.0.1', port: this.screenForwadPort });
    });
  }

  private checkAlive(): void {
    if (this.isLiveCheckSocketConnected) {
      return;
    }
    const liveCheckSocket = new Socket();
    liveCheckSocket.once('connect', () => {
      this.isLiveCheckSocketConnected = true;
      const message = '{"type":"livecheck"}';
      const sizeBuffer = Buffer.alloc(4);
      sizeBuffer.writeUInt32LE(message.length, 0);
      liveCheckSocket.write(Buffer.concat([sizeBuffer, Buffer.from(message)]), (err: Error | undefined) => {
        if (!err) {
          return;
        }
        this.logger.error(`startLiveCheck write failed`, { err });
        this.isLiveCheckSocketConnected = false;
      });
    });

    liveCheckSocket.on('data', (data: Buffer) => {
      this.lastLiveCheckRecvTime = Date.now();
    });

    liveCheckSocket.once('error', () => {
      this.isLiveCheckSocketConnected = false;
      liveCheckSocket.removeAllListeners();
    });

    liveCheckSocket.once('timeout', () => {
      this.isLiveCheckSocketConnected = false;
      liveCheckSocket.removeAllListeners();
    });

    liveCheckSocket.once('close', () => {
      this.isLiveCheckSocketConnected = false;
      liveCheckSocket.removeAllListeners();
    });

    liveCheckSocket.once('end', () => {
      this.isLiveCheckSocketConnected = false;
      liveCheckSocket.removeAllListeners();
    });

    liveCheckSocket.connect({ host: '127.0.0.1', port: this.screenForwadPort });
  }

  private async trySendKill(): Promise<void> {
    const socketOrError = await this.connectSocket().catch((e: Error) => {
      return e;
    });
    if (socketOrError instanceof Error) {
      return;
    }

    const message = '{"type":"kill"}';
    const sizeBuffer = Buffer.alloc(4);
    sizeBuffer.writeUInt32LE(message.length, 0);

    socketOrError.write(Buffer.concat([sizeBuffer, Buffer.from(message)]), (err: Error | undefined) => {});
  }
}
