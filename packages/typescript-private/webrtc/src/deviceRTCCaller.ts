import { EventEmitter } from 'events';

import { OneofUnionTypes, PrivateProtocol, Serial } from '@dogu-private/types';
import { SizePrefixedRecvQueue, Uint8ArrayUtil } from '@dogu-tech/common';

type CfGdcDaParam = PrivateProtocol.CfGdcDaParam;
type CfGdcDaResult = PrivateProtocol.CfGdcDaResult;
type CfGdcDaParamList = PrivateProtocol.CfGdcDaParamList;
const CfGdcDaParamList = PrivateProtocol.CfGdcDaParamList;
const CfGdcDaResultList = PrivateProtocol.CfGdcDaResultList;

declare type CfGdcDaParamKeys = OneofUnionTypes.UnionValueKeys<CfGdcDaParam>;
declare type CfGdcDaParamUnionPick<Key> = OneofUnionTypes.UnionValuePick<CfGdcDaParam, Key>;
declare type CfGdcDaParamUnionPickValue<Key extends keyof CfGdcDaParamUnionPick<Key>> = OneofUnionTypes.UnionValuePickInner<CfGdcDaParam, Key>;

declare type CfGdcDaResultKeys = OneofUnionTypes.UnionValueKeys<CfGdcDaResult>;
declare type CfGdcDaResultUnionPick<Key> = OneofUnionTypes.UnionValuePick<CfGdcDaResult, Key>;
declare type CfGdcDaResultUnionPickValue<Key extends keyof CfGdcDaResultUnionPick<Key>> = OneofUnionTypes.UnionValuePickInner<CfGdcDaResult, Key>;

const REQUEST_TIMEOUT = 6000;

export class DeviceRTCCaller {
  private seq = 0;
  private protoAPIRetEmitter = new ProtoAPIEmitter();
  private sendBuffer: CfGdcDaParam[] = [];
  private lastSendTimeMs = 0;
  private flushTimer: NodeJS.Timeout | null = null;
  private sendThrottleMs = 0;
  private readonly recvQueue = new SizePrefixedRecvQueue();
  public isOpened = false;

  constructor(
    private readonly serial: Serial,
    readonly channel: RTCDataChannel,
  ) {
    channel.addEventListener('open', (event) => {
      this.onOpen();
    });
    channel.addEventListener('close', (event) => {
      this.onClose();
    });
    channel.addEventListener('message', (event) => {
      this.onMessage(event);
    });
  }

  setSendThrottleMs(ms: number): void {
    this.sendThrottleMs = ms;
  }

  call<
    ParamKey extends CfGdcDaParamKeys & keyof CfGdcDaParamUnionPick<ParamKey>,
    ResultKey extends CfGdcDaResultKeys & keyof CfGdcDaResultUnionPick<ResultKey>,
    ParamValue extends CfGdcDaParamUnionPickValue<ParamKey>,
    ResultValue extends CfGdcDaResultUnionPickValue<ResultKey>,
  >(paramKey: ParamKey, returnKey: ResultKey, paramValue: ParamValue): Promise<ResultValue | null> {
    return new Promise((resolve, reject) => {
      const seq = this.getSeq();
      const startTime = Date.now();

      // timeout handle
      const timeout = setTimeout(() => {
        console.error(`DeviceRTCCaller.call ${seq} timeout. after ${REQUEST_TIMEOUT}ms`);
        resolve(null);
      }, REQUEST_TIMEOUT);
      const resolveWithCleartimeout = (data: Parameters<typeof resolve>[0]): void => {
        clearTimeout(timeout);
        resolve(data);
      };

      // complete handle
      this.protoAPIRetEmitter.once(seq.toString(), (data: CfGdcDaResult) => {
        if (data.value?.$case !== returnKey) {
          console.error(`DeviceRTCCaller.call ${returnKey} is null`);
          resolveWithCleartimeout(null);
          return;
        }
        const returnObj = data.value as CfGdcDaResultUnionPick<ResultKey>;
        if (returnObj == null) {
          console.error('DeviceRTCCaller.call returnObj is null');
          resolveWithCleartimeout(null);
          return;
        }
        console.debug(`DeviceRTCCaller.call resolve `, { seq, time: Date.now() - startTime, obj: returnObj[returnKey] });
        resolveWithCleartimeout(returnObj[returnKey] as ResultValue);
      });

      // request
      const paramObj = {
        $case: paramKey,
        [paramKey]: paramValue,
      } as unknown as CfGdcDaParamUnionPick<ParamKey>;

      const castedParam: CfGdcDaParam = {
        seq: seq,
        serial: this.serial,
        value: paramObj,
      };
      this.sendBuffer.push(castedParam);
      this.requestFlushSendBuffer();
    });
  }

  private getSeq(): number {
    const ret = this.seq;
    this.seq += 1;
    return ret;
  }

  private onOpen(): void {
    this.isOpened = true;
    return;
  }

  private onClose(): void {
    this.isOpened = false;
    return;
  }

  private onMessage(e: MessageEvent): void {
    this.recvQueue.pushBuffer(new Uint8Array(e.data as ArrayBuffer));
    if (!this.recvQueue.has()) {
      return;
    }
    const buf = this.recvQueue.pop();
    const decodeRet = CfGdcDaResultList.decode(buf);

    for (const result of decodeRet.results) {
      this.protoAPIRetEmitter.emit(result.seq.toString(), result);
    }
  }

  private requestFlushSendBuffer(): void {
    if (!this.isOpened) {
      return;
    }
    if (Date.now() - this.lastSendTimeMs < this.sendThrottleMs) {
      if (this.flushTimer) {
        return;
      }
      this.flushTimer = setTimeout(() => {
        this.flushTimer = null;
        this.requestFlushSendBuffer();
      }, this.sendThrottleMs);
      return;
    }
    const paramList: CfGdcDaParamList = {
      params: this.sendBuffer,
    };

    const buffers = Uint8ArrayUtil.prefixSizeAndSplitBuffer(CfGdcDaParamList.encode(paramList).finish());
    for (const buf of buffers) {
      this.channel.send(buf);
    }
    this.sendBuffer = [];
    this.lastSendTimeMs = Date.now();
  }
}

interface IProtoAPIEmitter {
  once(eventName: string, listener: (data: CfGdcDaResult) => void): EventEmitter;
}

class ProtoAPIEmitter extends EventEmitter implements IProtoAPIEmitter {}
