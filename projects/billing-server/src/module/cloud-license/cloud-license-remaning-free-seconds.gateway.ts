import { CloudLicenseMessage } from '@dogu-private/console';
import { errorify, transformAndValidate } from '@dogu-tech/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { DataSource } from 'typeorm';
import { WebSocket } from 'ws';
import { CloudLicense } from '../../db/entity/cloud-license.entity';
import { retrySerialize } from '../../db/utils';
import { DoguLogger } from '../logger/logger';

@WebSocketGateway({ path: '/cloud-license/remaining-free-seconds' })
export class CloudLicenseRemainingFreeSecondsGateway implements OnGatewayConnection {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly logger: DoguLogger,
  ) {}

  handleConnection(webSocket: WebSocket, incomingMessage: IncomingMessage): void {
    webSocket.on('message', (data) => {
      (async (): Promise<void> => {
        const sendMessage = await transformAndValidate(CloudLicenseMessage.RemainingFreeSecondsSend, JSON.parse(data.toString()));
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

          if (cloudLicense.remainingFreeSeconds <= 0) {
            return cloudLicense.remainingFreeSeconds;
          }

          cloudLicense.remainingFreeSeconds -= sendMessage.seconds;
          const result = await manager.getRepository(CloudLicense).save(cloudLicense);
          return result.remainingFreeSeconds;
        });

        if (remainingFreeSeconds === undefined) {
          return;
        }

        const receiveMessage: CloudLicenseMessage.RemainingFreeSecondsReceive = {
          cloudLicenseId: sendMessage.cloudLicenseId,
          expired: remainingFreeSeconds <= 0,
          remainingFreeSeconds,
        };
        webSocket.send(JSON.stringify(receiveMessage));
      })().catch((error) => {
        this.logger.error('Failed to decrease remaining free seconds', { error: errorify(error) });
      });
    });
  }
}
