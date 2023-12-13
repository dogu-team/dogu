import { CloudLicenseEventMessage } from '@dogu-private/console';
import { PrefixLogger } from '@dogu-tech/common';
import { rawMessageToString, WebSocketClientFactory } from '@dogu-tech/node';
import { Injectable, OnModuleInit } from '@nestjs/common';
import EventEmitter from 'events';
import { env } from '../../../env';
import { DoguLogger } from '../../../module/logger/logger';
import { getBillingServerWebSocketUrl } from './common/utils';

const retryIntervalSeconds = 1;

export type CloudLicenseEventEmitter = EventEmitter & {
  on(event: 'message', listener: (message: CloudLicenseEventMessage) => void): void;
};

@Injectable()
export class CloudLicenseEventSubscriber implements OnModuleInit {
  readonly emitter: CloudLicenseEventEmitter = new EventEmitter();
  private readonly logger: PrefixLogger;

  constructor(doguLogger: DoguLogger) {
    this.logger = new PrefixLogger(doguLogger, CloudLicenseEventSubscriber.name);
  }

  onModuleInit(): void {
    this.subscribe();
  }

  private subscribe(): void {
    const baseUrl = getBillingServerWebSocketUrl();
    const url = `${baseUrl}/cloud-licenses/event?token=${env.DOGU_BILLING_TOKEN}`;
    const webSocket = new WebSocketClientFactory().create({ url });
    webSocket.on('message', (message) => {
      const eventMessage = JSON.parse(rawMessageToString(message)) as CloudLicenseEventMessage;
      this.emitter.emit('message', eventMessage);
    });
    webSocket.on('error', (error) => {
      this.logger.error(`websocket error occurred`, { error });
    });
    webSocket.on('close', (code, reason) => {
      this.logger.debug(`websocket closed. resubscribe after ${retryIntervalSeconds} seconds`, { code, reason });
      setTimeout(() => {
        this.subscribe();
      }, retryIntervalSeconds * 1000);
    });
  }
}
