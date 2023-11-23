import { BadRequestException, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { DoguLogger } from '../logger/logger';
import { Paddle } from './paddle.types';

/**
 * TODO: move to env
 */
const paddleNotificationKey = 'pdl_ntfset_01hfvf6np93stpzgg99tzqh67f_vP5ukftxMEHcQtReFTbhVMCRBXPVLejU';

/**
 * @see https://developer.paddle.com/webhooks/overview
 */
@Injectable()
export class PaddleNotificationService {
  constructor(private readonly logger: DoguLogger) {}

  async onNotification(paddleSignature: string, body: unknown): Promise<unknown> {
    if (!paddleSignature) {
      this.logger.error('Paddle-Signature header is missing');
      throw new BadRequestException('Paddle-Signature header is missing');
    }

    if (typeof paddleSignature !== 'string') {
      this.logger.error('Paddle-Signature header is not a string');
      throw new BadRequestException('Paddle-Signature header is not a string');
    }

    const [timestampKeyValue, signatureKeyValue] = paddleSignature.split(';') as (string | undefined)[];
    if (!timestampKeyValue || !signatureKeyValue) {
      this.logger.error('Paddle-Signature header is malformed', { paddleSignature });
      throw new BadRequestException('Paddle-Signature header is malformed');
    }

    const [timestampKey, timestamp] = timestampKeyValue.split('=') as (string | undefined)[];
    const [signatureKey, signature] = signatureKeyValue.split('=') as (string | undefined)[];
    if (!timestampKey || !timestamp || !signatureKey || !signature) {
      this.logger.error('Paddle-Signature header is malformed', { paddleSignature });
      throw new BadRequestException('Paddle-Signature header is malformed');
    }

    if (typeof body !== 'object') {
      this.logger.error('Request body is not a object', { body });
      throw new BadRequestException('Request body is not a object');
    }

    const signedPayload = `${timestamp}:${JSON.stringify(body)}`;
    const expectedSignature = crypto.createHmac('sha256', paddleNotificationKey).update(signedPayload).digest('hex');
    if (signature !== expectedSignature) {
      this.logger.error('Paddle-Signature header is invalid', { paddleSignature });
      throw new BadRequestException('Paddle-Signature header is invalid');
    }

    this.logger.info('Paddle notification received', { body });

    const event = body as Paddle.Event;
    if (event.event_type === 'transaction.completed') {
      return await this.onTransactionCompleted(event);
    }
  }

  private async onTransactionCompleted(event: Paddle.Event): Promise<void> {
    // TODO: write billing history
  }
}
