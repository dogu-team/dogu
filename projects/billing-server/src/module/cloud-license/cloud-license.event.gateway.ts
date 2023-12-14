import { CloudLicenseEventMessage } from '@dogu-private/console';
import { closeWebSocketWithTruncateReason, errorify, WebSocketCode, WebSocketException } from '@dogu-tech/common';
import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';
import { CloudLicense } from '../../db/entity/cloud-license.entity';
import { Message } from '../../db/utils';
import { BillingTokenService } from '../billing-token/billing-token.service';
import { DoguLogger } from '../logger/logger';
import { CloudLicenseSubscriber } from './cloud-license.subscriber';

@WebSocketGateway({ path: '/cloud-licenses/event' })
export class CloudLicenseEventGateway implements OnGatewayConnection {
  constructor(
    private readonly logger: DoguLogger,
    private readonly billingTokenService: BillingTokenService,
    private readonly cloudLicenseSubscriber: CloudLicenseSubscriber,
  ) {}

  handleConnection(webSocket: WebSocket, incomingMessage: IncomingMessage): void {
    this.onOpen(webSocket, incomingMessage).catch((e) => {
      const error = errorify(e);
      this.logger.error('WebSocketException', { error });
      const code = error instanceof WebSocketException ? error.code : WebSocketCode.AbnormalClosure;
      closeWebSocketWithTruncateReason(webSocket, code, error.message);
    });
  }

  private async onOpen(webSocket: WebSocket, incomingMessage: IncomingMessage): Promise<void> {
    await this.billingTokenService.validateBillingApiTokenFromRequest(incomingMessage);

    const handler = (message: Message<CloudLicense>): void => {
      if (webSocket.readyState !== WebSocket.OPEN) {
        return;
      }

      const eventMessage: CloudLicenseEventMessage = {
        cloudLicenseId: message.data.cloudLicenseId,
        organizationId: message.data.organizationId,
        liveTestingRemainingFreeSeconds: message.data.liveTestingRemainingFreeSeconds,
        liveTestingParallelCount: message.data.liveTestingParallelCount,
        webTestAutomationRemainingFreeSeconds: message.data.webTestAutomationRemainingFreeSeconds,
        webTestAutomationParallelCount: message.data.webTestAutomationParallelCount,
        mobileAppTestAutomationRemainingFreeSeconds: message.data.mobileAppTestAutomationRemainingFreeSeconds,
        mobileAppTestAutomationParallelCount: message.data.mobileAppTestAutomationParallelCount,
        mobileGameTestAutomationRemainingFreeSeconds: message.data.mobileGameTestAutomationRemainingFreeSeconds,
        mobileGameTestAutomationParallelCount: message.data.mobileGameTestAutomationParallelCount,
        selfDeviceBrowserCount: message.data.selfDeviceBrowserCount,
        selfDeviceMobileCount: message.data.selfDeviceMobileCount,
      };
      webSocket.send(JSON.stringify(eventMessage));
    };

    webSocket.addEventListener('close', () => {
      this.cloudLicenseSubscriber.emitter.off('message', handler);
    });
    this.cloudLicenseSubscriber.emitter.on('message', handler);
  }
}
