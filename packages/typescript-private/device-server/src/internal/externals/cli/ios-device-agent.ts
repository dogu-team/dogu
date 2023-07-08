import { Platform, Serial } from '@dogu-private/types';
import { delay, Printable, stringifyError } from '@dogu-tech/common';
import { HostPaths } from '@dogu-tech/node';
import { Socket } from 'net';
import { config } from '../../config';
import { Zombieable, ZombieProps, ZombieWaiter } from '../../services/zombie/zombie-component';
import { ZombieServiceInstance } from '../../services/zombie/zombie-service';
import { MobileDevice, XcodeBuild } from '../index';
import { DerivedData } from '../xcode/deriveddata';
import { Xctestrun as XctestrunFile } from '../xcode/xctestrun';
import { ZombieTunnel } from './mobiledevice-tunnel';
import { XCTestRunContext } from './xcodebuild';

export class IosDeviceAgentProcess {
  private readonly xctest: ZombieXCTest;
  private readonly screenTunnel: ZombieTunnel;
  private readonly grpcTunnel: ZombieTunnel;
  private readonly screenChecker: ZombieScreenChecker;
  constructor(
    private readonly serial: Serial,
    private readonly xctestrunFile: XctestrunFile,
    private readonly screenForwardPort: number,
    private readonly screenDevicePort: number,
    private readonly grpcForwardPort: number,
    private readonly grpcDevicePort: number,
    private readonly webDriverPort: number,
    private readonly logger: Printable,
    private isKilled = false,
  ) {
    ZombieServiceInstance.deleteComponentIfExist((zombieable: Zombieable): boolean => {
      if (zombieable instanceof ZombieXCTest) {
        return zombieable.serial === this.serial;
      }
      return false;
    }, 'kill previous xctest');
    ZombieServiceInstance.deleteComponentIfExist((zombieable: Zombieable): boolean => {
      if (zombieable instanceof ZombieTunnel) {
        return zombieable.serial === this.serial && zombieable.hostPort === this.screenForwardPort;
      }
      return false;
    }, 'kill previous tunnel');

    ZombieServiceInstance.deleteComponentIfExist((zombieable: Zombieable): boolean => {
      if (zombieable instanceof ZombieTunnel) {
        return zombieable.serial === this.serial && zombieable.hostPort === this.grpcForwardPort;
      }
      return false;
    }, 'kill previous tunnel');
    ZombieServiceInstance.deleteComponentIfExist((zombieable: Zombieable): boolean => {
      if (zombieable instanceof ZombieScreenChecker) {
        return zombieable.serial === this.serial;
      }
      return false;
    }, 'kill previous screenchecker');
    this.xctest = new ZombieXCTest(this.serial, xctestrunFile, this.webDriverPort, this.grpcDevicePort, this.logger);
    this.screenTunnel = new ZombieTunnel(this.serial, this.screenForwardPort, this.screenDevicePort, this.logger);
    this.grpcTunnel = new ZombieTunnel(this.serial, this.grpcForwardPort, this.grpcDevicePort, this.logger);
    this.screenChecker = new ZombieScreenChecker(this.serial, this.screenForwardPort, this.xctest, this.logger);
  }

  static async start(
    serial: Serial,
    screenForwardPort: number,
    screenDevicePort: number,
    grpcForwardPort: number,
    grpcDevicePort: number,
    webDriverDevicePort: number,
    logger: Printable,
  ): Promise<IosDeviceAgentProcess> {
    let webDriverPort = webDriverDevicePort;
    let grpcPort = grpcDevicePort;
    if (config.externalIosDeviceAgent.use) {
      const devices = config.externalIosDeviceAgent.devices.filter((device) => device.serial === serial);
      if (devices.length !== 1) {
        throw new Error(`serial is not found. ${serial}. check config`);
      }
      const device = devices[0];
      if (device === undefined) {
        throw new Error(`device is undefined. ${serial}. check config`);
      }
      webDriverPort = device.webDriverPort;
      grpcPort = device.grpcPort;
    }
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
    const ret = new IosDeviceAgentProcess(serial, xctestrun, screenForwardPort, screenDevicePort, grpcForwardPort, grpcPort, webDriverPort, logger);
    await ret.xctest.zombieWaiter.waitUntilAlive();
    await ret.screenTunnel.zombieWaiter.waitUntilAlive();
    await ret.grpcTunnel.zombieWaiter.waitUntilAlive();
    await ret.screenChecker.zombieWaiter.waitUntilAlive();

    return ret;
  }

  delete(): void {
    this.isKilled = true;
    ZombieServiceInstance.deleteComponent(this.xctest);
    ZombieServiceInstance.deleteComponent(this.screenTunnel);
    ZombieServiceInstance.deleteComponent(this.grpcTunnel);
    ZombieServiceInstance.deleteComponent(this.screenChecker);
  }

  get hasKilled(): boolean {
    return this.isKilled;
  }
}

class ZombieXCTest implements Zombieable {
  private xctestrun: XCTestRunContext | null = null;
  public readonly zombieWaiter: ZombieWaiter;
  public dieTime?: Date;
  constructor(
    public readonly serial: Serial,
    private readonly xctestrunfile: XctestrunFile,
    private readonly webDriverPort: number,
    private readonly grpcPort: number,
    // private readonly iosDeviceControllerGrpcClient: IosDeviceControllerGrpcClient,
    private readonly logger: Printable,
  ) {
    this.zombieWaiter = ZombieServiceInstance.addComponent(this);
  }
  get name(): string {
    return `XCTest`;
  }
  get platform(): Platform {
    return Platform.PLATFORM_IOS;
  }
  get props(): ZombieProps {
    return { webDriverPort: this.webDriverPort, grpcPort: this.grpcPort };
  }
  get printable(): Printable {
    return this.logger;
  }
  async revive(): Promise<void> {
    this.logger.debug?.(`ZombieXCTest.revive`);
    if (config.externalIosDeviceAgent.use) {
      return;
    }

    await delay(1000);

    const xctestrunPath = this.xctestrunfile.filePath;
    await MobileDevice.uninstallApp(this.serial, 'com.dogu.IOSDeviceAgentRunner', this.logger).catch(() => {
      this.logger.warn?.('uninstallApp com.dogu.IOSDeviceAgentRunner failed');
    });
    await MobileDevice.uninstallApp(this.serial, 'com.dogu.IOSDeviceAgentRunner.xctrunner', this.logger).catch(() => {
      this.logger.warn?.('uninstallApp com.dogu.IOSDeviceAgentRunner.xctrunner failed');
    });
    await this.xctestrunfile.updateIdaXctestrunFile(this.webDriverPort, this.grpcPort);
    await XcodeBuild.killPreviousXcodebuild(this.serial, this.printable).catch(() => {
      this.logger.warn?.('killPreviousXcodebuild failed');
    });
    this.xctestrun = XcodeBuild.testWithoutBuilding(xctestrunPath, this.serial, this.printable);
    this.xctestrun.proc.on('close', () => {
      this.xctestrun = null;
      ZombieServiceInstance.notifyDie(this);
    });
  }

  async update(): Promise<void> {
    if (config.externalIosDeviceAgent.use) {
      return;
    }
    if (!this.xctestrun?.isAlive) {
      ZombieServiceInstance.notifyDie(this);
      return;
    }
    await delay(0);
  }

  onDie(): void {
    this.dieTime = new Date();
    this.logger.debug?.(`ZombieXCTest.onDie`);
    this.xctestrun?.kill();
  }
}

class ZombieScreenChecker implements Zombieable {
  public readonly zombieWaiter: ZombieWaiter;
  constructor(public readonly serial: Serial, private readonly screenForwadPort: number, private readonly xctest: ZombieXCTest, private readonly logger: Printable) {
    this.zombieWaiter = ZombieServiceInstance.addComponent(this);
  }
  get name(): string {
    return `ScreenChecker`;
  }
  get platform(): Platform {
    return Platform.PLATFORM_IOS;
  }
  get props(): ZombieProps {
    return {};
  }
  get printable(): Printable {
    return this.logger;
  }
  async revive(): Promise<void> {
    if (config.externalIosDeviceAgent.use) {
      return;
    }
    const tryCount = 60;
    let isConnected = false;
    for (let i = 0; i < tryCount; i++) {
      await delay(3000);
      const socketOrError = await this.connectSocket().catch((e: Error) => {
        return e;
      });
      if (socketOrError instanceof Error) {
        this.logger.debug?.(`ZombieScreenChecker. connect failed. count: ${i}, error:${stringifyError(socketOrError)}`);
        continue;
      }
      this.logger.debug?.(`ZombieScreenChecker.connect done`);

      const sendErr = await this.sendHello(socketOrError).catch((e: Error) => {
        return e;
      });
      if (sendErr instanceof Error) {
        this.logger.debug?.(`ZombieScreenChecker. hello failed. count: ${i}, error:${stringifyError(sendErr)}`);
        continue;
      }
      this.logger.debug?.(`ZombieScreenChecker. hello success. `);
      const onClose = (): void => {
        this.logger.info(`ZombieScreenChecker.close. `);
        if (this.xctest.dieTime) {
          // screenCheck should kill xctest only if xctest is alive and doguscreen is dead.
          // temporarily prevent xctest die -> screenCheck die -> xctest die loop
          const diffTime = new Date().getTime() - this.xctest.dieTime.getTime();
          if (1000 * 10 < diffTime) {
            this.logger.info(`ZombieScreenChecker. kill xctest`);
            ZombieServiceInstance.notifyDie(this.xctest, 'screen check failed');
          }
        } else {
          this.logger.info(`ZombieScreenChecker. kill xctest first`);
          ZombieServiceInstance.notifyDie(this.xctest, 'screen check failed');
        }
        ZombieServiceInstance.notifyDie(this, 'close');
      };
      socketOrError.on('close', onClose);
      isConnected = true;
      break;
    }
    if (!isConnected) {
      throw new Error('ZombieScreenChecker notconnected');
    }
  }

  async update(): Promise<void> {
    // noop
  }

  onDie(): void {
    // noop
  }

  private async connectSocket(): Promise<Socket> {
    const socket = new Socket();
    return new Promise((resolve, reject) => {
      socket.once('connect', () => {
        resolve(socket);
      });

      socket.once('error', (error: Error) => {
        reject(error);
      });

      socket.once('timeout', () => {
        reject(new Error('timeout'));
      });

      socket.once('end', () => {
        reject(new Error('end'));
      });
      socket.connect({ host: '127.0.0.1', port: this.screenForwadPort });
    });
  }

  private async sendHello(socket: Socket): Promise<void> {
    return new Promise((resolve, reject) => {
      const message = '{"type":"livecheck"}';
      const sizeBuffer = Buffer.alloc(4);
      sizeBuffer.writeUInt32LE(message.length, 0);

      socket.write(Buffer.concat([sizeBuffer, Buffer.from(message)]), (err: Error | undefined) => {
        // noop
      });
      socket.once('error', (error: Error) => {
        reject(error);
      });
      delay(1000)
        .then(() => {
          resolve();
        })
        .catch((e: Error) => {
          this.logger.error(`ZombieScreenChecker.sendHello. delay error:${stringifyError(e)}`);
          resolve();
        });
    });
  }
}
