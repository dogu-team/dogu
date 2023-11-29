import { errorify } from '@dogu-tech/common';
import { Body, Controller, Headers, Post } from '@nestjs/common';
import { DoguLogger } from '../logger/logger';
import { PaddleNotificationService } from './paddle.notification.service';

@Controller('/paddle')
export class PaddleController {
  constructor(
    private readonly logger: DoguLogger,
    private readonly paddleNotificationService: PaddleNotificationService,
  ) {}

  @Post('/on-notification')
  async onNotification(@Headers('Paddle-Signature') paddleSignature: string, @Body() body: unknown): Promise<void> {
    try {
      await this.paddleNotificationService.onNotification(paddleSignature, body);
    } catch (e) {
      this.logger.error('Failed to handle paddle notification.', { error: errorify(e) });
      throw e;
    }
  }
}
