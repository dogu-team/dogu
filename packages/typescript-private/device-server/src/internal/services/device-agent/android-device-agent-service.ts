import { DeviceSystemInfo, Platform, PrivateProtocol, Serial, SerialPrintable } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, delay, Milisecond, Printable, stringify, stringifyError } from '@dogu-tech/common';
import { isFreePort, killChildProcess } from '@dogu-tech/node';
import child_process from 'child_process';
import { EventEmitter } from 'stream';
import WebSocket from 'ws';
import { pathMap } from '../../../path-map';
import { AdbSerial } from '../../externals/index';
import { PionStreamingService } from '../streaming/pion-streaming-service';
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

type ResultCallback<ResultValue> = (result: ResultValue | undefined, error: Error | undefined) => void;

export class AndroidDeviceAgentService implements DeviceAgentService, Zombieable {
  private protoWs: WebSocket | undefined = undefined;
  private protoAPIRetEmitter = new ProtoAPIEmitterImpl();
  private seq = 0;
  private zombieWaiter: ZombieQueriable;
  private proc: child_process.ChildProcess | null = null;
  private healthFailCount = 0;
  private _error: 'not stable playing' | 'forward closed' | 'none' = 'none';
  private adb: AdbSerial;

  constructor(
    public readonly serial: Serial,
    private readonly info: DeviceSystemInfo,
    private readonly host: string,
    private readonly port: number,
    private readonly devicePort: number,
    private readonly streamingService: PionStreamingService,
    private readonly logger: SerialPrintable,
  ) {
    this.zombieWaiter = ZombieServiceInstance.addComponent(this);
    this.adb = new AdbSerial(serial, logger);
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

  private closeProtoWs(): void {
    if (!this.protoWs) return;
    closeWebSocketWithTruncateReason(this.protoWs, 1000, 'Device disconnected');
    this.protoWs = undefined;
  }

  private async connect(): Promise<void> {
    const ws = new WebSocket(`ws://127.0.0.1:${this.port}/proto`);
    this.logger.info(`AndroidDeviceAgentService.connect serial: ${this.serial}, ws connecting...`);

    ws.on('open', () => {
      this.closeProtoWs();
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
    return new Promise<ReturnValue | null>((resolve) => {
      this.sendInternal(
        paramKey,
        returnKey,
        paramValue,
        (result: ReturnValue | undefined, error) => {
          if (error) {
            this.logger.error(`AndroidDeviceAgentService.sendInternal error: ${stringify(error)}`);
          }
          if (!result) {
            resolve(null);
            return;
          }
          resolve(result);
        },
        timeout,
      );
    });
  }

  sendInternal<
    ParamKey extends DcDaParamKeys & keyof DcDaParamUnionPick<ParamKey>,
    ReturnKey extends DcDaReturnKeys & keyof DcDaReturnUnionPick<ReturnKey>,
    ParamValue extends DcDaParamUnionPickValue<ParamKey>,
    ReturnValue extends DcDaReturnUnionPickValue<ReturnKey>,
  >(paramKey: ParamKey, returnKey: ReturnKey, paramValue: ParamValue, onResult: ResultCallback<ReturnValue>, timeout = 10000): void {
    let isResolved = false;
    const resolve = (result: ReturnValue | undefined, error: Error | undefined): void => {
      if (isResolved) {
        return;
      }

      isResolved = true;
      onResult(result, error);
    };
    // dcLogger.verbose(`AndroidDeviceAgentService.sendWithProtobuf ${paramKey}`);
    if (!this.protoWs) {
      resolve(undefined, new Error('AndroidDeviceAgentService.sendAndWaitParamResult this.protoWs is null'));
      return;
    }
    const seq = this.getSeq();

    // timeout handle
    setTimeout(() => {
      resolve(undefined, new Error(`AndroidDeviceAgentService.sendWithProtobuf timeout ${timeout}`));
    }, timeout);

    // complete handle
    this.protoAPIRetEmitter.once(seq.toString(), (data: DcDaReturn) => {
      if (data.value?.$case !== returnKey) {
        this.logger.error(`AndroidDeviceAgentService.sendWithProtobuf ${returnKey} is null`);
        resolve(undefined, new Error(`AndroidDeviceAgentService.sendWithProtobuf ${returnKey} is null`));
        return;
      }
      const returnObj = data.value as DcDaReturnUnionPick<ReturnKey>;
      if (returnObj == null) {
        this.logger.error('AndroidDeviceAgentService.sendWithProtobuf returnObj is null');
        resolve(undefined, new Error('AndroidDeviceAgentService.sendWithProtobuf returnObj is null'));
        return;
      }
      resolve(returnObj[returnKey] as ReturnValue, undefined);
    });

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
  }

  async test(): Promise<void> {
    for (let i = 0; i < 100000; i++) {
      this.logger.info(`AndroidDeviceAgentService.test ${i}`);
      const ret = await this.sendWithProtobuf('dcDaQueryProfileParam', 'dcDaQueryProfileReturn', { profileMethods: [] });
      this.logger.info(`AndroidDeviceAgentService.test ${i} ret: ${stringify(ret)}`);
      await delay(1000);
    }
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
    const { serial, port: hostPort, devicePort, logger } = this;
    const pid = await this.adb.getPidOf('app_process');
    if (pid.length !== 0) {
      await this.adb.kill(pid);
    }

    this.logger.info(`AndroidDeviceAgentService.revive start.  id: ${serial}`);

    await this.adb.unforward(hostPort, { ignore: true });
    await this.adb.forward(hostPort, devicePort);

    const proc = await this.adb.runAppProcess(pathMap().common.androidDeviceAgent, '/data/local/tmp/dogu-deviceagent', 'com.dogu.deviceagent.Entry');
    proc.on('exit', (code: number, signal: string) => {
      this.printable.error(`AndroidDeviceAgentService.revive exit. code: ${code}, signal: ${signal}`);
      ZombieServiceInstance.notifyDie(this, `AndroidDeviceAgentService.revive exit. code: ${code}, signal: ${signal}`);
    });
    await this.adb.waitPortOpenInternal(this.devicePort);
    await this.connect();
    this.healthFailCount = 0;
  }

  onDie(reason: string): void {
    if (this.proc) {
      killChildProcess(this.proc).catch((error) => {
        this.logger.error('AndroidDeviceAgentService.onDie killChildProcess', { error });
      });
    }

    this.closeProtoWs();
  }

  async update(): Promise<void> {
    if (!(await this.isHealth())) {
      this.healthFailCount++;
      if (this.healthFailCount > 3) {
        ZombieServiceInstance.notifyDie(this, `AndroidDeviceAgentService.update healthFail`);
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
