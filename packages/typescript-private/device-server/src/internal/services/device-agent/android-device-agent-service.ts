import { DeviceSystemInfo, Platform, PrivateProtocol, Serial } from '@dogu-private/types';
import { delay, FilledPrintable, Milisecond, Printable, stringifyError } from '@dogu-tech/common';
import { isFreePort, killChildProcess } from '@dogu-tech/node';
import child_process from 'child_process';
import { EventEmitter } from 'stream';
import WebSocket from 'ws';
import { pathMap } from '../../../path-map';
import { Adb, AdbUtil } from '../../externals/index';
import { StreamingService } from '../streaming/streaming-service';
import { Zombieable, ZombieProps, ZombieQueriable } from '../zombie/zombie-component';
import { ZombieServiceInstance } from '../zombie/zombie-service';
import {
  DcDaParamKeys,
  DcDaParamUnionPick,
  DcDaParamUnionPickValue,
  DcDaReturnKeys,
  DcDaReturnUnionPick,
  DcDaReturnUnionPickValue,
  DeviceAgentService,
} from './device-agent-service';

type DcDaParam = PrivateProtocol.DcDaParam;
type DcDaReturn = PrivateProtocol.DcDaReturn;
const DcDaParam = PrivateProtocol.DcDaParam;
const DcDaReturn = PrivateProtocol.DcDaReturn;

export class AndroidDeviceAgentService implements DeviceAgentService, Zombieable {
  private protoWs: WebSocket | undefined = undefined;
  private protoAPIRetEmitter = new ProtoAPIEmitterImpl();
  private seq = 0;
  private zombieWaiter: ZombieQueriable;
  private proc: child_process.ChildProcess | null = null;
  private healthFailCount = 0;
  private _error: 'not stable playing' | 'forward closed' | 'none' = 'none';

  constructor(
    public readonly serial: Serial,
    private readonly info: DeviceSystemInfo,
    private readonly host: string,
    private readonly port: number,
    private readonly devicePort: number,
    private readonly streamingService: StreamingService,
    private readonly logger: FilledPrintable,
  ) {
    this.zombieWaiter = ZombieServiceInstance.addComponent(this);
  }

  get screenUrl(): string {
    return `ws://127.0.0.1:${this.port}/stream`;
  }

  get inputUrl(): string {
    return `ws://127.0.0.1:${this.port}/cf_gdc_da_proto`;
  }

  async wait(): Promise<void> {
    await this.zombieWaiter?.waitUntilAlive();
  }

  private async connect(): Promise<void> {
    const ws = new WebSocket(`ws://127.0.0.1:${this.port}/proto`);
    this.logger.info(`AndroidDeviceAgentService.connect serial: ${this.serial}, ws connecting...`);

    ws.on('open', () => {
      this.protoWs = ws;
      this.protoWs.on('message', (data) => this.onMessage(data));
      const seq = this.getSeq();
      const param: DcDaParam = {
        seq: seq,
        value: {
          $case: 'dcDaConnectionParam',
          dcDaConnectionParam: { version: '1.0.0', nickname: this.info.nickname },
        },
      };
      const buffer = DcDaParam.encode(param).finish();

      ws.send(buffer);
    });
    ws.on('error', (err: Error) => {
      this.logger.error(`AndroidDeviceAgentService.connect serial: ${this.serial}, ws error: ${stringifyError(err)}`);
    });

    ws.on('close', (err: Error) => {
      this.logger.error(`AndroidDeviceAgentService.connect serial: ${this.serial}, ws closed: ${stringifyError(err)}`);
      ZombieServiceInstance.notifyDie(this, `AndroidDeviceAgentService.connect ws closed: ${stringifyError(err)}`);
    });

    return Promise.resolve();
  }

  async sendWithProtobuf<
    ParamKey extends DcDaParamKeys & keyof DcDaParamUnionPick<ParamKey>,
    ReturnKey extends DcDaReturnKeys & keyof DcDaReturnUnionPick<ReturnKey>,
    ParamValue extends DcDaParamUnionPickValue<ParamKey>,
    ReturnValue extends DcDaReturnUnionPickValue<ReturnKey>,
  >(paramKey: ParamKey, returnKey: ReturnKey, paramValue: ParamValue, timeout = 10000): Promise<ReturnValue | null> {
    // dcLogger.verbose(`AndroidDeviceAgentService.sendWithProtobuf ${paramKey}`);
    return new Promise((resolve) => {
      if (!this.protoWs) {
        this.logger.error('AndroidDeviceAgentService.sendAndWaitParamResult this.protoWs is null');
        return null;
      }
      const seq = this.getSeq();

      // complete handle
      this.protoAPIRetEmitter.once(seq.toString(), (data: DcDaReturn) => {
        if (data.value?.$case !== returnKey) {
          this.logger.error(`AndroidDeviceAgentService.sendWithProtobuf ${returnKey} is null`);
          resolve(null);
          return;
        }
        const returnObj = data.value as DcDaReturnUnionPick<ReturnKey>;
        if (returnObj == null) {
          this.logger.error('AndroidDeviceAgentService.sendWithProtobuf returnObj is null');
          resolve(null);
          return;
        }
        resolve(returnObj[returnKey] as ReturnValue);
      });

      // timeout handle
      setTimeout(() => {
        resolve(null);
      }, timeout);

      // request
      const paramObj = {
        $case: paramKey,
        [paramKey]: paramValue,
      } as unknown as DcDaParamUnionPick<ParamKey>;

      const castedParam: DcDaParam = {
        seq: seq,
        value: paramObj,
      };
      const buffer = DcDaParam.encode(castedParam).finish();
      // logger.verbose(`AndroidDeviceAgentService.sendWithProtobuf size : ${buffer.byteLength}`);
      this.protoWs.send(buffer);
    });
  }

  async test(): Promise<void> {
    const ret = await this.sendWithProtobuf('dcDaConnectionParam', 'dcDaConnectionReturn', {
      version: '1.0.0',
      nickname: 'asd',
    });
    if (!ret) return;
    return;
  }

  private onMessage(data: WebSocket.Data): void {
    // logger.verbose(`AndroidDeviceAgentService.onMessage: size: ${(data as Buffer).length}`);
    const decodeRet = DcDaReturn.decode(data as Uint8Array);

    this.protoAPIRetEmitter.emit(decodeRet.seq.toString(), decodeRet);
  }

  private getSeq(): number {
    const ret = this.seq;
    this.seq += 1;
    return ret;
  }

  get name(): string {
    return `AndroidDeviceAgentService`;
  }
  get platform(): Platform {
    return Platform.PLATFORM_ANDROID;
  }
  get props(): ZombieProps {
    return { hostPort: this.port, devicePort: this.devicePort, error: this._error };
  }
  get printable(): Printable {
    return this.logger;
  }
  async revive(): Promise<void> {
    const serial = this.serial;
    const hostPort = this.port;
    const devicePort = this.devicePort;
    const pid = await Adb.getPidOf(serial, 'app_process');
    if (pid.length !== 0) {
      await Adb.kill(serial, pid);
    }

    this.logger.info(`AndroidDeviceAgentService.revive start.  id: ${serial}`);

    await Adb.unforward(serial, hostPort, { ignore: true });
    await Adb.forward(serial, hostPort, devicePort);

    const proc = await Adb.runAppProcess(serial, pathMap().common.androidDeviceAgent, '/data/local/tmp/dogu-deviceagent', 'com.dogu.deviceagent.Entry', this.printable);
    proc.on('exit', (code: number, signal: string) => {
      this.printable.error(`AndroidDeviceAgentService.revive exit. code: ${code}, signal: ${signal}`);
      ZombieServiceInstance.notifyDie(this);
    });
    await AdbUtil.waitPortOpenInternal(this.serial, this.devicePort);
    await this.connect();
    this.healthFailCount = 0;
  }

  onDie(): void {
    if (this.proc) {
      killChildProcess(this.proc).catch((error) => {
        this.logger.error('AndroidDeviceAgentService killChildProcess', { error });
      });
    }
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

  private async isHealth(): Promise<boolean> {
    const isFree = await isFreePort(this.port);
    if (isFree) {
      this._error = 'forward closed';
      return false;
    }

    const surfaceStatus = await this.streamingService.getSurfaceStatus(this.serial).catch(() => {
      return { hasSurface: null };
    });
    if (surfaceStatus.hasSurface && surfaceStatus.isPlaying && surfaceStatus.lastFrameDeltaMillisec > Milisecond.t30Seconds) {
      this._error = 'not stable playing';
      return false;
    }
    return true;
  }

  delete(): void {
    ZombieServiceInstance.deleteComponent(this);
  }

  isAlive(): boolean {
    return this.zombieWaiter.isAlive();
  }
}

interface ProtoAPIEmitter {
  once(eventName: string, listener: (data: DcDaReturn) => void): EventEmitter;
}

class ProtoAPIEmitterImpl extends EventEmitter implements ProtoAPIEmitter {}
