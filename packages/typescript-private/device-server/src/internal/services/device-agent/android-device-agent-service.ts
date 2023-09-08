import { DeviceSystemInfo, Platform, PrivateProtocol, Serial } from '@dogu-private/types';
import { Printable, stringifyError } from '@dogu-tech/common';
import { killChildProcess } from '@dogu-tech/node';
import child_process from 'child_process';
import { EventEmitter } from 'stream';
import WebSocket from 'ws';
import { logger } from '../../../logger/logger.instance';
import { pathMap } from '../../../path-map';
import { Adb, AdbUtil } from '../../externals/index';
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

  constructor(
    public readonly serial: Serial,
    private readonly info: DeviceSystemInfo,
    private readonly host: string,
    private readonly port: number,
    private readonly devicePort: number,
    private readonly logger: Printable,
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
      logger.error(`AndroidDeviceAgentService.connect ws error: ${stringifyError(err)}`);
    });

    ws.on('close', (err: Error) => {
      logger.error(`AndroidDeviceAgentService.connect ws clpsed: ${stringifyError(err)}`);
      ZombieServiceInstance.notifyDie(this, `AndroidDeviceAgentService.connect ws clpsed: ${stringifyError(err)}`);
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
        logger.error('AndroidDeviceAgentService.sendAndWaitParamResult this.protoWs is null');
        return null;
      }
      const seq = this.getSeq();

      // complete handle
      this.protoAPIRetEmitter.once(seq.toString(), (data: DcDaReturn) => {
        if (data.value?.$case !== returnKey) {
          logger.error(`AndroidDeviceAgentService.sendWithProtobuf ${returnKey} is null`);
          resolve(null);
          return;
        }
        const returnObj = data.value as DcDaReturnUnionPick<ReturnKey>;
        if (returnObj == null) {
          logger.error('AndroidDeviceAgentService.sendWithProtobuf returnObj is null');
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
    return { hostPort: this.port, devicePort: this.devicePort };
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

    logger.verbose(`AndroidDeviceAgentService.revive start.  id: ${serial}`);

    await Adb.unforward(serial, hostPort, { ignore: true });
    await Adb.forward(serial, hostPort, devicePort);

    const proc = await Adb.runAppProcess(serial, pathMap().common.androidDeviceAgent, '/data/local/tmp/dogu-deviceagent', 'com.dogu.deviceagent.Entry', this.printable);
    proc.on('exit', (code: number, signal: string) => {
      this.printable.verbose?.(`AndroidDeviceAgentService.revive exit. code: ${code}, signal: ${signal}`);
      ZombieServiceInstance.notifyDie(this);
    });
    await AdbUtil.waitPortOpenInternal(this.serial, this.devicePort);
    await this.connect();
  }

  onDie(): void {
    if (this.proc) {
      killChildProcess(this.proc).catch((error) => {
        this.logger.error('AndroidDeviceAgentService killChildProcess', { error });
      });
    }
  }

  isAlive(): boolean {
    return this.zombieWaiter.isAlive();
  }
}

interface ProtoAPIEmitter {
  once(eventName: string, listener: (data: DcDaReturn) => void): EventEmitter;
}

class ProtoAPIEmitterImpl extends EventEmitter implements ProtoAPIEmitter {}
