import { CloudLicenseUpdateMessage, isBillingPlanSubscribing } from '@dogu-private/console';
import { assertUnreachable, closeWebSocketWithTruncateReason, errorify, transformAndValidate, WebSocketCode, WebSocketException } from '@dogu-tech/common';
import { rawMessageToString } from '@dogu-tech/node';
import { InjectDataSource } from '@nestjs/typeorm';
import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { DataSource } from 'typeorm';
import { WebSocket } from 'ws';
import { CloudLicense } from '../../db/entity/cloud-license.entity';
import { RetryTransaction } from '../../db/utils';
import { BillingTokenService } from '../billing-token/billing-token.service';
import { DoguLogger } from '../logger/logger';

@WebSocketGateway({ path: '/cloud-licenses/update' })
export class CloudLicenseUpdateGateway implements OnGatewayConnection {
  private readonly retryTransaction: RetryTransaction;

  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly billingTokenService: BillingTokenService,
  ) {
    this.retryTransaction = new RetryTransaction(this.logger, this.dataSource);
  }

  handleConnection(webSocket: WebSocket, incomingMessage: IncomingMessage): void {
    this.onOpen(webSocket, incomingMessage).catch((e) => {
      const error = errorify(e);
      this.logger.error('WebSocketException', { error });
      const code = error instanceof WebSocketException ? error.code : WebSocketCode.AbnormalClosure;
      closeWebSocketWithTruncateReason(webSocket, code, error.message);
    });
  }

  private async onOpen(webSocket: WebSocket, incomingMessage: IncomingMessage): Promise<void> {
    webSocket.on('message', (data) => {
      this.onMessage(webSocket, rawMessageToString(data)).catch((e) => {
        const error = errorify(e);
        this.logger.error(`${CloudLicenseUpdateGateway.name} onMessage failed`, { error });
      });
    });

    await this.billingTokenService.validateBillingApiTokenFromRequest(incomingMessage);
  }

  private async onMessage(webSocket: WebSocket, message: string): Promise<void> {
    const updateMessage = await transformAndValidate(CloudLicenseUpdateMessage, JSON.parse(message));
    await this.retryTransaction.serializable(async (context) => {
      const { manager } = context;
      const cloudLicense = await manager.getRepository(CloudLicense).findOne({
        where: {
          organizationId: updateMessage.organizationId,
        },
        relations: {
          billingOrganization: {
            billingPlanInfos: true,
          },
        },
      });

      if (!cloudLicense) {
        this.logger.error('Cloud license not found', { updateMessage });
        return;
      }

      if (!cloudLicense.billingOrganization) {
        this.logger.error('Billing organization not found', { updateMessage });
        return;
      }

      const { planType, usedSeconds } = updateMessage;
      const isSubscribing = isBillingPlanSubscribing(cloudLicense.billingOrganization, planType);
      if (isSubscribing) {
        return;
      }

      switch (planType) {
        case 'live-testing': {
          cloudLicense.liveTestingRemainingFreeSeconds -= usedSeconds;
          if (cloudLicense.liveTestingRemainingFreeSeconds < 0) {
            cloudLicense.liveTestingRemainingFreeSeconds = 0;
          }
          break;
        }
        case 'mobile-app-test-automation': {
          cloudLicense.mobileAppTestAutomationRemainingFreeSeconds -= usedSeconds;
          if (cloudLicense.mobileAppTestAutomationRemainingFreeSeconds < 0) {
            cloudLicense.mobileAppTestAutomationRemainingFreeSeconds = 0;
          }
          break;
        }
        case 'mobile-game-test-automation': {
          cloudLicense.mobileGameTestAutomationRemainingFreeSeconds -= usedSeconds;
          if (cloudLicense.mobileGameTestAutomationRemainingFreeSeconds < 0) {
            cloudLicense.mobileGameTestAutomationRemainingFreeSeconds = 0;
          }
          break;
        }
        case 'web-test-automation': {
          cloudLicense.webTestAutomationRemainingFreeSeconds -= usedSeconds;
          if (cloudLicense.webTestAutomationRemainingFreeSeconds < 0) {
            cloudLicense.webTestAutomationRemainingFreeSeconds = 0;
          }
          break;
        }
        case 'self-device-farm-browser':
        case 'self-device-farm-mobile': {
          throw new Error(`${planType} is not updatable`);
        }
        default: {
          assertUnreachable(planType);
        }
      }

      await manager.save(cloudLicense);
    });
  }
}
