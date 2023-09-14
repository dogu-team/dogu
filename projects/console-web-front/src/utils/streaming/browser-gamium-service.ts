import { delay, SizePrefixedRecvQueue, stringifyError } from '@dogu-tech/common';
import EventEmitter from 'events';
import * as flatbuffers from 'flatbuffers';
import { createHello, ErrorCode, GamiumError, GamiumProtocol, GamiumService, PacketTypes } from 'gamium/common';

const _dummyReq = new GamiumProtocol.RequestT();
const _dummyRes = new GamiumProtocol.ResponseT();
declare type GcGaParamTypes = NonNullable<typeof _dummyReq.param>;
declare type GcGaResultTypes = NonNullable<typeof _dummyRes.result>;

export enum RequestPriority {
  Low = 0,
  High = 1,
}

export class BrowserGamiumService implements GamiumService {
  private readonly responseEmitter = new ResponseEmitter();
  private readonly recvQueue = new SizePrefixedRecvQueue();
  private sendBuffer: GamiumProtocol.RequestT[] = [];
  private sendThrottleMs = 0;
  private discardExceptLastone = true;
  private lastSendTimeMs = 0;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private requestPriorities = new Map<GamiumProtocol.Param, RequestPriority>();

  get connected(): boolean {
    return this.isConnected;
  }
  private isConnected: boolean;
  private seq = 0;

  constructor(
    public readonly channel: RTCDataChannel,
    private readonly requestTimeout: number = 50000,
  ) {
    this.isConnected = false;

    channel.addEventListener('open', (event) => {
      this.isConnected = true;
    });
    channel.addEventListener('message', (event) => {
      this.recvQueue.pushBuffer(new Uint8Array(event.data as ArrayBuffer));
      if (!this.recvQueue.has()) {
        return;
      }
      const array = this.recvQueue.pop();
      const buf = new flatbuffers.ByteBuffer(array);
      const responseByteBuffer = GamiumProtocol.Response.getRootAsResponse(buf);
      const response = responseByteBuffer.unpack();
      this.responseEmitter.emit(response.seq.toString(), response);
    });
    channel.addEventListener('close', (event) => {
      console.debug('GamiumEngineService. client end');
      this.isConnected = false;
    });
  }

  setSendThrottleMs(ms: number): void {
    this.sendThrottleMs = ms;
  }

  setRequestPriority(paramType: GamiumProtocol.Param, priority: RequestPriority): void {
    this.requestPriorities.set(paramType, priority);
  }

  setDiscardExceptLastone(flag: boolean): void {
    this.discardExceptLastone = flag;
  }

  async connect(tryCount = 30): Promise<GamiumProtocol.HelloResultT> {
    console.info(`GamiumEngineService.connect `);
    if (this.isConnected) {
      throw new GamiumError(ErrorCode.InternalError, 'already connected');
    }

    for (let i = 0; i < tryCount; i++) {
      try {
        const helloRes = await this.request(createHello({ version: '1.0.0' }), { timeout: 1000 });
        console.info(`GamiumEngineService. hello success. ${JSON.stringify(helloRes)}`);
        return helloRes;
      } catch (err) {
        console.warn(`GamiumEngineService. hello failed. cont: ${i}, error:${stringifyError(err)}`);
      }

      await delay(1000);
    }
    throw new GamiumError(ErrorCode.Disconnected, 'notconnected');
  }
  disconnect(): void {
    this.channel.close();
  }

  request<P extends GcGaParamTypes, R extends GcGaResultTypes>(
    packet: PacketTypes<P, R>,
    options: { timeout: number } = { timeout: this.requestTimeout },
  ): Promise<R> {
    return new Promise((resolve, reject) => {
      const befAsyncError = new Error('GamiumEngineService.request');
      if (!this.isConnected) {
        throw new GamiumError(ErrorCode.Disconnected, 'notconnected');
      }

      if (this.channel.readyState !== 'open') {
        throw new GamiumError(ErrorCode.Disconnected, 'not opened');
      }

      const seq = this.getSeq();

      // timeout handle
      const timeout = setTimeout(() => {
        console.error(`GamiumEngineService. request timeout: ${seq}`);
        reject(
          new GamiumError(ErrorCode.Timeout, 'request timeout', undefined, {
            cause: befAsyncError,
          }),
        );
      }, options.timeout);

      // complete handle
      this.onceResponseHandler(packet, seq, timeout, resolve, reject, befAsyncError);

      // request
      const requestObj = new GamiumProtocol.RequestT(seq, packet.paramEnum, packet.param);
      this.sendBuffer.push(requestObj);
      this.requestFlushSendBuffer();
      console.debug(`GamiumEngineService. request: ${JSON.stringify(requestObj).substring(0, 300)} >> `);
    });
  }

  private onceResponseHandler<Packet extends PacketTypes<P, R>, P extends GcGaParamTypes, R extends GcGaResultTypes>(
    packet: Packet,
    seq: number,
    timeout: NodeJS.Timeout,
    resolve: (value: R | PromiseLike<R>) => void,
    reject: (err: Error) => void,
    befAsyncError: Error,
  ): void {
    this.responseEmitter.once(seq.toString(), (response: GamiumProtocol.ResponseT) => {
      console.debug(`GamiumEngineService. response: ${JSON.stringify(response).substring(0, 300)} >> `);
      if (response.error == null) {
        clearTimeout(timeout);
        reject(
          new GamiumError(ErrorCode.InternalError, 'request response error is null', undefined, {
            cause: befAsyncError,
          }),
        );
        return;
      }
      if (response.error.code !== ErrorCode.None) {
        clearTimeout(timeout);
        reject(
          new GamiumError(response.error.code, response.error.reason as string, undefined, {
            cause: befAsyncError,
          }),
        );
        return;
      }
      if (response.resultType !== packet.resultEnum) {
        clearTimeout(timeout);
        reject(
          new GamiumError(
            ErrorCode.InternalError,
            `request resultType(${response.resultType}) is not ${packet.resultEnum}`,
            undefined,
            { cause: befAsyncError },
          ),
        );
        return;
      }

      console.debug(`GamiumEngineService. request: ${seq}, ${packet.paramEnum} done << `);
      const resultObj = response.result as R;
      if (resultObj == null) {
        clearTimeout(timeout);
        reject(
          new GamiumError(ErrorCode.InternalError, 'request resultObj is null', undefined, {
            cause: befAsyncError,
          }),
        );
        return;
      }
      clearTimeout(timeout);
      resolve(resultObj);
    });
  }

  private getSeq(): number {
    const ret = this.seq;
    this.seq += 1;
    return ret;
  }

  private requestFlushSendBuffer(): void {
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
    if (0 == this.sendBuffer.length) {
      return;
    }

    let shouldSendReqs: GamiumProtocol.RequestT[] = [];
    const discardedReqs: GamiumProtocol.RequestT[] = [];
    if (this.discardExceptLastone) {
      shouldSendReqs.push(this.sendBuffer[this.sendBuffer.length - 1]);

      for (let i = 0; i < this.sendBuffer.length - 1; i++) {
        if (this.requestPriorities.get(this.sendBuffer[i].paramType) === RequestPriority.High) {
          shouldSendReqs.push(this.sendBuffer[i]);
        } else {
          discardedReqs.push(this.sendBuffer[i]);
        }
      }
    } else {
      shouldSendReqs = this.sendBuffer;
    }

    for (const req of shouldSendReqs) {
      this.channel.send(buildRequest(req));
    }
    for (const discardReq of discardedReqs) {
      this.responseEmitter.emit(
        discardReq.seq.toString(),
        new GamiumProtocol.ResponseT(
          discardReq.seq,
          new GamiumProtocol.ErrorResultT(ErrorCode.InternalError, 'request discarded'),
        ),
      );
    }

    this.sendBuffer = [];
    this.lastSendTimeMs = Date.now();
  }
}

function buildRequest(requestObj: GamiumProtocol.RequestT): Uint8Array {
  const builder = new flatbuffers.Builder();
  const requestOffset = requestObj.pack(builder);
  builder.finishSizePrefixed(requestOffset);
  return builder.asUint8Array();
}

interface IResponseEmitter {
  once(seq: string, listener: (data: GamiumProtocol.ResponseT) => void): EventEmitter;
}

class ResponseEmitter extends EventEmitter implements IResponseEmitter {}
