import { OneofUnionTypes, PrivateProtocol } from '@dogu-private/types';
import { IosDeviceAgentServiceService } from '@dogu-private/types/protocol/generated/tsproto/inner/grpc/services/ios_device_agent_service';
import { delay, Printable, SizePrefixedRecvQueue, stringify } from '@dogu-tech/common';
import EventEmitter from 'events';
import { Socket } from 'net';
import { DeviceAgentService } from '../../services/device-agent/device-agent-service';

type DcIdaParam = PrivateProtocol.DcIdaParam;
type DcIdaResult = PrivateProtocol.DcIdaResult;
type DcIdaParamList = PrivateProtocol.DcIdaParamList;
type DcIdaResultList = PrivateProtocol.DcIdaResultList;
const DcIdaParamList = PrivateProtocol.DcIdaParamList;
const DcIdaResultList = PrivateProtocol.DcIdaResultList;

type DcIdaRunAppParam = PrivateProtocol.DcIdaRunAppParam;
type DcIdaRunAppResult = PrivateProtocol.DcIdaRunAppResult;

export type DcIdaParamKeys = OneofUnionTypes.UnionValueKeys<DcIdaParam>;
export type DcIdaParamUnionPick<Key> = OneofUnionTypes.UnionValuePick<DcIdaParam, Key>;
export type DcIdaParamUnionPickValue<Key extends keyof DcIdaParamUnionPick<Key>> = OneofUnionTypes.UnionValuePickInner<DcIdaParam, Key>;

export type DcIdaResultKeys = OneofUnionTypes.UnionValueKeys<DcIdaResult>;
export type DcIdaResultUnionPick<Key> = OneofUnionTypes.UnionValuePick<DcIdaResult, Key>;
export type DcIdaResultUnionPickValue<Key extends keyof DcIdaResultUnionPick<Key>> = OneofUnionTypes.UnionValuePickInner<DcIdaResult, Key>;

const ServiceDefenition = IosDeviceAgentServiceService;

export class IosDeviceAgentService implements DeviceAgentService {
  private readonly client: Socket;
  private protoAPIRetEmitter = new ProtoAPIEmitterImpl();
  private readonly recvQueue = new SizePrefixedRecvQueue();
  private isConnected: boolean;
  private seq = 0;

  constructor(private readonly screenPort: number, private readonly serverPort: number, timeoutSeconds: number, private readonly logger: Printable) {
    this.client = new Socket();
    this.isConnected = false;

    this.client.on('connect', () => {
      logger.debug?.('IosDeviceAgentService. client connect');
      this.isConnected = true;
    });

    this.client.on('error', (error: Error) => {
      logger.error(`IosDeviceAgentService. client error: ${stringify(error)}`);
    });

    this.client.on('timeout', () => {
      logger.error('IosDeviceAgentService. client timeout');
    });

    this.client.on('close', (isError: boolean) => {
      logger.error('IosDeviceAgentService. client close');
      this.isConnected = false;
    });

    this.client.on('end', () => {
      logger.debug?.('IosDeviceAgentService. client end');
      this.isConnected = false;
    });

    this.client.on('data', (data: Buffer) => {
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
  get screenUrl(): string {
    return `127.0.0.1:${this.screenPort}`;
  }

  get inputUrl(): string {
    return `127.0.0.1:${this.serverPort}`;
  }

  get connected(): boolean {
    return this.isConnected;
  }

  install(): Promise<void> {
    return Promise.resolve();
  }

  async connect(tryCount = 10): Promise<void> {
    const { logger } = this;
    logger.info(`IosDeviceAgentService.connect ${this.serverPort}`);
    if (this.client.connecting) {
      throw new Error('IosDeviceAgentService.already connected');
    }

    for (let i = 0; i < tryCount; i++) {
      const isConnected = await new Promise<boolean>((resolve, reject) => {
        this.client.once('close', (isError: boolean) => {
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

  async sendWithProtobuf<
    ParamKey extends DcIdaParamKeys & keyof DcIdaParamUnionPick<ParamKey>,
    ResultKey extends DcIdaResultKeys & keyof DcIdaResultUnionPick<ResultKey>,
    ParamValue extends DcIdaParamUnionPickValue<ParamKey>,
    ResultValue extends DcIdaResultUnionPickValue<ResultKey>,
  >(paramKey: ParamKey, resultKey: ResultKey, paramValue: ParamValue, timeout = 10000): Promise<ResultValue | null> {
    const { logger } = this;
    return new Promise((resolve) => {
      if (!this.client) {
        logger.error('IosDeviceAgentService.sendWithProtobuf this.client is null');
        return null;
      }
      const seq = this.getSeq();

      // complete handle
      this.protoAPIRetEmitter.once(seq.toString(), (data: DcIdaResult) => {
        if (data.value?.$case !== resultKey) {
          logger.error(`IosDeviceAgentService.sendWithProtobuf ${resultKey} is null`);
          resolve(null);
          return;
        }
        const returnObj = data.value as DcIdaResultUnionPick<ResultKey>;
        if (returnObj == null) {
          logger.error('IosDeviceAgentService.sendWithProtobuf returnObj is null');
          resolve(null);
          return;
        }
        resolve(returnObj[resultKey] as ResultValue);
      });

      // timeout handle
      setTimeout(() => {
        resolve(null);
      }, timeout);

      // request
      const paramObj = {
        $case: paramKey,
        [paramKey]: paramValue,
      } as unknown as DcIdaParamUnionPick<ParamKey>;

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
      this.client.write(bufferConcated);
    });
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
