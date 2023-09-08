import { Platform, Serial } from '@dogu-private/types';
import { delay, loopTime, Milisecond, Printable, setAxiosErrorFilterToIntercepter, stringifyError } from '@dogu-tech/common';
import { HostPaths } from '@dogu-tech/node';
import axios, { AxiosInstance } from 'axios';
import _ from 'lodash';
import { Socket } from 'net';
import { config } from '../../config';
import { Zombieable, ZombieProps, ZombieQueriable } from '../../services/zombie/zombie-component';
import { ZombieServiceInstance } from '../../services/zombie/zombie-service';
import { MobileDevice, XcodeBuild } from '../index';
import { DerivedData } from '../xcode/deriveddata';
import { Xctestrun as XctestrunFile } from '../xcode/xctestrun';
import { ZombieTunnel } from './mobiledevice-tunnel';
import { XCTestRunContext } from './xcodebuild';

export class IosDeviceAgentProcess {
  private readonly xctest: ZombieIdaXCTest;
  private readonly screenTunnel: ZombieTunnel;
  private readonly grpcTunnel: ZombieTunnel;
  constructor(
    private readonly serial: Serial,
    private readonly xctestrunFile: XctestrunFile,
    private readonly screenForwardPort: number,
    private readonly screenDevicePort: number,
    private readonly grpcForwardPort: number,
    private readonly grpcDevicePort: number,
    private readonly webDriverForwardPort: number,
    private readonly webDriverPort: number,
    private readonly logger: Printable,
  ) {
    ZombieServiceInstance.deleteComponentIfExist((zombieable: Zombieable): boolean => {
      if (zombieable instanceof ZombieIdaXCTest) {
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
    this.xctest = new ZombieIdaXCTest(this.serial, xctestrunFile, this.screenForwardPort, this.webDriverForwardPort, this.webDriverPort, this.grpcDevicePort, this.logger);
    this.screenTunnel = new ZombieTunnel(this.serial, this.screenForwardPort, this.screenDevicePort, this.logger);
    this.grpcTunnel = new ZombieTunnel(this.serial, this.grpcForwardPort, this.grpcDevicePort, this.logger);
  }

  static async isReady(serial: Serial): Promise<boolean> {
    const originDerivedData = await DerivedData.create(HostPaths.external.xcodeProject.idaDerivedDataPath());
    if (!originDerivedData.hasSerial(serial)) {
      return false;
    }
    return true;
  }

  static async start(
    serial: Serial,
    screenForwardPort: number,
    screenDevicePort: number,
    grpcForwardPort: number,
    grpcDevicePort: number,
    webDriverForwardPort: number,
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
    const ret = new IosDeviceAgentProcess(serial, xctestrun, screenForwardPort, screenDevicePort, grpcForwardPort, grpcPort, webDriverForwardPort, webDriverPort, logger);
    await ret.xctest.zombieWaiter.waitUntilAlive();
    await ret.screenTunnel.zombieWaiter.waitUntilAlive();
    await ret.grpcTunnel.zombieWaiter.waitUntilAlive();

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
  private wdaClient: AxiosInstance;

  constructor(
    public readonly serial: Serial,
    private readonly xctestrunfile: XctestrunFile,
    private readonly screenForwadPort: number,
    private readonly webDriverForwardPort: number,
    private readonly webDriverPort: number,
    private readonly grpcPort: number,
    // private readonly iosDeviceControllerGrpcClient: IosDeviceControllerGrpcClient,
    private readonly logger: Printable,
  ) {
    this.zombieWaiter = ZombieServiceInstance.addComponent(this);
    this.wdaClient = axios.create({
      baseURL: `http://127.0.0.1:${this.webDriverForwardPort}`,
    });
    setAxiosErrorFilterToIntercepter(this.wdaClient);
  }
  get name(): string {
    return `IosDeviceAgent`;
  }
  get platform(): Platform {
    return Platform.PLATFORM_IOS;
  }
  get props(): ZombieProps {
    return { webDriverPort: this.webDriverPort, grpcPort: this.grpcPort, elapsed: this.xctestrun ? Date.now() - this.xctestrun?.startTime : 0, error: this._error };
  }
  get printable(): Printable {
    return this.logger;
  }

  get error(): string {
    return this._error;
  }

  async revive(): Promise<void> {
    this.logger.debug?.(`ZombieIdaXCTest.revive`);
    if (config.externalIosDeviceAgent.use) {
      return;
    }

    await delay(1000);
    const sessionId = await this.createOrGetSession();

    const xctestrunPath = this.xctestrunfile.filePath;
    await this.dissmissAlert(sessionId);
    await MobileDevice.uninstallApp(this.serial, 'com.dogu.IOSDeviceAgentRunner', this.logger).catch(() => {
      this.logger.warn?.('uninstallApp com.dogu.IOSDeviceAgentRunner failed');
    });
    await MobileDevice.uninstallApp(this.serial, 'com.dogu.IOSDeviceAgentRunner.xctrunner', this.logger).catch(() => {
      this.logger.warn?.('uninstallApp com.dogu.IOSDeviceAgentRunner.xctrunner failed');
    });
    await this.dissmissAlert(sessionId);

    await this.xctestrunfile.updateIdaXctestrunFile(this.webDriverPort, this.grpcPort);
    await XcodeBuild.killPreviousXcodebuild(this.serial, `ios-device-agent.*${this.serial}`, this.printable).catch(() => {
      this.logger.warn?.('killPreviousXcodebuild failed');
    });
    await delay(1000);
    this.xctestrun = XcodeBuild.testWithoutBuilding('ida', xctestrunPath, this.serial, { waitForLog: { str: 'ServerURLHere', timeout: Milisecond.t2Minutes } }, this.printable);
    this.xctestrun.proc.on('close', () => {
      this.xctestrun = null;
      ZombieServiceInstance.notifyDie(this);
    });

    for await (const _ of loopTime(Milisecond.t3Seconds, Milisecond.t2Minutes)) {
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
  }

  async update(): Promise<void> {
    if (config.externalIosDeviceAgent.use) {
      return;
    }
    if (!(await this.isHealth())) {
      ZombieServiceInstance.notifyDie(this);
      return;
    }
    await delay(3000);
  }

  onDie(): void {
    this.logger.debug?.(`ZombieIdaXCTest.onDie`);
    this.xctestrun?.kill('ZombieIdaXCTest.onDie');
  }

  private async isHealth(): Promise<boolean> {
    if (!this.xctestrun?.isAlive) {
      this._error = this.xctestrun?.error ?? 'not-alive';
      return false;
    }
    this.xctestrun.update();
    const socketOrError = await this.connectSocket().catch((e: Error) => {
      return e;
    });
    if (socketOrError instanceof Error) {
      this._error = 'connect-failed';
      return false;
    }

    const sendErr = await this.sendHello(socketOrError).catch((e: Error) => {
      return e;
    });
    if (sendErr instanceof Error) {
      this._error = 'hello-failed';
      socketOrError.resetAndDestroy();
      return false;
    }
    this._error = 'none';
    socketOrError.resetAndDestroy();
    return true;
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
          this.logger.error(`ZombieIdaXCTest.sendHello. delay error:${stringifyError(e)}`);
          resolve();
        });
    });
  }

  private async createOrGetSession(): Promise<string | undefined> {
    const sessionId = await this.getSessionId();
    if (sessionId) {
      return sessionId;
    }
    const response = await this.wdaClient.post('/session', JSON.stringify({ capabilities: {} })).catch(() => {
      return undefined;
    });
    if (!response || response.status !== 200) {
      return undefined;
    }
    const newSessionId = _.get(response, 'data.sessionId', undefined) as unknown;
    if (typeof newSessionId !== 'string') {
      return undefined;
    }
    return newSessionId;
  }

  private async getSessionId(): Promise<string | undefined> {
    const response = await this.wdaClient.get('/status').catch(() => {
      return undefined;
    });
    if (!response || response.status !== 200) {
      return undefined;
    }

    const sessionId = _.get(response, 'data.sessionId', undefined) as unknown;
    if (typeof sessionId !== 'string') {
      return undefined;
    }
    return sessionId;
  }

  private async dissmissAlert(sessionId: string | undefined): Promise<void> {
    if (!sessionId) {
      this.logger.warn?.('sessionId is undefined. so skip dismiss alert');
      return;
    }
    await this.wdaClient
      .post(`/session/${sessionId}/alert/dismiss`)
      .then(() => {
        this.logger.info?.('dismiss alert success');
      })
      .catch(() => {
        this.logger.warn?.('dismiss alert failed');
      });
    await this.wdaClient
      .post(`/session/${sessionId}/alert/accept`)
      .then(() => {
        this.logger.info?.('accept alert success');
      })
      .catch(() => {
        this.logger.warn?.('accept alert failed');
      });
  }
}
