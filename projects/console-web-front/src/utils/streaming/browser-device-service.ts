import {
  HttpRequest,
  HttpRequestParam,
  HttpRequestWebSocketResult,
  HttpResponse,
  WebSocketConnection,
  WebSocketMessage,
} from '@dogu-private/types';
import { SizePrefixedRecvQueue, Uint8ArrayUtil } from '@dogu-tech/common';
import {
  DeviceClientOptions,
  DeviceService,
  DeviceWebSocket,
  DeviceWebSocketListener,
} from '@dogu-tech/device-client-common';
import EventEmitter from 'events';

interface ResultEmitter {
  once(sequenceId: string, listener: (result: HttpRequestWebSocketResult) => void): EventEmitter;
}

class ResultEmitterImpl extends EventEmitter implements ResultEmitter {}

class ChannelInfo {
  sequenceId: number = 0;
  sendBuffer: Uint8Array[] = [];
  recvQueue = new SizePrefixedRecvQueue();
  resultEmitter = new ResultEmitterImpl();
  lastSendTimeMs = 0;
  flushTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    readonly channel: RTCDataChannel,
    readonly sendThrottleMs: number,
  ) {}

  requestFlushSendBuffer(): void {
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
    if (this.channel.readyState !== 'open') {
      if (this.flushTimer) {
        return;
      }
      this.flushTimer = setTimeout(() => {
        this.flushTimer = null;
        this.requestFlushSendBuffer();
      }, this.sendThrottleMs);
      return;
    }
    if (this.channel.onbufferedamountlow) {
      return;
    }
    let lastSendIndex = -1;
    this.sendBuffer.forEach((buf, index) => {
      if (this.channel.bufferedAmount > this.channel.bufferedAmountLowThreshold) {
        this.channel.onbufferedamountlow = () => {
          this.channel.onbufferedamountlow = null;
          this.requestFlushSendBuffer();
        };
        return;
      }
      this.channel.send(buf);
      lastSendIndex = index;
      this.lastSendTimeMs = Date.now();
    });
    if (lastSendIndex >= 0) {
      this.sendBuffer.splice(0, lastSendIndex + 1);
    }
    if (this.sendBuffer.length > 0) {
      this.requestFlushSendBuffer();
    }
  }
}

class BrowserDeviceWebSocket implements DeviceWebSocket {
  constructor(
    readonly name: string,
    private readonly channel: () => ChannelInfo | undefined,
    private readonly sendInternal: (message: WebSocketMessage) => void,
  ) {}

  send(message: string | Uint8Array): void {
    const channelInfo = this.channel();
    if (!channelInfo) {
      return;
    }
    this.sendInternal({
      value:
        typeof message === 'string'
          ? {
              $case: 'stringValue',
              stringValue: message,
            }
          : {
              $case: 'bytesValue',
              bytesValue: message,
            },
    });
  }

  close(code?: number, reason?: string): void {
    const channelInfo = this.channel();
    if (!channelInfo) {
      return;
    }
    const { channel } = channelInfo;
    if (channel.readyState !== 'open') {
      return;
    }
    channel.close();
  }
}

export class BrowserDeviceService implements DeviceService {
  private channels = new Map<string, ChannelInfo>();
  private get httpChannelName(): string {
    return 'device-server-http';
  }

  constructor(
    httpChannel: RTCDataChannel,
    readonly wsChannelCreator: (connection: WebSocketConnection) => {
      name: string;
      channel: RTCDataChannel;
    },
    readonly sendThrottleMs: number,
  ) {
    this.addChannel(this.httpChannelName, httpChannel);
  }

  private addChannel(name: string, channel: RTCDataChannel): void {
    const channelInfo = new ChannelInfo(channel, this.sendThrottleMs);
    this.channels.set(name, channelInfo);

    const { recvQueue, resultEmitter } = channelInfo;
    channel.addEventListener('message', (event) => {
      recvQueue.pushBuffer(new Uint8Array(event.data as ArrayBuffer));
      recvQueue.popLoop((array: Uint8Array) => {
        const result = HttpRequestWebSocketResult.decode(array);
        resultEmitter.emit(result.sequenceId.toString(), result);
      });
    });
  }

  private removeChannel(name: string): void {
    const channelInfo = this.channels.get(name);
    if (!channelInfo) {
      console.debug(`removeChannel: ${name} not found`);
      return;
    }
    const { channel } = channelInfo;
    if (channel.readyState !== 'closed') {
      channel.close();
    } else {
      console.debug(`removeChannel: ${name} is already closed`);
    }
    this.channels.delete(name);
  }

  private disconnect(): void {
    this.channels.forEach((channelInfo) => {
      const { channel } = channelInfo;
      if (channel.readyState !== 'closed') {
        channel.close();
      }
    });
    this.channels.clear();
  }

  private requestFlushSendBuffer(): void {
    this.channels.forEach((channelInfo) => {
      channelInfo.requestFlushSendBuffer();
    });
  }

  async httpRequest(request: HttpRequest, options: Required<DeviceClientOptions>): Promise<HttpResponse> {
    return new Promise((resolve, reject) => {
      const channelInfo = this.channels.get(this.httpChannelName);
      if (!channelInfo) {
        throw new Error('device http channel is not found');
      }

      const { sendBuffer, resultEmitter } = channelInfo;
      const sequenceId = channelInfo.sequenceId++;

      // timeout handle
      const timeout = setTimeout(() => {
        console.error(`DeviceServerBrowserService. request timeout: ${sequenceId}`);
        reject(new Error('device http request timeout'));
      }, options.timeout);

      // complete handle
      resultEmitter.once(sequenceId.toString(), (result: HttpRequestWebSocketResult) => {
        const clearAndReject = (message: string) => {
          clearTimeout(timeout);
          reject(new Error(message));
        };

        const { value } = result;
        if (value === undefined) {
          clearAndReject('request result value is undefined');
          return;
        }
        const { $case } = value;
        if ($case !== 'httpRequestResult') {
          clearAndReject(`request result is not HttpRequestResult: ${$case}`);
          return;
        }
        const { httpRequestResult } = value;
        const { value: httpRequestResultValue } = httpRequestResult;
        if (httpRequestResultValue === undefined) {
          clearAndReject('request result value is undefined');
          return;
        }
        const { $case: httpRequestResultCase } = httpRequestResultValue;
        if (httpRequestResultCase === 'error') {
          const { error } = httpRequestResultValue;
          const { code, message, details } = error;
          clearAndReject(`request error: ${code}, ${message}, ${details}`);
          return;
        }
        const { response } = httpRequestResultValue;
        console.debug(
          `DeviceServerBrowserService. request: ${sequenceId} responsed ${
            response.body?.value?.$case === 'stringValue'
              ? response.body?.value?.stringValue.length
              : response?.body?.value?.bytesValue.length
          }<< `,
        );
        clearTimeout(timeout);
        resolve(response);
      });

      // request
      const httpRequestParam = {
        sequenceId: sequenceId,
        request,
      };
      const buffers = Uint8ArrayUtil.prefixSizeAndSplitBuffer(HttpRequestParam.encode(httpRequestParam).finish());
      for (const buffer of buffers) {
        sendBuffer.push(buffer);
      }
      this.requestFlushSendBuffer();
      console.debug(`DeviceServerBrowserService. request: ${JSON.stringify(httpRequestParam).substring(0, 300)} >> `);
    });
  }

  connectWebSocket(
    connection: WebSocketConnection,
    options: Required<DeviceClientOptions>,
    listener?: DeviceWebSocketListener,
  ): DeviceWebSocket {
    console.log('connectWebSocket', connection.path);
    const { name, channel } = this.wsChannelCreator(connection);
    this.addChannel(name, channel);
    const channelInfo = this.channels.get(name);
    if (!channelInfo) {
      throw new Error('device websocket channel is not found');
    }
    const { sequenceId, sendBuffer, resultEmitter } = channelInfo;

    // timeout handle
    const openTimeout = setTimeout(() => {
      console.error(`DeviceServerBrowserService. websocket timeout: ${name}, ${sequenceId}`);
      this.removeChannel(name);
    }, options.timeout);

    // complete handle
    resultEmitter.on(sequenceId.toString(), (result: HttpRequestWebSocketResult) => {
      const clearAndRemove = (message: string) => {
        console.log(`DeviceServerBrowserService. close ${name}. ${message}`);
        clearTimeout(openTimeout);
        this.removeChannel(name);
      };

      const { value } = result;
      if (value === undefined) {
        clearAndRemove('websocket result value is undefined');
        return;
      }
      const { $case } = value;
      if ($case !== 'webSocketResult') {
        clearAndRemove(`websocket result is not WebSocketResult: ${$case}`);
        return;
      }
      const { webSocketResult } = value;
      const { value: webSocketResultValue } = webSocketResult;
      if (webSocketResultValue === undefined) {
        clearAndRemove('websocket result value is undefined');
        return;
      }
      const { $case: webSocketResultCase } = webSocketResultValue;
      if (webSocketResultCase === 'error') {
        const { error } = webSocketResultValue;
        const { code, message, details } = error;
        clearAndRemove(`websocket error: ${code}, ${message}, ${details}`);
        return;
      } else if (webSocketResultCase === 'openEvent') {
        const { openEvent } = webSocketResultValue;
        clearTimeout(openTimeout);
        listener?.onOpen?.(openEvent);
        return;
      } else if (webSocketResultCase === 'closeEvent') {
        const { closeEvent } = webSocketResultValue;
        clearAndRemove(`websocket close: ${closeEvent}`);
        listener?.onClose?.(closeEvent);
        return;
      } else if (webSocketResultCase === 'messageEvent') {
        const { messageEvent } = webSocketResultValue;
        listener?.onMessage?.(messageEvent);
        return;
      } else if (webSocketResultCase === 'errorEvent') {
        const { errorEvent } = webSocketResultValue;
        listener?.onError?.(errorEvent);
        return;
      }

      clearAndRemove(`websocket result is not WebSocketResult: ${$case}`);
    });

    const sendInternal = (message: WebSocketMessage) => {
      const buffers = Uint8ArrayUtil.prefixSizeAndSplitBuffer(WebSocketMessage.encode(message).finish());
      for (const buffer of buffers) {
        sendBuffer.push(buffer);
      }
      this.requestFlushSendBuffer();
    };
    return new BrowserDeviceWebSocket(
      name,
      () => {
        return this.channels.get(name);
      },
      sendInternal,
    );
  }
}
