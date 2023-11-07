import { OneofUnionTypes, Platform, PrivateProtocol, Serial } from '@dogu-private/types';
import { delay, Printable, SizePrefixedRecvQueue, stringify, SyncClosable } from '@dogu-tech/common';
import EventEmitter from 'events';
import { Socket } from 'net';
import { env } from '../../../env';
import { DeviceAgentService } from '../../services/device-agent/device-agent-service';
import { Zombieable, ZombieProps, ZombieQueriable } from '../zombie/zombie-component';
import { ZombieServiceInstance } from '../zombie/zombie-service';

type DcIdaParam = PrivateProtocol.DcIdaParam;
type DcIdaResult = PrivateProtocol.DcIdaResult;
type DcIdaParamList = PrivateProtocol.DcIdaParamList;
type DcIdaResultList = PrivateProtocol.DcIdaResultList;
const DcIdaParamList = PrivateProtocol.DcIdaParamList;
const DcIdaResultList = PrivateProtocol.DcIdaResultList;

export type DcIdaParamKeys = OneofUnionTypes.UnionValueKeys<DcIdaParam>;
export type DcIdaParamUnionPick<Key> = OneofUnionTypes.UnionValuePick<DcIdaParam, Key>;
export type DcIdaParamUnionPickValue<Key extends keyof DcIdaParamUnionPick<Key>> = OneofUnionTypes.UnionValuePickInner<DcIdaParam, Key>;

export type DcIdaResultKeys = OneofUnionTypes.UnionValueKeys<DcIdaResult>;
export type DcIdaResultUnionPick<Key> = OneofUnionTypes.UnionValuePick<DcIdaResult, Key>;
export type DcIdaResultUnionPickValue<Key extends keyof DcIdaResultUnionPick<Key>> = OneofUnionTypes.UnionValuePickInner<DcIdaResult, Key>;

interface SendOption {
  timeout: number;
}

function DefaultSendOption(): SendOption {
  return { timeout: 10000 };
}

type ResultCallback<ResultValue> = (result: ResultValue | undefined, error: Error | undefined) => void;

const MaxFailCount = 10;

export class IosDeviceAgentService implements DeviceAgentService, Zombieable {
  private readonly client: Socket;
  private protoAPIRetEmitter = new ProtoAPIEmitterImpl();
  private readonly recvQueue = new SizePrefixedRecvQueue();
  private seq = 0;
  private failCount = 0;
  private zombieWaiter: ZombieQueriable;
  public name = 'iOSDeviceAgentService';
  public platform = Platform.PLATFORM_IOS;

  constructor(
    public readonly serial: Serial,
    private readonly screenPort: number,
    private readonly serverPort: number,
    public readonly printable: Printable,
  ) {
    const { printable: logger } = this;
    this.zombieWaiter = ZombieServiceInstance.addComponent(this);
    this.client = new Socket();

    this.client.addListener('connect', () => {
      logger.info('IosDeviceAgentService. client connect');
    });

    this.client.addListener('error', (error: Error) => {
      logger.error(`IosDeviceAgentService. client error: ${stringify(error)}`);
    });

    this.client.addListener('timeout', () => {
      logger.error('IosDeviceAgentService. client timeout');
    });

    this.client.addListener('close', (isError: boolean) => {
      logger.error('IosDeviceAgentService. client close');
      ZombieServiceInstance.notifyDie(this, `IosDeviceAgentService. client close`);
    });

    this.client.addListener('end', () => {
      logger.info('IosDeviceAgentService. client end');
      ZombieServiceInstance.notifyDie(this, `IosDeviceAgentService. client end`);
    });

    this.client.addListener('data', (data: Buffer) => {
      this.recvQueue.pushBuffer(data);
      if (!this.recvQueue.has()) {
        return;
      }
      const array = this.recvQueue.pop();
      const decodeRet = DcIdaResultList.decode(array);
      for (const result of decodeRet.results) {
        this.protoAPIRetEmitter.emit(result.seq.toString(), result);
      }
    });
  }

  async wait(): Promise<void> {
    await this.zombieWaiter?.waitUntilAlive();
  }

  async revive(): Promise<void> {
    await this.connect();
    await this.send('dcIdaSwitchInputBlockParam', 'dcIdaSwitchInputBlockResult', { isBlock: env.DOGU_IS_DEVICE_SHARE === true });
  }

  onDie(reason: string): void | Promise<void> {
    const { printable: logger } = this;
    this.protoAPIRetEmitter.removeAllListeners();
    try {
      this.client.resetAndDestroy();
    } catch (e) {
      logger.error(`IosDeviceAgentService.onDie reset error: ${stringify(e)}`);
    }
  }

  delete(): void {
    ZombieServiceInstance.deleteComponent(this);
  }

  get props(): ZombieProps {
    return { serverPort: this.serverPort };
  }

  get screenUrl(): string {
    return `127.0.0.1:${this.screenPort}`;
  }

  get inputUrl(): string {
    return `127.0.0.1:${this.serverPort}`;
  }

  get isAlive(): boolean {
    return this.zombieWaiter.isAlive();
  }

  async send<
    ParamKey extends DcIdaParamKeys & keyof DcIdaParamUnionPick<ParamKey>,
    ResultKey extends DcIdaResultKeys & keyof DcIdaResultUnionPick<ResultKey>,
    ParamValue extends DcIdaParamUnionPickValue<ParamKey>,
    ResultValue extends DcIdaResultUnionPickValue<ResultKey>,
  >(paramKey: ParamKey, resultKey: ResultKey, paramValue: ParamValue, option: SendOption = DefaultSendOption()): Promise<ResultValue | undefined> {
    const { printable: logger } = this;
    return new Promise<ResultValue | undefined>((resolve) => {
      const closable = this.sendInternal(
        paramKey,
        resultKey,
        paramValue,
        (result: ResultValue | undefined, error) => {
          closable.close();
          if (error) {
            logger.error(`IosDeviceAgentService.sendInternal error: ${stringify(error)}`);
          }
          resolve(result);
        },
        option,
      );
    });
  }

  private sendInternal<
    ParamKey extends DcIdaParamKeys & keyof DcIdaParamUnionPick<ParamKey>,
    ResultKey extends DcIdaResultKeys & keyof DcIdaResultUnionPick<ResultKey>,
    ParamValue extends DcIdaParamUnionPickValue<ParamKey>,
    ResultValue extends DcIdaResultUnionPickValue<ResultKey>,
  >(paramKey: ParamKey, resultKey: ResultKey, paramValue: ParamValue, onResult: ResultCallback<ResultValue>, option: SendOption = DefaultSendOption()): SyncClosable {
    const { printable: logger } = this;
    let isResolved = false;

    const seq = this.getSeq();
    const closable = { close: () => this.protoAPIRetEmitter.removeAllListeners(seq.toString()) };

    const resolve = (result: ResultValue | undefined, error: Error | undefined): void => {
      if (isResolved) {
        return;
      }
      if (error) {
        this.failCount += 1;
        if (this.failCount >= MaxFailCount) {
          ZombieServiceInstance.notifyDie(this, `IosDeviceAgentService.sendWithProtobuf over MaxFailCount ${this.failCount}`);
        }
      }
      isResolved = true;
      onResult(result, error);
    };
    if (!this.client) {
      resolve(undefined, new Error('IosDeviceAgentService.sendWithProtobuf this.client is null'));
      return closable;
    }

    // complete handle
    this.protoAPIRetEmitter.on(seq.toString(), (data: DcIdaResult) => {
      if (data.value?.$case !== resultKey) {
        resolve(undefined, new Error(`IosDeviceAgentService.sendWithProtobuf ${resultKey} is null`));
        return closable;
      }
      const returnObj = data.value as DcIdaResultUnionPick<ResultKey>;
      resolve(returnObj[resultKey] as ResultValue, undefined);
    });

    // timeout handle
    setTimeout(() => {
      resolve(undefined, new Error(`IosDeviceAgentService.sendWithProtobuf timeout ${option.timeout}`));
    }, option.timeout);

    // request
    const paramObj = {
      $case: paramKey,
      [paramKey]: paramValue,
    } as unknown as DcIdaParamUnionPick<ParamKey>;
    this.client.write(buildParam(seq, paramObj), (error) => {
      if (!error) {
        return;
      }
      ZombieServiceInstance.notifyDie(this, `IosDeviceAgentService. write failed ${stringify(error)}`);
    });
    return closable;
  }

  private async connect(tryCount = 10): Promise<void> {
    const { printable: logger } = this;
    this.recvQueue.clear();
    logger.info(`IosDeviceAgentService.connect ${this.serverPort}`);
    if (this.client.connecting) {
      throw new Error('IosDeviceAgentService.already connected');
    }

    for (let i = 0; i < tryCount; i++) {
      const isConnected = await new Promise<boolean>((resolve, reject) => {
        this.client.prependOnceListener('error', (isError: boolean) => {
          resolve(false);
        });
        this.client.connect({ host: '127.0.0.1', port: this.serverPort }, () => {
          resolve(true);
        });
      });
      if (!isConnected) {
        logger.warn?.(`IosDeviceAgentService. connect failed. count: ${i}`);
        await delay(1000);
        continue;
      }
      return;
    }
    throw new Error('IosDeviceAgentService.connect. notconnected');
  }

  private getSeq(): number {
    const ret = this.seq;
    this.seq += 1;
    return ret;
  }
}

interface ProtoAPIEmitter {
  once(eventName: string, listener: (data: DcIdaResult) => void): EventEmitter;
}

class ProtoAPIEmitterImpl extends EventEmitter implements ProtoAPIEmitter {}

function buildParam<ParamKey extends DcIdaParamKeys & keyof DcIdaParamUnionPick<ParamKey>>(seq: number, paramObj: DcIdaParamUnionPick<ParamKey>): Buffer {
  const castedParam: DcIdaParam = {
    seq: seq,
    value: paramObj,
  };
  const castedParamList: DcIdaParamList = {
    params: [castedParam],
  };
  const message = DcIdaParamList.encode(castedParamList).finish();
  const sizeBuffer = Buffer.alloc(4);
  sizeBuffer.writeUInt32LE(message.byteLength, 0);

  const bufferConcated = Buffer.concat([sizeBuffer, Buffer.from(message)]);
  return bufferConcated;
}
