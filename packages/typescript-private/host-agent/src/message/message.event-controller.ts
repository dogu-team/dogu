import {
  CancelDeviceJob,
  RunDeviceJob,
  WebSocketProxyConnect,
  WebSocketProxySend,
  WebSocketProxySendClose,
  WebSocketProxySendMessage,
  WebSocketProxySendValue,
} from '@dogu-private/console-host-agent';
import { errorify } from '@dogu-tech/common';
import { Controller } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Ctx, Payload } from '@nestjs/microservices';
import { WebSocketProxyProcessRegistry } from '../http-ws-proxy/web-socket-proxy.process-registry';
import { DoguLogger } from '../logger/logger';
import { MessageContext } from '../message/message.types';
import { DeviceJobStepProcessor } from '../processor/device-job-step.processor';
import { OnConsoleMessage } from '../types';

@Controller()
export class MessageEventController {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly deviceJobStepProcessor: DeviceJobStepProcessor,
    private readonly webSocketProxyProcessRegistry: WebSocketProxyProcessRegistry,
    private readonly logger: DoguLogger,
  ) {}

  @OnConsoleMessage(WebSocketProxySend)
  onWebSocketProxySend(@Payload() param: WebSocketProxySend, @Ctx() context: MessageContext): void {
    const { value } = param;
    const { router } = context;
    Promise.resolve(router.route<WebSocketProxySendValue, void>(value, context)).catch((error) => {
      this.logger.error('Failed to route WebSocketProxySend', { error: errorify(error) });
    });
  }

  @OnConsoleMessage(RunDeviceJob)
  onRunDeviceJob(@Payload() param: RunDeviceJob, @Ctx() context: MessageContext): void {
    this.deviceJobStepProcessor.onRunDeviceJob(param, context).catch((error) => {
      this.logger.error('Failed to run device job', { error: errorify(error) });
    });
  }

  @OnConsoleMessage(CancelDeviceJob)
  onCancelDeviceJob(@Payload() param: CancelDeviceJob, @Ctx() context: MessageContext): void {
    this.deviceJobStepProcessor.onCancelDeviceJob(param, context).catch((error) => {
      this.logger.error('Failed to cancel device job', { error: errorify(error) });
    });
  }

  @OnConsoleMessage(WebSocketProxyConnect)
  onWebSocketProxyConnect(@Payload() param: WebSocketProxyConnect, @Ctx() context: MessageContext): void {
    this.webSocketProxyProcessRegistry.connect(param, context).catch((error) => {
      this.logger.error('Failed to connect to WebSocketProxy', { error: errorify(error) });
    });
  }

  @OnConsoleMessage(WebSocketProxySendMessage)
  onWebSocketProxySendMessage(@Payload() param: WebSocketProxySendMessage, @Ctx() context: MessageContext): void {
    this.webSocketProxyProcessRegistry.sendMessage(param, context);
  }

  @OnConsoleMessage(WebSocketProxySendClose)
  onWebSocketProxySendClose(@Payload() param: WebSocketProxySendClose, @Ctx() context: MessageContext): void {
    this.webSocketProxyProcessRegistry.close(param, context);
  }
}
