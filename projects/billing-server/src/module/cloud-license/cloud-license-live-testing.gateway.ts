import { CloudLicenseMessage } from '@dogu-private/console';
import { closeWebSocketWithTruncateReason, errorify, transformAndValidate, WebSocketCode } from '@dogu-tech/common';
import { rawToString } from '@dogu-tech/node';
import { InjectDataSource } from '@nestjs/typeorm';
import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { DataSource } from 'typeorm';
import { WebSocket } from 'ws';
import { CloudLicense } from '../../db/entity/cloud-license.entity';
import { retrySerialize } from '../../db/utils';
import { BillingTokenService } from '../billing-token/billing-token.service';
import { DoguLogger } from '../logger/logger';

@WebSocketGateway({ path: '/cloud-licenses/live-testing' })
export class CloudLicenseLiveTestingGateway implements OnGatewayConnection {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly billingTokenService: BillingTokenService,
    private readonly logger: DoguLogger,
  ) {}

  handleConnection(webSocket: WebSocket, incomingMessage: IncomingMessage): void {
    this.billingTokenService.validateBillingApiTokenFromRequest(incomingMessage).catch((error) => {
      this.logger.error('Failed to validate billing api token', { error: errorify(error) });
      closeWebSocketWithTruncateReason(webSocket, WebSocketCode.Unauthorized, 'Failed to validate billing api token');
    });

    webSocket.on('message', (data) => {
      (async (): Promise<void> => {
        const sendMessage = await transformAndValidate(CloudLicenseMessage.LiveTestingSend, JSON.parse(rawToString(data)));
        const remainingFreeSeconds = await retrySerialize(this.logger, this.dataSource, async (manager) => {
          const cloudLicense = await manager.getRepository(CloudLicense).findOne({
            where: {
              cloudLicenseId: sendMessage.cloudLicenseId,
            },
            lock: {
              mode: 'pessimistic_write',
            },
          });

          if (!cloudLicense) {
            this.logger.error('Cloud license not found', { sendMessage });
            return;
          }

          if (cloudLicense.liveTestingRemainingFreeSeconds <= 0) {
            return cloudLicense.liveTestingRemainingFreeSeconds;
          }

          if (sendMessage.usedFreeSeconds === null) {
            return cloudLicense.liveTestingRemainingFreeSeconds;
          }

          cloudLicense.liveTestingRemainingFreeSeconds -= sendMessage.usedFreeSeconds;
          const result = await manager.getRepository(CloudLicense).save(cloudLicense);
          return result.liveTestingRemainingFreeSeconds;
        });

        if (remainingFreeSeconds === undefined) {
          return;
        }

        const receiveMessage: CloudLicenseMessage.LiveTestingReceive = {
          cloudLicenseId: sendMessage.cloudLicenseId,
          expired: remainingFreeSeconds <= 0,
          remainingFreeSeconds,
        };
        webSocket.send(JSON.stringify(receiveMessage));
      })().catch((error) => {
        this.logger.error('Failed to update live testing free seconds', { error: errorify(error) });
      });
    });
  }
}
